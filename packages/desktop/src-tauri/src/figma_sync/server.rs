use axum::{
    routing::{get, post, put, delete},
    Router,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

use super::routes;
use super::websocket::WebSocketState;

/// Server state for managing the HTTP server lifecycle
pub struct ServerState {
    pub shutdown_handle: Option<tokio::task::JoinHandle<()>>,
    pub ws_state: Arc<WebSocketState>,
    pub port: u16,
}

/// Start the Figma sync HTTP server
pub async fn start_server(port: u16) -> Result<Arc<WebSocketState>, String> {
    // Check if server is already running
    {
        let state = super::SERVER_STATE.read().await;
        if state.is_some() {
            return Err("Server already running".to_string());
        }
    }

    // Create WebSocket state for broadcasting
    let ws_state = Arc::new(WebSocketState::new());
    let ws_state_clone = ws_state.clone();

    // CORS layer - must allow any origin for Figma widget (null origin)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router with all routes
    let app = Router::new()
        .route("/api/health", get(routes::health_check))
        .route("/api/cards", get(routes::get_cards))
        .route("/api/cards", post(routes::create_card))
        .route("/api/cards/:id", get(routes::get_card))
        .route("/api/cards/:id", put(routes::update_card))
        .route("/api/cards/:id", delete(routes::delete_card))
        .route("/api/columns", get(routes::get_columns))
        .route("/api/attributes", get(routes::get_attributes))
        .route("/ws", get(routes::websocket_handler))
        .layer(cors)
        .with_state(ws_state_clone.clone());

    let addr = SocketAddr::from(([127, 0, 0, 1], port));

    // Create the TCP listener
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .map_err(|e| format!("Failed to bind to port {}: {}", port, e))?;

    println!("Figma sync server starting on http://127.0.0.1:{}", port);

    // Spawn server task
    let handle = tokio::spawn(async move {
        if let Err(e) = axum::serve(listener, app).await {
            eprintln!("Figma sync server error: {}", e);
        }
    });

    // Store server state
    let state = ServerState {
        shutdown_handle: Some(handle),
        ws_state: ws_state_clone,
        port,
    };

    *super::SERVER_STATE.write().await = Some(state);

    println!("Figma sync server started on http://127.0.0.1:{}", port);

    Ok(ws_state)
}

/// Stop the Figma sync server
pub async fn stop_server() -> Result<(), String> {
    let mut state_guard = super::SERVER_STATE.write().await;

    if let Some(mut state) = state_guard.take() {
        if let Some(handle) = state.shutdown_handle.take() {
            handle.abort();
            println!("Figma sync server stopped");
        }
        Ok(())
    } else {
        Err("Server not running".to_string())
    }
}
