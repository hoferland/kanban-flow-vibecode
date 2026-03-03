pub mod server;
pub mod routes;
pub mod websocket;

use std::sync::Arc;
use tokio::sync::RwLock;

pub use server::{start_server, stop_server, ServerState};

/// Global server state shared across the application
pub static SERVER_STATE: once_cell::sync::Lazy<Arc<RwLock<Option<ServerState>>>> =
    once_cell::sync::Lazy::new(|| Arc::new(RwLock::new(None)));
