# Flow Architecture

## Overview

Flow is built as a monorepo with shared business logic.
flow-kanban/
├── packages/
│   ├── desktop/     # Tauri + Svelte (main app)
│   ├── mobile/      # React Native (future)
│   └── shared/      # Business logic, models, constants
├── docs/            # Documentation
└── tests/           # Integration tests

## Technology Stack

### Desktop App
- **Framework:** Tauri 1.5
- **UI:** Svelte 4
- **Build:** Vite 5
- **Language:** JavaScript (ES modules)
- **Database:** SQLite (via Tauri backend commands)

### Shared Package
- **Language:** JavaScript (ES modules)
- **Purpose:** 
  - Data models (Card, etc.)
  - Constants (columns, areas, types)
  - Validation logic
  - Utilities

## Data Storage Strategy

### Current Implementation

**Storage:** SQLite database via Tauri backend commands
- **Location:** Local SQLite file managed by Tauri
- **Format:** Relational database with SQL schema
- **Access:** Rust backend via Tauri commands, frontend via invoke()

**Implementation Files:**
- `packages/desktop/src/stores/cardStore.js` - Card data management (calls Tauri commands)
- `packages/desktop/src/stores/columnStore.js` - Column configuration (calls Tauri commands)
- `packages/desktop/src/stores/attributeStore.js` - Areas and types (calls Tauri commands)
- `packages/desktop/src-tauri/src/database/` - SQLite backend implementation

**Why SQLite:**
- ✅ ACID transactions and data integrity
- ✅ Efficient SQL queries and indexing
- ✅ Relational data model
- ✅ Prepared for multi-device sync
- ✅ Native file-based storage
- ✅ No external dependencies

### Historical Context

**Previous versions (pre-v0.3)** used browser LocalStorage for data persistence. The migration to SQLite provides better data integrity and prepares for future sync features.

### Future Enhancements (v1.0+)

**Planned enhancements for multi-device sync:**

Rust SQLite implementation in `src-tauri/src/database/` will be enhanced to support:

**Sync Capabilities:**
1. Multi-device synchronization between desktop and mobile
2. Device ID tracking and ownership
3. Tombstones for tracking deletions
4. Conflict resolution metadata
5. Enhanced audit trail with change history
6. Offline-first architecture

**Database Module:** See `packages/desktop/src-tauri/src/database/README.md` for details.

**Timeline:**
- Keep current SQLite implementation as primary storage
- Add sync metadata tables when sync architecture is finalized
- Enhance with conflict resolution when mobile app is ready

## Data Flow

### Current (SQLite):
```
User Interaction
    ↓
Svelte Component
    ↓
Svelte Store (cardStore, columnStore, etc.)
    ↓
invoke() - Tauri command
    ↓
Rust Backend
    ↓
SQLite Database
```

### Future (SQLite + Sync):
```
User Interaction
    ↓
Svelte Component
    ↓
Svelte Store (cardStore, columnStore, etc.)
    ↓
invoke() - Tauri command
    ↓
Rust Backend
    ↓
SQLite Database
    ↓
Sync Engine (for multi-device)
```

## Key Principles

1. **Business logic in shared package** - Can be reused for mobile app
2. **UI in app packages** - Desktop and mobile have separate UIs
3. **Data persistence in Tauri** - Secure, native database access
4. **No external services** - Everything runs locally

## Future Extensions

- Mobile app reuses shared package
- Optional cloud sync (separate service)
- Plugin system for custom views