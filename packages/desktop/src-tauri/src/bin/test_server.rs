// Standalone test server for Figma sync API
// Run with: cargo run --bin test-server

use axum::{
    routing::{get, post, put, delete},
    Router,
    extract::{Path, Query, State},
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Card {
    pub id: i64,
    pub title: String,
    pub area: String,
    #[serde(rename = "type")]
    pub card_type: Option<String>,
    pub notes: String,
    pub column: String,
    pub position: i32,
    #[serde(rename = "dueDate")]
    pub due_date: Option<i64>,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Column {
    pub id: String,
    pub label: String,
    pub position: i32,
    #[serde(rename = "wipLimit")]
    pub wip_limit: Option<i32>,
    pub color: Option<String>,
    #[serde(rename = "isActive")]
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attribute {
    pub id: String,
    #[serde(rename = "type")]
    pub attr_type: String,
    pub label: String,
    pub position: i32,
    pub color: Option<String>,
    #[serde(rename = "isActive")]
    pub is_active: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateCardRequest {
    pub title: String,
    pub area: String,
    #[serde(rename = "type")]
    pub card_type: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCardRequest {
    pub title: Option<String>,
    pub area: Option<String>,
    #[serde(rename = "type")]
    pub card_type: Option<String>,
    pub column: Option<String>,
    pub position: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct AttributeQuery {
    #[serde(rename = "type")]
    pub attr_type: Option<String>,
}

type AppState = Arc<RwLock<Vec<Card>>>;

fn get_columns() -> Vec<Column> {
    vec![
        Column { id: "inbox".to_string(), label: "Inbox".to_string(), position: 0, wip_limit: None, color: None, is_active: true },
        Column { id: "next".to_string(), label: "Next".to_string(), position: 1, wip_limit: None, color: None, is_active: true },
        Column { id: "in-progress".to_string(), label: "In Progress".to_string(), position: 2, wip_limit: Some(3), color: None, is_active: true },
        Column { id: "waiting".to_string(), label: "Waiting".to_string(), position: 3, wip_limit: None, color: None, is_active: true },
        Column { id: "done".to_string(), label: "Done".to_string(), position: 4, wip_limit: None, color: None, is_active: true },
    ]
}

fn get_areas() -> Vec<Attribute> {
    vec![
        Attribute { id: "team-a".to_string(), attr_type: "area".to_string(), label: "SD Team".to_string(), position: 0, color: Some("#d4e4f0".to_string()), is_active: true },
        Attribute { id: "team-b".to_string(), attr_type: "area".to_string(), label: "TM Team".to_string(), position: 1, color: Some("#d4e8d4".to_string()), is_active: true },
        Attribute { id: "cross-team".to_string(), attr_type: "area".to_string(), label: "Cross-team".to_string(), position: 2, color: Some("#f0dcc8".to_string()), is_active: true },
        Attribute { id: "other".to_string(), attr_type: "area".to_string(), label: "Other".to_string(), position: 3, color: Some("#e8e4db".to_string()), is_active: true },
    ]
}

fn get_types() -> Vec<Attribute> {
    vec![
        Attribute { id: "discovery".to_string(), attr_type: "type".to_string(), label: "Discovery".to_string(), position: 0, color: None, is_active: true },
        Attribute { id: "design".to_string(), attr_type: "type".to_string(), label: "Design".to_string(), position: 1, color: None, is_active: true },
        Attribute { id: "support".to_string(), attr_type: "type".to_string(), label: "Support".to_string(), position: 2, color: None, is_active: true },
    ]
}

#[tokio::main]
async fn main() {
    let now = chrono::Utc::now().timestamp_millis();
    let initial_cards = vec![
        Card {
            id: now,
            title: "Sample card from Flow".to_string(),
            area: "team-a".to_string(),
            card_type: Some("design".to_string()),
            notes: "This is synced from Flow Kanban".to_string(),
            column: "inbox".to_string(),
            position: 0,
            due_date: None,
            created_at: now,
            updated_at: now,
        },
        Card {
            id: now + 1,
            title: "Another test card".to_string(),
            area: "team-b".to_string(),
            card_type: Some("discovery".to_string()),
            notes: "Testing bidirectional sync".to_string(),
            column: "next".to_string(),
            position: 0,
            due_date: None,
            created_at: now,
            updated_at: now,
        },
    ];

    let state: AppState = Arc::new(RwLock::new(initial_cards));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/cards", get(list_cards))
        .route("/api/cards", post(create_card))
        .route("/api/cards/:id", get(get_card))
        .route("/api/cards/:id", put(update_card))
        .route("/api/cards/:id", delete(delete_card))
        .route("/api/columns", get(columns_handler))
        .route("/api/attributes", get(attributes_handler))
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 9899));
    println!("🚀 Figma sync test server running on http://{}", addr);
    println!("   Endpoints:");
    println!("   - GET  /api/health");
    println!("   - GET  /api/cards");
    println!("   - POST /api/cards");
    println!("   - GET  /api/cards/:id");
    println!("   - PUT  /api/cards/:id");
    println!("   - DELETE /api/cards/:id");
    println!("   - GET  /api/columns");
    println!("   - GET  /api/attributes");
    println!();
    println!("Press Ctrl+C to stop");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "version": "0.1.0"
    }))
}

async fn list_cards(State(state): State<AppState>) -> Json<Vec<Card>> {
    let cards = state.read().await.clone();
    Json(cards)
}

async fn get_card(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Card>, (axum::http::StatusCode, String)> {
    let cards = state.read().await;
    cards
        .iter()
        .find(|c| c.id == id)
        .cloned()
        .map(Json)
        .ok_or((axum::http::StatusCode::NOT_FOUND, "Card not found".to_string()))
}

async fn create_card(
    State(state): State<AppState>,
    Json(req): Json<CreateCardRequest>,
) -> Json<Card> {
    let mut cards = state.write().await;

    let max_pos = cards
        .iter()
        .filter(|c| c.column == "inbox")
        .map(|c| c.position)
        .max()
        .unwrap_or(-1);

    let now = chrono::Utc::now().timestamp_millis();
    let new_card = Card {
        id: now,
        title: req.title,
        area: req.area,
        card_type: req.card_type,
        notes: String::new(),
        column: "inbox".to_string(),
        position: max_pos + 1,
        due_date: None,
        created_at: now,
        updated_at: now,
    };

    cards.push(new_card.clone());
    println!("✅ Created card: {} (id: {})", new_card.title, new_card.id);

    Json(new_card)
}

async fn update_card(
    State(state): State<AppState>,
    Path(id): Path<i64>,
    Json(req): Json<UpdateCardRequest>,
) -> Result<Json<Card>, (axum::http::StatusCode, String)> {
    let mut cards = state.write().await;

    let card = cards
        .iter_mut()
        .find(|c| c.id == id)
        .ok_or((axum::http::StatusCode::NOT_FOUND, "Card not found".to_string()))?;

    if let Some(title) = req.title {
        card.title = title;
    }
    if let Some(area) = req.area {
        card.area = area;
    }
    if let Some(card_type) = req.card_type {
        card.card_type = Some(card_type);
    }
    if let Some(column) = req.column {
        card.column = column;
    }
    if let Some(position) = req.position {
        card.position = position;
    }

    card.updated_at = chrono::Utc::now().timestamp_millis();
    let updated = card.clone();

    println!("✏️  Updated card: {} (id: {})", updated.title, updated.id);

    Ok(Json(updated))
}

async fn delete_card(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, String)> {
    let mut cards = state.write().await;

    let idx = cards
        .iter()
        .position(|c| c.id == id)
        .ok_or((axum::http::StatusCode::NOT_FOUND, "Card not found".to_string()))?;

    let removed = cards.remove(idx);
    println!("🗑️  Deleted card: {} (id: {})", removed.title, removed.id);

    Ok(Json(serde_json::json!({ "deleted": id })))
}

async fn columns_handler() -> Json<Vec<Column>> {
    Json(get_columns())
}

async fn attributes_handler(Query(query): Query<AttributeQuery>) -> Json<Vec<Attribute>> {
    match query.attr_type.as_deref() {
        Some("area") => Json(get_areas()),
        Some("type") => Json(get_types()),
        _ => {
            let mut all = get_areas();
            all.extend(get_types());
            Json(all)
        }
    }
}
