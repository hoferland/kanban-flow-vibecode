use axum::{
    extract::{Path, Query, State, WebSocketUpgrade},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use super::websocket::WebSocketState;

// Data structures matching the Flow app models

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
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCardRequest {
    pub title: Option<String>,
    pub area: Option<String>,
    #[serde(rename = "type")]
    pub card_type: Option<String>,
    pub notes: Option<String>,
    pub column: Option<String>,
    pub position: Option<i32>,
    #[serde(rename = "dueDate")]
    pub due_date: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct AttributeQuery {
    #[serde(rename = "type")]
    pub attr_type: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
}

// In-memory storage for demo (will be replaced with SQLite access)
use std::sync::Mutex;
use once_cell::sync::Lazy;

static CARDS: Lazy<Mutex<Vec<Card>>> = Lazy::new(|| {
    Mutex::new(vec![
        Card {
            id: 1,
            title: "Sample card from Flow".to_string(),
            area: "team-a".to_string(),
            card_type: Some("design".to_string()),
            notes: "This is synced from Flow Kanban".to_string(),
            column: "inbox".to_string(),
            position: 0,
            due_date: None,
            created_at: chrono::Utc::now().timestamp_millis(),
            updated_at: chrono::Utc::now().timestamp_millis(),
        },
    ])
});

static COLUMNS: Lazy<Vec<Column>> = Lazy::new(|| {
    vec![
        Column { id: "inbox".to_string(), label: "Inbox".to_string(), position: 0, wip_limit: None, color: None, is_active: true },
        Column { id: "next".to_string(), label: "Next".to_string(), position: 1, wip_limit: None, color: None, is_active: true },
        Column { id: "in-progress".to_string(), label: "In Progress".to_string(), position: 2, wip_limit: Some(3), color: None, is_active: true },
        Column { id: "waiting".to_string(), label: "Waiting".to_string(), position: 3, wip_limit: None, color: None, is_active: true },
        Column { id: "done".to_string(), label: "Done".to_string(), position: 4, wip_limit: None, color: None, is_active: true },
    ]
});

static AREAS: Lazy<Vec<Attribute>> = Lazy::new(|| {
    vec![
        Attribute { id: "team-a".to_string(), attr_type: "area".to_string(), label: "SD Team".to_string(), position: 0, color: Some("#d4e4f0".to_string()), is_active: true },
        Attribute { id: "team-b".to_string(), attr_type: "area".to_string(), label: "TM Team".to_string(), position: 1, color: Some("#d4e8d4".to_string()), is_active: true },
        Attribute { id: "cross-team".to_string(), attr_type: "area".to_string(), label: "Cross-team".to_string(), position: 2, color: Some("#f0dcc8".to_string()), is_active: true },
        Attribute { id: "other".to_string(), attr_type: "area".to_string(), label: "Other".to_string(), position: 3, color: Some("#e8e4db".to_string()), is_active: true },
    ]
});

static TYPES: Lazy<Vec<Attribute>> = Lazy::new(|| {
    vec![
        Attribute { id: "discovery".to_string(), attr_type: "type".to_string(), label: "Discovery".to_string(), position: 0, color: None, is_active: true },
        Attribute { id: "design".to_string(), attr_type: "type".to_string(), label: "Design".to_string(), position: 1, color: None, is_active: true },
        Attribute { id: "support".to_string(), attr_type: "type".to_string(), label: "Support".to_string(), position: 2, color: None, is_active: true },
    ]
});

// Route handlers

pub async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        version: "0.1.0".to_string(),
    })
}

pub async fn get_cards() -> Json<Vec<Card>> {
    let cards = CARDS.lock().unwrap().clone();
    Json(cards)
}

pub async fn get_card(Path(id): Path<i64>) -> Result<Json<Card>, Response> {
    let cards = CARDS.lock().unwrap();
    cards
        .iter()
        .find(|c| c.id == id)
        .cloned()
        .map(Json)
        .ok_or_else(|| {
            (axum::http::StatusCode::NOT_FOUND, "Card not found").into_response()
        })
}

pub async fn create_card(
    State(ws_state): State<Arc<WebSocketState>>,
    Json(req): Json<CreateCardRequest>,
) -> Json<Card> {
    let mut cards = CARDS.lock().unwrap();

    // Find max position in inbox
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
        notes: req.notes.unwrap_or_default(),
        column: "inbox".to_string(),
        position: max_pos + 1,
        due_date: None,
        created_at: now,
        updated_at: now,
    };

    cards.push(new_card.clone());

    // Broadcast to WebSocket clients
    ws_state.broadcast_card_created(&new_card);

    Json(new_card)
}

pub async fn update_card(
    State(ws_state): State<Arc<WebSocketState>>,
    Path(id): Path<i64>,
    Json(req): Json<UpdateCardRequest>,
) -> Result<Json<Card>, Response> {
    let mut cards = CARDS.lock().unwrap();

    let card = cards
        .iter_mut()
        .find(|c| c.id == id)
        .ok_or_else(|| {
            (axum::http::StatusCode::NOT_FOUND, "Card not found").into_response()
        })?;

    if let Some(title) = req.title {
        card.title = title;
    }
    if let Some(area) = req.area {
        card.area = area;
    }
    if let Some(card_type) = req.card_type {
        card.card_type = Some(card_type);
    }
    if let Some(notes) = req.notes {
        card.notes = notes;
    }
    if let Some(column) = req.column {
        card.column = column;
    }
    if let Some(position) = req.position {
        card.position = position;
    }
    if let Some(due_date) = req.due_date {
        card.due_date = Some(due_date);
    }

    card.updated_at = chrono::Utc::now().timestamp_millis();

    let updated_card = card.clone();

    // Broadcast to WebSocket clients
    ws_state.broadcast_card_updated(&updated_card);

    Ok(Json(updated_card))
}

pub async fn delete_card(
    State(ws_state): State<Arc<WebSocketState>>,
    Path(id): Path<i64>,
) -> Result<Json<serde_json::Value>, Response> {
    let mut cards = CARDS.lock().unwrap();

    let idx = cards
        .iter()
        .position(|c| c.id == id)
        .ok_or_else(|| {
            (axum::http::StatusCode::NOT_FOUND, "Card not found").into_response()
        })?;

    cards.remove(idx);

    // Broadcast to WebSocket clients
    ws_state.broadcast_card_deleted(id);

    Ok(Json(serde_json::json!({ "deleted": id })))
}

pub async fn get_columns() -> Json<Vec<Column>> {
    Json(COLUMNS.clone())
}

pub async fn get_attributes(Query(query): Query<AttributeQuery>) -> Json<Vec<Attribute>> {
    match query.attr_type.as_deref() {
        Some("area") => Json(AREAS.clone()),
        Some("type") => Json(TYPES.clone()),
        _ => {
            let mut all = AREAS.clone();
            all.extend(TYPES.clone());
            Json(all)
        }
    }
}

pub async fn websocket_handler(
    State(ws_state): State<Arc<WebSocketState>>,
    ws: WebSocketUpgrade,
) -> Response {
    ws.on_upgrade(move |socket| super::websocket::handle_socket(socket, ws_state))
}
