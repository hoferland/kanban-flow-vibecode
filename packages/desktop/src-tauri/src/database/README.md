# Database Layer (Future Feature)

⚠️ **This database layer is NOT currently used by the application.**

---

## Current Status

- **Implementation:** Complete Rust SQLite module
- **Connected:** No - not integrated with app
- **Used By:** Nothing (as of v0.2.x)
- **Status:** Prepared for future sync features

---

## Purpose

This module provides SQLite database functionality for **future** synchronization features:

### Planned Use Cases (v1.0+)

- **Multi-device synchronization** - Sync data between desktop and mobile
- **Conflict resolution** - Track changes and resolve conflicts
- **Offline-first architecture** - Local-first data with sync
- **Tombstones** - Track deletions for proper sync
- **Device tracking** - Identify devices and ownership
- **Audit trail** - Change history and timestamps

---

## Current Data Storage

The application currently uses **LocalStorage** via Svelte stores.

### Where Data Actually Lives:

```javascript
// See: packages/desktop/src/stores/cardStore.js
// See: packages/desktop/src/stores/columnStore.js
// See: packages/desktop/src/stores/attributeStore.js
```

**Storage Location:** Browser LocalStorage (persisted by Tauri)
**Format:** JSON serialization
**Access:** Direct JavaScript

---

## Why LocalStorage (Current Approach)

✅ **Advantages:**
- Simple implementation
- No migration needed
- Fast read/write
- Proven reliability
- Sufficient for single-user desktop app
- Easy debugging (dev tools)

⚠️ **Limitations:**
- No SQL queries
- No relational data
- Limited sync capabilities
- No concurrent access patterns

---

## When Will SQLite Be Used?

### Planned Migration Timeline

**Current (v0.2.x):** LocalStorage only
**v0.5-0.9:** Potential migration preparation
**v1.0+:** SQLite migration when sync features begin

### Prerequisites for Migration:

1. ✅ Desktop app stable
2. ✅ Core features complete
3. ⬜ Sync architecture finalized
4. ⬜ Migration utility built
5. ⬜ Backward compatibility tested
6. ⬜ Mobile app ready

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

### When Ready to Migrate

**Step 1: Data Export**
- Export all LocalStorage data
- Verify completeness
- Create backup

**Step 2: Database Init**
- Initialize SQLite database
- Create all tables
- Generate device ID

**Step 3: Data Import**
- Transform LocalStorage JSON → SQL records
- Preserve IDs and timestamps
- Set initial sync state

**Step 4: Dual-Write Period** (Optional)
- Write to both LocalStorage and SQLite
- Validate data consistency
- Monitor for issues

**Step 5: Switch**
- Update stores to use database
- Remove LocalStorage dependencies
- Enable sync features

**Step 6: Cleanup**
- Remove dual-write code
- Archive LocalStorage backup
- Update documentation

See `docs/internal/ARCHITECTURE.md` for complete migration plan.

---

## For Developers

### Do NOT Modify This Module Unless:

1. Working on sync features (v1.0+)
2. Updating schema for new features
3. Fixing bugs in preparation for migration
4. Explicitly assigned to database work

### Current Data Access Pattern:

```javascript
// This is how data works NOW (v0.2.x):
import { cards } from './stores/cardStore.js';

// Subscribe to changes
cards.subscribe(value => {
  // React to data changes
});

// Modify data
cards.update(currentCards => {
  // Update logic
  return updatedCards;
});

// Data is automatically persisted to LocalStorage
```

### Future Data Access (When Migrated):

```rust
// Tauri command to backend
#[tauri::command]
async fn get_cards() -> Result<Vec<Card>, String> {
  let conn = get_db_connection()?;
  database::get_all_cards(&conn)
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
**Status:** Prepared but not connected
**Next Steps:** Wait for v1.0+ sync feature development
