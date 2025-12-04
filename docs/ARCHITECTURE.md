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

## Data Flow
User Interaction
    ↓
Svelte Component
    ↓
Shared Business Logic (Card model, validation)
    ↓
Tauri Command (Rust backend)
    ↓
SQLite Database

## Key Principles

1. **Business logic in shared package** - Can be reused for mobile app
2. **UI in app packages** - Desktop and mobile have separate UIs
3. **Data persistence in Tauri** - Secure, native database access
4. **No external services** - Everything runs locally

## Future Extensions

- Mobile app reuses shared package
- Optional cloud sync (separate service)
- Plugin system for custom views