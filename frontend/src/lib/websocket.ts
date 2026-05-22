import { Client, type IFrame } from '@stomp/stompjs';
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

class WebSocketService {
  private stompClient: Client | null = null;
  private notificationCallbacks: NotificationCallback[] = [];
  private connected = false;

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
    return new Promise((resolve, reject) => {
      if (this.connected && this.stompClient?.active) {
        resolve();
        return;
      }

      if (!this.stompClient) {
        this.setupClient();
      }

      const client = this.stompClient;
      if (!client) {
        reject(new Error('WebSocket client not initialized'));
        return;
      }

      const originalOnConnect = client.onConnect;
      const originalOnError = client.onStompError;

      client.onConnect = (frame) => {
        originalOnConnect?.(frame);
        client.onConnect = originalOnConnect;
        client.onStompError = originalOnError;
        resolve();
      };

      client.onStompError = (frame: IFrame) => {
        originalOnError?.(frame);
        client.onConnect = originalOnConnect;
        client.onStompError = originalOnError;
        reject(frame);
      };

      if (!client.active) {
        client.activate();
      } else if (this.connected) {
        resolve();
      }
    });
  }

  private onConnect() {
    this.connected = true;
    console.log('WebSocket connected');

    // Subscribe to broadcast notifications
    if (this.stompClient) {
      this.stompClient.subscribe('/topic/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body) as WebSocketNotification;
          this.notifyCallbacks(notification);
        } catch (error) {
          console.error('Invalid notification payload:', error);
        }
      });

      // Subscribe to user-specific notifications
      this.stompClient.subscribe('/user/queue/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body) as WebSocketNotification;
          this.notifyCallbacks(notification);
        } catch (error) {
          console.error('Invalid user notification payload:', error);
        }
      });
    }
  }

  private onDisconnect() {
    this.connected = false;
    console.log('WebSocket disconnected');
  }

  private onError(frame: IFrame) {
    console.error('WebSocket error:', frame);
  }

  private getToken(): string {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    return token || '';
  }

  public disconnect() {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }

  public subscribe(callback: NotificationCallback) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyCallbacks(notification: WebSocketNotification) {
    this.notificationCallbacks.forEach((callback) => callback(notification));
  }

  public isConnected(): boolean {
    return this.connected && (this.stompClient?.active ?? false);
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
