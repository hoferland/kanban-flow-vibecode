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
cd packages/desktop
npm run tauri dev
```

## Development Workflow

### Desktop App Development

```bash
# Start dev server (hot reload enabled)
cd packages/desktop
npm run tauri dev
```

**Hot reload**: Changes to Svelte files reload automatically.

### Working with Shared Code

```bash
# Edit files in packages/shared/src/
# Desktop app will automatically use the latest version
```

## Building for Production

```bash
# Desktop app
cd packages/desktop
npm run tauri build

# Output locations:
# - Mac: src-tauri/target/release/bundle/dmg/
# - Windows: src-tauri/target/release/bundle/msi/
# - Linux: src-tauri/target/release/bundle/appimage/
```

## Project Structure

```
packages/desktop/
├── src/              # Svelte components
│   ├── App.svelte   # Main app component
│   ├── main.js      # Entry point
│   └── lib/         # Component library
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
```

## Common Tasks

### Add a New Constant

1. Edit `packages/shared/src/constants/[file].js`
2. Export it from `packages/shared/src/index.js`
3. Use in desktop: `import { CONSTANT } from '@flow/shared'`

### Add a New Model

1. Create `packages/shared/src/models/NewModel.js`
2. Export from `packages/shared/src/index.js`
3. Use in desktop: `import { NewModel } from '@flow/shared'`

### Add a Tauri Command

1. Edit `packages/desktop/src-tauri/src/main.rs`
2. Add command function
3. Register in `tauri::Builder`
4. Call from frontend: `import { invoke } from '@tauri-apps/api/tauri'`

## Testing

```bash
# Run all tests
npm test

# Run desktop tests only
cd packages/desktop
npm test
```

## Troubleshooting

### "Cannot find module @flow/shared"

**Fix:**
```bash
cd packages/desktop
npm install ../shared
```

### Tauri dev server won't start

**Fix:**
```bash
# Kill any existing processes
pkill -f tauri
# Or on Windows:
taskkill /F /IM flow.exe

# Clear build cache
cd packages/desktop/src-tauri
cargo clean
```

### Changes not reflecting

**Fix:**
```bash
# Hard refresh in Tauri window
Ctrl + R  (Windows/Linux)
Cmd + R   (Mac)
```

## Code Style

### JavaScript/Svelte
- Use 2 spaces for indentation
- Use single quotes for strings
- Follow existing patterns in the codebase

### Rust
- Follow Rust standard formatting (`cargo fmt`)
- Use descriptive variable names
- Add comments for complex logic

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Related Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Publishing your own version
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [RELEASE_GUIDE.md](RELEASE_GUIDE.md) - Creating releases
