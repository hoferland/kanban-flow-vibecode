import { Card } from '../types';

export interface WsConfig {
  host: string;
  port: number;
}

export type WsMessageType = 'card_created' | 'card_updated' | 'card_deleted' | 'full_sync' | 'ping' | 'pong';

export interface WsMessage {
  type: WsMessageType;
  payload: Card | { id: number } | Card[];
}

export type WsMessageHandler = (message: WsMessage) => void;

const DEFAULT_CONFIG: WsConfig = {
  host: 'localhost',
  port: 9899, // Same port as HTTP, /ws endpoint
};

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WsConfig;
  private handlers: Set<WsMessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private isManualClose = false;

  constructor(config: WsConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `ws://${this.config.host}:${this.config.port}/ws`;

      try {
        this.ws = new WebSocket(url);
        this.isManualClose = false;

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WsMessage = JSON.parse(event.data);
            this.handlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(() => {
        // Will retry via onclose handler
      });
    }, delay);
  }

  disconnect() {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  onMessage(handler: WsMessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(message: WsMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  ping() {
    this.send({ type: 'ping', payload: {} as Card });
  }
}

// Singleton instance for the widget
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(config?: WsConfig): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(config);
  }
  return wsClient;
}
