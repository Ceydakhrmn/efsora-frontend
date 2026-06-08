import { Client, type IFrame, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  recipientId?: number;
  actionUrl?: string;
  read: boolean;
  timestamp: string;
}

export type NotificationCallback = (notification: WebSocketNotification) => void;

export interface WebSocketDebugSnapshot {
  connected: boolean;
  active: boolean;
  pendingConnect: boolean;
  callbacks: number;
  subscriptions: number;
  lastConnectedAt: number | null;
  lastDisconnectedAt: number | null;
  lastMessageAt: number | null;
  lastError: string | null;
}

class WebSocketService {
  private stompClient: Client | null = null;
  private notificationCallbacks = new Set<NotificationCallback>();
  private stompSubscriptions: StompSubscription[] = [];
  private connectPromise: Promise<void> | null = null;
  private connected = false;
  private lastConnectedAt: number | null = null;
  private lastDisconnectedAt: number | null = null;
  private lastMessageAt: number | null = null;
  private lastError: string | null = null;

  private sockJsUrl = import.meta.env.VITE_SOCKJS_URL ||
    (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') + '/ws' : 'http://localhost:8081/ws');

  constructor() {
    this.setupClient();
  }

  private setupClient() {
    this.stompClient = new Client({
      // SockJS endpoint must use http(s), not ws(s).
      webSocketFactory: () => new SockJS(this.sockJsUrl),
      reconnectDelay: 3000,
      beforeConnect: async () => {
        if (this.stompClient) {
          this.stompClient.connectHeaders = {
            Authorization: `Bearer ${this.getToken()}`,
          };
        }
      },
      connectHeaders: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      onConnect: () => this.onConnect(),
      onDisconnect: () => this.onDisconnect(),
      onStompError: (frame) => this.onError(frame),
      onWebSocketClose: () => {
        this.connected = false;
      },
      debug: (msg) => {
        if (import.meta.env.DEV) console.log('[WebSocket]', msg);
      },
    });
  }

  public connect(): Promise<void> {
    if (this.connected && this.stompClient?.active) {
      return Promise.resolve();
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    if (!this.stompClient) {
      this.setupClient();
    }

    const client = this.stompClient;
    if (!client) {
      return Promise.reject(new Error('WebSocket client not initialized'));
    }

    this.connectPromise = new Promise((resolve, reject) => {
      const originalOnConnect = client.onConnect;
      const originalOnError = client.onStompError;

      client.onConnect = (frame) => {
        originalOnConnect?.(frame);
        client.onConnect = originalOnConnect;
        client.onStompError = originalOnError;
        this.connectPromise = null;
        resolve();
      };

      client.onStompError = (frame: IFrame) => {
        originalOnError?.(frame);
        client.onConnect = originalOnConnect;
        client.onStompError = originalOnError;
        this.connectPromise = null;
        reject(frame);
      };

      if (!client.active) {
        client.activate();
      } else if (this.connected) {
        this.connectPromise = null;
        resolve();
      }
    });

    return this.connectPromise;
  }

  private onConnect() {
    this.connected = true;
    this.lastConnectedAt = Date.now();
    this.lastError = null;
    if (import.meta.env.DEV) console.log('[WebSocket] connected');

    this.clearStompSubscriptions();

    // Subscribe to broadcast notifications
    if (this.stompClient) {
      const broadcastSubscription = this.stompClient.subscribe('/topic/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body) as WebSocketNotification;
          this.notifyCallbacks(notification);
        } catch (error) {
          console.error('Invalid notification payload:', error);
        }
      });
      this.stompSubscriptions.push(broadcastSubscription);

      // Subscribe to user-specific notifications
      const userSubscription = this.stompClient.subscribe('/user/queue/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body) as WebSocketNotification;
          this.notifyCallbacks(notification);
        } catch (error) {
          console.error('Invalid user notification payload:', error);
        }
      });
      this.stompSubscriptions.push(userSubscription);
    }
  }

  private onDisconnect() {
    this.connected = false;
    this.lastDisconnectedAt = Date.now();
    this.clearStompSubscriptions();
    if (import.meta.env.DEV) console.log('[WebSocket] disconnected');
  }

  private onError(frame: IFrame) {
    this.lastError = frame.headers.message || 'stomp_error';
    console.error('WebSocket error:', frame);
  }

  private getToken(): string {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    return token || '';
  }

  public disconnect() {
    if (this.notificationCallbacks.size > 0) {
      return;
    }

    this.connectPromise = null;
    this.clearStompSubscriptions();

    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }

  public subscribe(callback: NotificationCallback) {
    this.notificationCallbacks.add(callback);
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  private notifyCallbacks(notification: WebSocketNotification) {
    this.lastMessageAt = Date.now();
    this.notificationCallbacks.forEach((callback) => callback(notification));
  }

  private clearStompSubscriptions() {
    this.stompSubscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch {
        // Ignore stale subscriptions during reconnect/disconnect transitions.
      }
    });
    this.stompSubscriptions = [];
  }

  public isConnected(): boolean {
    return this.connected && (this.stompClient?.active ?? false);
  }

  public getDebugSnapshot(): WebSocketDebugSnapshot {
    return {
      connected: this.connected,
      active: this.stompClient?.active ?? false,
      pendingConnect: this.connectPromise !== null,
      callbacks: this.notificationCallbacks.size,
      subscriptions: this.stompSubscriptions.length,
      lastConnectedAt: this.lastConnectedAt,
      lastDisconnectedAt: this.lastDisconnectedAt,
      lastMessageAt: this.lastMessageAt,
      lastError: this.lastError,
    };
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
