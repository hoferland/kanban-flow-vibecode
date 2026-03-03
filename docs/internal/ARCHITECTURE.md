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
- **Database:** SQLite (via Tauri SQL plugin)

### Shared Package
- **Language:** JavaScript (ES modules)
- **Purpose:** 
  - Data models (Card, etc.)
  - Constants (columns, areas, types)
  - Validation logic
  - Utilities

## Data Storage Strategy

### Current Implementation (v0.2.x)

**Storage:** Browser LocalStorage via Svelte stores
- **Location:** Browser storage, persisted by Tauri
- **Format:** JSON serialization
- **Access:** Direct via JavaScript Svelte stores

**Implementation Files:**
- `packages/desktop/src/stores/cardStore.js` - Card data management
- `packages/desktop/src/stores/columnStore.js` - Column configuration
- `packages/desktop/src/stores/attributeStore.js` - Areas and types

**Why LocalStorage:**
- ✅ Simple, proven approach
- ✅ No migration needed
- ✅ Sufficient for single-user desktop
- ✅ Fast read/write performance
- ✅ Easy debugging via browser dev tools

### Future Implementation (v1.0+)

**Migration to SQLite:** Planned for multi-device sync features

Rust SQLite implementation exists in `src-tauri/src/database/` but is **not currently connected**.

**Migration Plan:**
1. Keep LocalStorage as primary storage until v1.0
2. Build data migration utility
3. Switch to SQLite when sync architecture is complete
4. Database will provide:
   - Sync metadata (device IDs, timestamps)
   - Tombstones for deletions
   - Conflict resolution data
   - Offline-first architecture

**Database Module:** See `packages/desktop/src-tauri/src/database/README.md` for details.

**Why Wait:**
- LocalStorage works perfectly for current single-user scope
- Database adds complexity without current benefit
- Can migrate data when sync features are ready
- Allows us to validate data model before committing to schema

## Data Flow

### Current (LocalStorage):
```
User Interaction
    ↓
Svelte Component
    ↓
Svelte Store (cardStore, columnStore, etc.)
    ↓
LocalStorage (automatic persistence)
```

### Future (SQLite + Sync):
```
User Interaction
    ↓
Svelte Component
    ↓
Tauri Command (Rust backend)
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