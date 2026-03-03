// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod figma_sync;

// Global runtime for async operations
static RUNTIME: once_cell::sync::Lazy<tokio::runtime::Runtime> = once_cell::sync::Lazy::new(|| {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("Failed to create Tokio runtime")
});

// Tauri commands for Figma sync server control

#[tauri::command]
fn start_figma_sync_server(port: Option<u16>) -> Result<String, String> {
    let port = port.unwrap_or(9899);

    RUNTIME.block_on(async {
        match figma_sync::start_server(port).await {
            Ok(_) => Ok(format!("Server started on port {}", port)),
            Err(e) => Err(e),
        }
    })
}

#[tauri::command]
fn stop_figma_sync_server() -> Result<String, String> {
    RUNTIME.block_on(async {
        match figma_sync::stop_server().await {
            Ok(_) => Ok("Server stopped".to_string()),
            Err(e) => Err(e),
        }
    })
}

#[tauri::command]
fn get_figma_sync_status() -> Result<serde_json::Value, String> {
    RUNTIME.block_on(async {
        let state = figma_sync::SERVER_STATE.read().await;
        match &*state {
            Some(server_state) => {
                let client_count = server_state.ws_state.get_client_count().await;
                Ok(serde_json::json!({
                    "running": true,
                    "port": server_state.port,
                    "connectedClients": client_count
                }))
            }
            None => Ok(serde_json::json!({
                "running": false,
                "port": null,
                "connectedClients": 0
            })),
        }
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_figma_sync_server,
            stop_figma_sync_server,
            get_figma_sync_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
