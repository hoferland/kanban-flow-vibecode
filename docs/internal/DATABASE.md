# Database Documentation

## Overview

Flow uses **SQLite** as its primary data storage mechanism, providing robust, ACID-compliant data persistence with efficient querying and indexing capabilities. The database is implemented in Rust using the `rusqlite` crate and exposed to the frontend through Tauri commands.

## Database Location

- **File:** `flow.db` (SQLite database)
- **Location:** Managed by Tauri's application data directory
- **Access:** Via Tauri backend commands (`invoke()`)
- **Schema Version:** 1.0

## Technology Stack

- **Database:** SQLite 3
- **Backend:** Rust with `rusqlite` crate
- **Frontend Access:** Tauri IPC commands
- **Serialization:** JSON via `serde_json`

## Why SQLite?

The decision to use SQLite provides several key advantages:

1. **ACID Transactions** - Ensures data integrity and consistency
2. **Relational Model** - Proper relationships and constraints between entities
3. **SQL Query Power** - Efficient filtering, sorting, and joins
4. **Indexing** - Fast queries on commonly accessed fields
5. **File-based Storage** - No external database server required
6. **Native Integration** - Seamless Tauri backend integration
7. **Future-ready** - Prepared for multi-device sync features
8. **Zero Dependencies** - No external services or setup required

## Database Schema

### Tables

#### `cards` - Kanban Cards
Primary entity for storing kanban card data.

```sql
CREATE TABLE cards (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  type TEXT,
  notes TEXT DEFAULT '',
  column TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  dueDate INTEGER,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  syncedAt INTEGER DEFAULT 0,
  deviceId TEXT
);
```

**Indexes:**
- `idx_cards_column` - Fast column filtering
- `idx_cards_area` - Quick area-based queries
- `idx_cards_type` - Type filtering
- `idx_cards_updated` - Sort by modification time
- `idx_cards_synced` - Track sync status (future)

**Field Details:**
- `id` - Unique card identifier (integer)
- `title` - Card title (required)
- `area` - Categorization area (required)
- `type` - Optional card type
- `notes` - Markdown-formatted notes
- `column` - Current kanban column
- `position` - Order within column
- `dueDate` - Unix timestamp (milliseconds)
- `createdAt` - Creation timestamp
- `updatedAt` - Last modification timestamp
- `syncedAt` - Last sync timestamp (future use)
- `deviceId` - Originating device identifier (future use)

#### `attachments` - File Attachments
Files attached to cards with metadata.

```sql
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  cardId INTEGER NOT NULL,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  size INTEGER NOT NULL,
  mimeType TEXT NOT NULL,
  hash TEXT NOT NULL,
  thumbnailHash TEXT,
  createdAt INTEGER NOT NULL,
  syncedAt INTEGER DEFAULT 0,
  FOREIGN KEY (cardId) REFERENCES cards(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_attachments_card` - Fast lookup by card
- `idx_attachments_hash` - Deduplication support

**Field Details:**
- `id` - Unique attachment identifier (UUID)
- `cardId` - Parent card reference
- `filename` - Original filename
- `filepath` - Absolute path to stored file
- `size` - File size in bytes
- `mimeType` - MIME type for proper handling
- `hash` - SHA-256 hash for integrity/deduplication
- `thumbnailHash` - Hash of thumbnail (if applicable)
- Foreign key cascade ensures attachments are deleted with cards

#### `columns` - Kanban Column Configuration
Configurable columns for the kanban board.

```sql
CREATE TABLE columns (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  wipLimit INTEGER,
  color TEXT,
  isActive INTEGER DEFAULT 1,
  updatedAt INTEGER NOT NULL
);
```

**Indexes:**
- `idx_columns_position` - Sort by display order

**Field Details:**
- `id` - Column identifier (e.g., "todo", "doing", "done")
- `label` - Display name
- `position` - Order on board (left to right)
- `wipLimit` - Work-in-progress limit (optional)
- `color` - Custom color code (optional)
- `isActive` - Soft delete flag (1 = active, 0 = deleted)
- `updatedAt` - Last modification timestamp

#### `attributes` - Areas and Types
User-defined categorization attributes.

```sql
CREATE TABLE attributes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT,
  isActive INTEGER DEFAULT 1,
  updatedAt INTEGER NOT NULL
);
```

**Indexes:**
- `idx_attributes_type` - Filter by attribute type
- `idx_attributes_position` - Sort by display order

**Field Details:**
- `id` - Attribute identifier (UUID)
- `type` - Attribute category: 'area' or 'type'
- `label` - Display name
- `position` - Sort order in UI
- `color` - Custom color code (optional)
- `isActive` - Soft delete flag
- `updatedAt` - Last modification timestamp

#### `tombstones` - Deletion Tracking
Tracks deleted entities for future sync support.

```sql
CREATE TABLE tombstones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  deletedAt INTEGER NOT NULL,
  deviceId TEXT NOT NULL
);
```

**Indexes:**
- `idx_tombstones_deleted` - Sort by deletion time
- `idx_tombstones_entity` - Fast lookup by entity

**Field Details:**
- `entityType` - Type of deleted entity ('card', 'column', 'attribute', etc.)
- `entityId` - Original entity identifier
- `deletedAt` - Deletion timestamp
- `deviceId` - Device that performed deletion

**Purpose:** Enables conflict-free sync by tracking what was deleted and when.

#### `sync_metadata` - Sync Configuration
Key-value store for sync-related metadata.

```sql
CREATE TABLE sync_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

**Default Values:**
- `device_id` - Unique device identifier (generated on first run)
- `device_name` - User-friendly device name
- `last_sync_time` - Last successful sync timestamp
- `paired_devices` - JSON array of paired device IDs
- `schema_version` - Current database schema version
- `migration_date` - Date of migration from LocalStorage (if applicable)

#### `sync_log` - Sync History
Optional logging for debugging sync operations.

```sql
CREATE TABLE sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  direction TEXT NOT NULL,
  deviceId TEXT NOT NULL,
  changeCount INTEGER NOT NULL,
  conflictCount INTEGER NOT NULL,
  success INTEGER NOT NULL,
  errorMessage TEXT
);
```

**Indexes:**
- `idx_sync_log_timestamp` - Sort by time

**Field Details:**
- `direction` - 'send' or 'receive'
- `deviceId` - Remote device identifier
- `changeCount` - Number of changes processed
- `conflictCount` - Number of conflicts encountered
- `success` - Boolean (1 = success, 0 = failure)
- `errorMessage` - Error details if failed

## Tauri Commands

The database is accessed from the frontend via Tauri commands exposed through the `invoke()` API.

### Card Operations

```javascript
import { invoke } from '@tauri-apps/api/tauri';

// Get all cards
const cardsJson = await invoke('db_get_all_cards');
const cards = JSON.parse(cardsJson);

// Insert a new card
await invoke('db_insert_card', {
  cardJson: JSON.stringify({
    id: 1234567890,
    title: "New Task",
    area: "Development",
    type: "Feature",
    notes: "Task details...",
    column: "todo",
    position: 0,
    dueDate: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  })
});

// Update a card
await invoke('db_update_card', {
  id: 1234567890,
  title: "Updated Title",
  area: "Development",
  cardType: "Feature",
  notes: "Updated notes",
  column: "doing",
  position: 1,
  dueDate: Date.now() + 86400000
});

// Delete a card
await invoke('db_delete_card', { id: 1234567890 });
```

### Column Operations

```javascript
// Get all columns
const columnsJson = await invoke('db_get_all_columns');
const columns = JSON.parse(columnsJson);

// Insert a column
await invoke('db_insert_column', {
  columnJson: JSON.stringify({
    id: "review",
    label: "Review",
    position: 2,
    wipLimit: 3,
    color: "#FFA500"
  })
});

// Update a column
await invoke('db_update_column', {
  id: "review",
  label: "Code Review",
  wipLimit: 5,
  color: "#FF6347",
  position: 2
});

// Delete a column (soft delete)
await invoke('db_delete_column', { id: "review" });
```

### Attribute Operations

```javascript
// Get attributes by type
const areasJson = await invoke('db_get_attributes', { attrType: 'area' });
const areas = JSON.parse(areasJson);

const typesJson = await invoke('db_get_attributes', { attrType: 'type' });
const types = JSON.parse(typesJson);

// Insert an attribute
await invoke('db_insert_attribute', {
  attributeJson: JSON.stringify({
    id: "attr-uuid",
    type: "area",
    label: "Design",
    position: 0
  })
});

// Update an attribute
await invoke('db_update_attribute', {
  id: "attr-uuid",
  label: "UX Design",
  position: 1
});

// Delete an attribute (soft delete)
await invoke('db_delete_attribute', { id: "attr-uuid" });
```

### Attachment Operations

```javascript
// Save attachment (copies file to app data directory)
const storedPath = await invoke('save_attachment', {
  cardId: "1234567890",
  sourcePath: "/path/to/file.pdf"
});

// Open attachment with system default application
await invoke('open_attachment', {
  path: storedPath
});

// Delete single attachment
await invoke('delete_attachment', {
  path: storedPath
});

// Delete all attachments for a card
await invoke('delete_card_attachments', {
  cardId: "1234567890"
});
```

## Data Models

### Card Model (Rust)

```rust
#[derive(Debug, Serialize, Deserialize)]
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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attachments: Option<Vec<Attachment>>,
}
```

### Column Model (Rust)

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Column {
    pub id: String,
    pub label: String,
    pub position: i32,
    #[serde(rename = "wipLimit")]
    pub wip_limit: Option<i32>,
    pub color: Option<String>,
}
```

### Attribute Model (Rust)

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Attribute {
    pub id: String,
    #[serde(rename = "type")]
    pub attr_type: String,
    pub label: String,
    pub position: i32,
}
```

### Attachment Model (Rust)

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Attachment {
    pub id: String,
    #[serde(rename = "cardId")]
    pub card_id: i64,
    pub filename: String,
    pub size: i64,
}
```

## CRUD Operations

### Example: Complete Card Lifecycle

```javascript
import { invoke } from '@tauri-apps/api/tauri';

// CREATE
const newCard = {
  id: Date.now(),
  title: "Implement feature",
  area: "Development",
  type: "Feature",
  notes: "# Feature Description\n\nDetails here...",
  column: "todo",
  position: 0,
  dueDate: null,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await invoke('db_insert_card', {
  cardJson: JSON.stringify(newCard)
});

// READ
const cardsJson = await invoke('db_get_all_cards');
const cards = JSON.parse(cardsJson);
const card = cards.find(c => c.id === newCard.id);

// UPDATE
await invoke('db_update_card', {
  id: newCard.id,
  column: "doing",
  position: 1
});

// DELETE
await invoke('db_delete_card', { id: newCard.id });
```

## Backup and Recovery

### Manual Backup

The SQLite database file can be manually backed up:

1. **Locate the database:**
   - macOS: `~/Library/Application Support/com.flow.kanban/flow.db`
   - Windows: `%APPDATA%\com.flow.kanban\flow.db`
   - Linux: `~/.local/share/com.flow.kanban/flow.db`

2. **Create backup:**
   ```bash
   cp /path/to/flow.db /path/to/backup/flow-backup-$(date +%Y%m%d).db
   ```

3. **Restore from backup:**
   - Close the application
   - Replace `flow.db` with backup file
   - Restart the application

### Database Export (CSV)

The application includes CSV import/export functionality for card data:

```javascript
// Export is handled through the UI's export feature
// Import uses the db_insert_card command for each row
```

### Integrity Check

SQLite provides built-in integrity checking:

```bash
sqlite3 flow.db "PRAGMA integrity_check;"
```

## Migration History

### Version 1.0 - LocalStorage to SQLite

**Date:** March 2026

**Changes:**
- Migrated from browser LocalStorage to SQLite
- Added relational schema with foreign keys
- Implemented indexes for performance
- Added sync preparation tables (tombstones, metadata, log)
- Soft delete support for columns and attributes

**Migration Process:**
- Automatic on first run with SQLite version
- Data preserved from LocalStorage format
- No manual user intervention required

## Performance Considerations

### Indexing Strategy

The database uses strategic indexing to optimize common queries:

1. **Column-based filtering** - Cards are frequently filtered by column
2. **Area/Type filtering** - Users filter by areas and types
3. **Sort by update time** - Recent cards shown first
4. **Entity lookups** - Fast access to specific cards/columns/attributes

### Query Optimization

- **Prepared statements** - All queries use prepared statements for safety and performance
- **Connection reuse** - Database connection is reused across commands
- **Batch operations** - Multiple updates can be performed in a single transaction
- **Foreign key enforcement** - Enabled for data integrity

### Database Size

Expected size for typical usage:
- 1,000 cards: ~500 KB
- 10,000 cards: ~5 MB
- Attachments stored separately in filesystem

## Error Handling

### Error Types

```rust
// Database errors are converted to strings for Tauri
Err(format!("Failed to connect to database: {}", e))
Err(format!("Failed to parse card JSON: {}", e))
Err(format!("Failed to serialize cards: {}", e))
```

### Frontend Error Handling

```javascript
try {
  await invoke('db_insert_card', { cardJson: JSON.stringify(card) });
} catch (error) {
  console.error('Failed to insert card:', error);
  // Show user-friendly error message
}
```

## Future Enhancements

### Multi-Device Sync (v1.0+)

The database schema is prepared for future sync capabilities:

1. **Device Tracking** - Each entity tracks its originating device
2. **Tombstones** - Deleted entities are tracked for sync
3. **Timestamps** - `syncedAt` fields track sync status
4. **Conflict Resolution** - Metadata tables support conflict detection
5. **Sync Log** - History of sync operations for debugging

### Planned Features

- **Conflict-free replication** - CRDT-based sync between devices
- **Partial sync** - Sync only changed entities
- **Offline support** - Queue changes when offline
- **Compression** - Compress sync payloads
- **Encryption** - Optional database encryption

## Development Guidelines

### Adding New Tables

1. Add table schema to `schema.sql`
2. Create corresponding Rust struct in `mod.rs`
3. Implement CRUD functions in `mod.rs`
4. Add Tauri commands in `lib.rs`
5. Register commands in `tauri::Builder`
6. Update schema version in `sync_metadata`

### Testing Database Operations

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_card_insertion() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(include_str!("schema.sql")).unwrap();

        let card = Card {
            id: 1,
            title: "Test".to_string(),
            // ... other fields
        };

        insert_card(&conn, &card, "test-device").unwrap();
        let cards = get_all_cards(&conn).unwrap();
        assert_eq!(cards.len(), 1);
    }
}
```

## Troubleshooting

### Database Locked Error

If you encounter "database is locked" errors:

1. Ensure only one instance of Flow is running
2. Check for zombie processes holding the database lock
3. Restart the application

### Corruption Recovery

If the database becomes corrupted:

1. Check integrity: `sqlite3 flow.db "PRAGMA integrity_check;"`
2. Attempt recovery: `sqlite3 flow.db ".recover" > recovered.sql`
3. Restore from backup if available
4. Re-import from CSV export if available

### Performance Issues

If queries are slow:

1. Check index usage: `EXPLAIN QUERY PLAN SELECT ...`
2. Run `VACUUM` to optimize database
3. Analyze statistics: `ANALYZE`

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall system architecture
- [Database README](../../packages/desktop/src-tauri/src/database/README.md) - Implementation details
- [Schema SQL](../../packages/desktop/src-tauri/src/database/schema.sql) - Full schema definition

## References

- **SQLite Documentation:** https://www.sqlite.org/docs.html
- **Rusqlite Crate:** https://docs.rs/rusqlite/
- **Tauri Commands:** https://tauri.app/v1/guides/features/command/

---

**Last Updated:** March 3, 2026
**Schema Version:** 1.0
**Status:** Production
