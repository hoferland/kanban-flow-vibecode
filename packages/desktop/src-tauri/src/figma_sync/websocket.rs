use axum::extract::ws::{Message, WebSocket};
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};

use super::routes::Card;

/// Message types sent over WebSocket
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum WsMessage {
    #[serde(rename = "card_created")]
    CardCreated(Card),
    #[serde(rename = "card_updated")]
    CardUpdated(Card),
    #[serde(rename = "card_deleted")]
    CardDeleted { id: i64 },
    #[serde(rename = "full_sync")]
    FullSync(Vec<Card>),
    #[serde(rename = "ping")]
    Ping,
    #[serde(rename = "pong")]
    Pong,
}

/// State for managing WebSocket connections
pub struct WebSocketState {
    pub tx: broadcast::Sender<WsMessage>,
    pub connected_clients: RwLock<u32>,
}

impl WebSocketState {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(100);
        Self {
            tx,
            connected_clients: RwLock::new(0),
        }
    }

    pub fn broadcast_card_created(&self, card: &Card) {
        let _ = self.tx.send(WsMessage::CardCreated(card.clone()));
    }

    pub fn broadcast_card_updated(&self, card: &Card) {
        let _ = self.tx.send(WsMessage::CardUpdated(card.clone()));
    }

    pub fn broadcast_card_deleted(&self, id: i64) {
        let _ = self.tx.send(WsMessage::CardDeleted { id });
    }

    pub async fn get_client_count(&self) -> u32 {
        *self.connected_clients.read().await
    }
}

/// Handle a WebSocket connection
pub async fn handle_socket(socket: WebSocket, state: Arc<WebSocketState>) {
    // Increment client count
    {
        let mut count = state.connected_clients.write().await;
        *count += 1;
        println!("WebSocket client connected. Total: {}", *count);
    }

    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();

    // Task to send broadcast messages to this client
    let send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if let Ok(json) = serde_json::to_string(&msg) {
                if sender.send(Message::Text(json)).await.is_err() {
                    break;
                }
            }
        }
    });

    // Task to receive messages from client
    let _state_clone = state.clone();
    let recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(text) => {
                    if let Ok(ws_msg) = serde_json::from_str::<WsMessage>(&text) {
                        match ws_msg {
                            WsMessage::Ping => {
                                // Client sent ping, we already handle pong in broadcast
                            }
                            _ => {
                                // Handle other client messages if needed
                            }
                        }
                    }
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = send_task => {},
        _ = recv_task => {},
    }

    // Decrement client count
    {
        let mut count = state.connected_clients.write().await;
        *count = count.saturating_sub(1);
        println!("WebSocket client disconnected. Total: {}", *count);
    }
}
