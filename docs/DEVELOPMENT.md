# Development Guide

## Getting Started

### Prerequisites
- Node.js 20+
- Rust 1.75+
- Git

### First Time Setup

```bash
# Clone repository
git clone [your-repo-url]
cd flow-kanban

# Install dependencies
npm install

# Start desktop app
npm run dev:desktop
Development Workflow
Desktop App Development
# Start dev server (hot reload enabled)
cd packages/desktop
npm run tauri:dev
Hot reload: Changes to Svelte files reload automatically.
Working with Shared Code
# Edit files in packages/shared/src/
# Desktop app will automatically use the latest version
Building for Production
# Desktop app
cd packages/desktop
npm run tauri:build

# Output locations:
# - Mac: src-tauri/target/release/bundle/dmg/
# - Windows: src-tauri/target/release/bundle/msi/
# - Linux: src-tauri/target/release/bundle/appimage/
Project Structure
packages/desktop/
├── src/              # Svelte components
│   ├── App.svelte   # Main app component
│   ├── main.js      # Entry point
│   └── ...
├── src-tauri/        # Rust backend
│   ├── src/
│   │   └── main.rs  # Tauri commands
│   ├── tauri.conf.json
│   └── Cargo.toml
└── package.json

packages/shared/
├── src/
│   ├── models/      # Data models
│   ├── constants/   # App constants
│   ├── utils/       # Utility functions
│   └── index.js     # Main export
└── package.json
Common Tasks
Add a New Constant

Edit packages/shared/src/constants/[file].js
Export it from packages/shared/src/index.js
Use in desktop: import { CONSTANT } from '@flow/shared'

Add a New Model

Create packages/shared/src/models/NewModel.js
Export from packages/shared/src/index.js
Use in desktop: import { NewModel } from '@flow/shared'

Add a Tauri Command

Edit packages/desktop/src-tauri/src/main.rs
Add command function
Register in tauri::Builder
Call from frontend: import { invoke } from '@tauri-apps/api/tauri'

Testing
# Run all tests
npm test

# Run desktop tests only
cd packages/desktop
npm test
Troubleshooting
"Cannot find module @flow/shared"
Fix:
cd packages/desktop
npm install ../shared
Tauri dev server won't start
Fix:
# Kill any existing processes
pkill -f tauri
# Or on Windows:
taskkill /F /IM flow.exe

# Clear build cache
cd packages/desktop/src-tauri
cargo clean
Changes not reflecting
Fix:
# Hard refresh in Tauri window
Ctrl + R  (Windows/Linux)
Cmd + R   (Mac)