# Database Layer

✅ **This database layer IS actively used by the application.**

---

## Current Status

- **Implementation:** Complete Rust SQLite module
- **Connected:** Yes - integrated with app via Tauri commands
- **Used By:** All data stores (cards, columns, attributes)
- **Status:** Production - primary data persistence mechanism

---

## Purpose

This module provides SQLite database functionality for the application's data persistence:

### Current Use Cases

- **Card management** - Store and retrieve kanban cards
- **Column configuration** - Persist column settings and order
- **Attribute management** - Store areas and types
- **Data integrity** - SQL constraints and transactions
- **Performance** - Efficient queries and indexing

### Future Enhancements (v1.0+)

- **Multi-device synchronization** - Sync data between desktop and mobile
- **Conflict resolution** - Track changes and resolve conflicts
- **Tombstones** - Track deletions for proper sync
- **Device tracking** - Identify devices and ownership
- **Enhanced audit trail** - Comprehensive change history

---

## Current Data Storage

The application uses **SQLite database** via Tauri backend commands.

### Implementation Files:

```javascript
// Frontend stores (use Tauri commands):
// packages/desktop/src/stores/cardStore.js
// packages/desktop/src/stores/columnStore.js
// packages/desktop/src/stores/attributeStore.js

// Backend database module:
// packages/desktop/src-tauri/src/database/
```

**Storage Location:** SQLite database file (managed by Tauri)
**Format:** Relational database with SQL schema
**Access:** Rust backend via Tauri commands, frontend via invoke()

---

## Why SQLite (Current Approach)

✅ **Advantages:**
- Relational data model
- SQL query capabilities
- ACID transactions
- Better data integrity
- Prepared for sync features
- Native file-based storage
- No external dependencies

⚠️ **Migration from LocalStorage:**
- Previous versions may have used LocalStorage
- Migration handled automatically on first run
- Data preserved during transition

---

## Tauri Commands

The database is accessed from the frontend via these Tauri commands:

### Card Operations
```javascript
// Get all cards
await invoke('db_get_all_cards')

// Insert a new card
await invoke('db_insert_card', { cardJson: JSON.stringify(card) })

// Update a card
await invoke('db_update_card', {
  id: cardId,
  title: newTitle,
  area: newArea,
  // ... other fields
})

// Delete a card
await invoke('db_delete_card', { id: cardId })
```

### Column Operations
```javascript
// Get all columns
await invoke('db_get_all_columns')

// Insert/update/delete columns
// (Similar pattern to cards)
```

### Attribute Operations
```javascript
// Get attributes by type
await invoke('db_get_attributes_by_type', { attrType: 'area' })

// Insert/update/delete attributes
// (Similar pattern to cards)
```

See the store files for complete usage examples.

---

## Database Schema

### Tables Implemented

#### `cards`
Primary entity for kanban cards
```sql
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- area (TEXT)
- type (TEXT)
- notes (TEXT)
- column (TEXT)
- position (INTEGER)
- dueDate (INTEGER - Unix timestamp)
- createdAt (INTEGER)
- updatedAt (INTEGER)
- deviceId (TEXT)
```

#### `columns`
Column configuration
```sql
- id (TEXT PRIMARY KEY)
- label (TEXT)
- position (INTEGER)
- wipLimit (INTEGER)
- color (TEXT)
- isActive (INTEGER)
- updatedAt (INTEGER)
```

#### `attributes`
Dynamic attributes (areas, types)
```sql
- id (TEXT PRIMARY KEY)
- type (TEXT - 'area' or 'type')
- label (TEXT)
- position (INTEGER)
- isActive (INTEGER)
- updatedAt (INTEGER)
```

#### `tombstones`
Track deletions for sync
```sql
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- entityType (TEXT - 'card', 'column', etc.)
- entityId (TEXT)
- deletedAt (INTEGER)
- deviceId (TEXT)
```

#### `sync_metadata`
Sync system configuration
```sql
- key (TEXT PRIMARY KEY)
- value (TEXT)
- updatedAt (INTEGER)
```

#### `sync_log`
Sync operation history
```sql
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- deviceId (TEXT)
- operation (TEXT)
- timestamp (INTEGER)
- success (INTEGER)
- error (TEXT)
```

Full schema: `src/database/schema.sql`

---

## API Overview

### Core Operations (Implemented)

```rust
// Cards
pub fn insert_card(conn: &Connection, card: &Card, device_id: &str) -> SqliteResult<()>
pub fn update_card(conn: &Connection, id: i64, ...) -> SqliteResult<()>
pub fn delete_card(conn: &Connection, id: i64, device_id: &str) -> SqliteResult<()>
pub fn get_all_cards(conn: &Connection) -> SqliteResult<Vec<Card>>

// Columns
pub fn insert_column(conn: &Connection, column: &Column) -> SqliteResult<()>
pub fn update_column(conn: &Connection, id: &str, ...) -> SqliteResult<()>
pub fn delete_column(conn: &Connection, id: &str) -> SqliteResult<()>
pub fn get_all_columns(conn: &Connection) -> SqliteResult<Vec<Column>>

// Attributes
pub fn insert_attribute(conn: &Connection, attr: &Attribute) -> SqliteResult<()>
pub fn update_attribute(conn: &Connection, id: &str, ...) -> SqliteResult<()>
pub fn delete_attribute(conn: &Connection, id: &str) -> SqliteResult<()>
pub fn get_attributes_by_type(conn: &Connection, attr_type: &str) -> SqliteResult<Vec<Attribute>>

// Database
pub fn init_database(app_data_dir: &PathBuf) -> SqliteResult<Connection>
pub fn get_device_id(conn: &Connection) -> SqliteResult<String>
```

---

## Migration Strategy

### LocalStorage to SQLite Migration

Previous versions of Flow used browser LocalStorage for data persistence. The migration to SQLite provides:

1. **Better data integrity** - ACID transactions and constraints
2. **Improved performance** - Indexed queries
3. **Future-ready** - Prepared for sync features
4. **Relational model** - Better data relationships

**Migration handled automatically:**
- On first run with SQLite, data is preserved
- No manual user intervention required
- Backward-compatible data format

---

## For Developers

### Current Data Access Pattern:

```javascript
// Frontend stores use Tauri commands
import { invoke } from '@tauri-apps/api/tauri';

// Example from cardStore.js:
async function loadCards() {
  const cardsJson = await invoke('db_get_all_cards');
  return JSON.parse(cardsJson);
}

async function addCard(card) {
  await invoke('db_insert_card', {
    cardJson: JSON.stringify(card)
  });
}
```

### Backend Implementation:

```rust
// Tauri commands in lib.rs:
#[tauri::command]
fn db_get_all_cards() -> Result<String, String> {
  let conn = get_db_connection()?;
  let cards = database::get_all_cards(&conn)?;
  serde_json::to_string(&cards)
    .map_err(|e| e.to_string())
}
```

---

## Testing

The database module can be tested independently:

```rust
#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_card_crud() {
    // Test create, read, update, delete
  }
}
```

Tests are not currently implemented since module is unused.

---

## References

**Related Documentation:**
- [ARCHITECTURE.md](../../docs/internal/ARCHITECTURE.md) - Data storage strategy
- [MOBILE_SYNC_SPECIFICATION.md](../../docs/future/MOBILE_SYNC_SPECIFICATION.md) - Sync design
- Schema file: `src/database/schema.sql`

**Current Implementation:**
- `src/stores/cardStore.js` - Active card storage
- `src/stores/columnStore.js` - Active column storage
- `src/stores/attributeStore.js` - Active attribute storage

---

**Last Updated:** March 2026
**Status:** Production - actively used
**Next Steps:** Enhance for multi-device sync in v1.0+
