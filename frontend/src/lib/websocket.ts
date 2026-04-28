import { Client } from '@stomp/stompjs';
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

  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  constructor() {
    this.setupClient();
  }

  private setupClient() {
    const wsUrl = this.apiUrl.replace('http', 'ws') + '/ws';
    const socket = new SockJS(wsUrl);
    
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      onConnect: () => this.onConnect(),
      onDisconnect: () => this.onDisconnect(),
      onStompError: (frame) => this.onError(frame),
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

      const onConnectHandler = () => {
        this.onConnect();
        resolve();
      };

      const onErrorHandler = (frame: any) => {
        reject(frame);
      };

      if (this.stompClient) {
        this.stompClient.onConnect = onConnectHandler;
        this.stompClient.onStompError = onErrorHandler;
        this.stompClient.activate();
      }
    });
  }

  private onConnect() {
    this.connected = true;
    console.log('WebSocket connected');

    // Subscribe to broadcast notifications
    if (this.stompClient) {
      this.stompClient.subscribe('/topic/notifications', (message) => {
        const notification = JSON.parse(message.body) as WebSocketNotification;
        this.notifyCallbacks(notification);
      });

      // Subscribe to user-specific notifications
      this.stompClient.subscribe('/user/queue/notifications', (message) => {
        const notification = JSON.parse(message.body) as WebSocketNotification;
        this.notifyCallbacks(notification);
      });
    }
  }

  private onDisconnect() {
    this.connected = false;
    console.log('WebSocket disconnected');
  }

  private onError(frame: any) {
    console.error('WebSocket error:', frame);
  }

  private getToken(): string {
    const token = localStorage.getItem('auth_token');
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
