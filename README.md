# Flow - Personal Kanban Board

<div align="center">

![Flow Version](https://img.shields.io/badge/version-0.4.1-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A lightweight, privacy-focused Kanban application designed for UX designers managing work across multiple teams.

[Download Latest Release](https://github.com/hoferland/kanban-flow-vibecode/releases/latest) • [Installation Guide](docs/external/INSTALLATION_GUIDE.md) • [Documentation](docs/)

</div>

---

## ✨ Features

- 🎯 **Personal Kanban Board** - Simple, distraction-free task management
- 👥 **Multi-Team Support** - Organize work across different teams and areas
- 🔒 **Privacy-First** - All data stored locally on your computer
- 🔄 **Auto-Updates** - Seamless updates with data preservation
- 🎨 **Clean Design** - Minimalist interface inspired by Japandi aesthetics
- ⚙️ **Customizable Columns** - Configure columns, limits, and workflow
- 🏷️ **Flexible Filtering** - Filter by team, area, or work type
- 📅 **Custom DatePicker** - Smart date selection with quick actions
- 💾 **Auto-Save** - Changes saved instantly, no manual save needed

## 📥 Installation

### For End Users

1. **Download** the latest release from the [Releases page](https://github.com/hoferland/kanban-flow-vibecode/releases/latest)
2. **Install** by dragging Flow.app to your Applications folder
3. **Launch** by right-clicking Flow → "Open" (first time only)

For detailed installation instructions, see the [Installation Guide](docs/external/INSTALLATION_GUIDE.md).

#### macOS Quarantine Fix

If the app won't open due to security restrictions:

```bash
xattr -cr /Applications/Flow.app
```

### For Developers

See the [Development Setup](#-development-setup) section below.

## 🚀 Quick Start (Users)

1. **Add a Card** - Click "New Card" button in the header
2. **Organize** - Drag cards between columns (Inbox → Next → In Progress → Done)
3. **Filter** - Use filter buttons to view specific teams or work types
4. **Edit** - Click any card to edit details or delete
5. **Configure** - Click ⚙️ to customize columns and limits

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Rust** ([Install via rustup](https://rustup.rs/))
- **Git**

### Quick Start

```bash
# Clone repository
git clone https://github.com/hoferland/kanban-flow-vibecode.git
cd flow-kanban

# Install dependencies
npm install

# Start development server
cd packages/desktop
npm run tauri dev
```

### Development Commands

```bash
# Start dev server with hot reload
npm run tauri dev

# Build production app
npm run tauri build

# Run tests
npm test

# Lint code
npm run lint
```

## 📦 Project Structure

```
flow-kanban/
├── packages/
│   ├── desktop/              # ✅ Tauri + Svelte desktop application (ACTIVE)
│   │   ├── src/             # Svelte components and app logic
│   │   ├── src-tauri/       # Rust backend (Tauri)
│   │   └── public/          # Static assets
│   ├── mobile/              # ⚠️ React Native (PLANNED - Not Implemented)
│   └── shared/              # Shared business logic and models
│       ├── src/models/      # Data models
│       └── src/constants/   # Shared constants
├── docs/                    # Documentation
│   ├── external/            # User documentation
│   ├── internal/            # Developer documentation
│   └── archive/             # Historical documentation
├── scripts/                 # Build and release scripts
│   ├── create-github-release.sh
│   └── build-release.sh
└── tests/                   # Test files
```

## 🏗️ Architecture

Flow is built using:

- **Frontend**: Svelte 4 + Vite
- **Backend**: Tauri 2 (Rust)
- **Storage**: SQLite database (via Tauri)
- **Updates**: Tauri auto-updater with cryptographic signatures
- **UI**: Custom CSS with Japandi-inspired design

For detailed architecture information, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 🔄 Release Process

### Creating a New Release

```bash
# Run the release script
./scripts/create-github-release.sh

# Follow the prompts to:
# 1. Update version number
# 2. Add release notes
# 3. Build the app
# 4. Create GitHub release
```

The script will:
- Build the production app
- Generate update manifests
- Create signed update packages
- Publish to GitHub releases

For detailed release instructions, see [RELEASE.md](docs/RELEASE.md).

## 📚 Documentation

Documentation is organized into two categories:

### 👥 For Users ([docs/external/](docs/external/))
- **[Installation Guide](docs/external/INSTALLATION_GUIDE.md)** - Complete installation instructions
- **[macOS Quarantine Fix](docs/external/MACOS_QUARANTINE_FIX.md)** - Troubleshooting security warnings
- **[Quick Start Guide](#-quick-start-users)** - Getting started with Flow

### 👨‍💻 For Developers ([docs/internal/](docs/internal/))
- **[Development Guide](docs/internal/DEVELOPMENT.md)** - Development environment setup
- **[Architecture](docs/internal/ARCHITECTURE.md)** - Technical architecture overview
- **[Release Guide](docs/internal/RELEASE_GUIDE.md)** - Creating and publishing releases
- **[Improvements Backlog](docs/internal/IMPROVEMENTS.md)** - Planned enhancements (PM/UX/Dev)
- **[DatePicker Implementation](docs/internal/DATEPICKER_IMPLEMENTATION.md)** - Custom component reference
- **[More...](docs/internal/)** - Testing guides, database docs, and more

## 🔐 Security & Privacy

- ✅ **No telemetry** - Zero tracking or analytics
- ✅ **Local storage** - All data stays on your computer
- ✅ **No accounts** - No logins, no cloud services
- ✅ **Signed updates** - Cryptographically verified updates
- ✅ **Open source** - Review the code yourself

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🤝 Contributing

This is a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

See [Releases](https://github.com/hoferland/kanban-flow-vibecode/releases) for version history and changes.

### Recent Updates

- **v0.2.1** - Fixed column width to be default and not adjusting
- **v0.2.0** - Added column configuration modal
- **v0.1.1** - Initial release with core features

## ⚙️ Configuration

### Column Configuration

Customize your workflow by configuring columns:
- **Labels** - Rename columns to match your workflow
- **Order** - Rearrange columns by dragging
- **Limits** - Set WIP (Work In Progress) limits
- **Colors** - Visual indicators (coming soon)

### Data Location

Your data is stored locally at:
```
~/Library/Application Support/com.flow.kanban/
```

## 🐛 Troubleshooting

### App won't open on macOS

```bash
# Remove quarantine attribute
xattr -cr /Applications/Flow.app
```

### Updates not working

1. Check internet connection
2. Restart the app
3. Manually download latest version

### Lost cards

1. Check active filter (switch to "All")
2. Check data directory: `~/Library/Application Support/com.flow.kanban/`

For more help, see [Installation Guide](docs/external/INSTALLATION_GUIDE.md) or [create an issue](https://github.com/hoferland/kanban-flow-vibecode/issues).

## 🎯 Roadmap

See [IMPROVEMENTS.md](docs/internal/IMPROVEMENTS.md) for a comprehensive list of planned enhancements.

### Recently Completed ✅
- **v0.2.2** - Custom DatePicker component with smart formatting and quick actions

### Next Up (v0.3.0) - Stability & Quality
- [ ] Error handling improvements
- [ ] Data migration system
- [ ] Basic test coverage
- [ ] Enhanced documentation

### Core Features (v0.4.0)
- [ ] **Export/Import** - Backup and restore your data
- [ ] **Search & Quick Find** - Find cards instantly
- [ ] **Undo/Redo** - Safety net for accidental changes
- [ ] **Keyboard Shortcuts** - Power user workflows

### UX Polish (v0.5.0)
- [ ] **Dark Mode** - Eye-friendly theme for low-light environments
- [ ] **Visual WIP Limits** - Color-coded warnings for column limits
- [ ] **Card Quick Actions** - Inline editing and quick menus
- [ ] **Enhanced Filters** - Show active filters as dismissible tags

### Power Features (v1.0.0)
- [ ] **Analytics Dashboard** - Cycle time, throughput metrics
- [ ] **Card Templates** - Predefined templates for recurring tasks
- [ ] **Batch Operations** - Multi-select and bulk actions
- [ ] **Enhanced Accessibility** - WCAG 2.1 AA compliance

### Platform Expansion (v1.1.0+)
- [ ] **Windows/Linux Support** - Cross-platform availability
- [ ] **Mobile App** - React Native implementation
- [ ] **TypeScript Migration** - Enhanced type safety
- [ ] **Advanced Features** - Time tracking, recurring tasks, integrations

<details>
<summary><strong>📅 DatePicker Future Enhancements</strong></summary>

The custom DatePicker is production-ready, but these optional enhancements could be added:

#### Phase 2 - Advanced Interactions
- [ ] Full keyboard navigation (arrow keys to navigate dates)
- [ ] Tab order management throughout calendar
- [ ] Enhanced screen reader announcements
- [ ] Date range selection (start/end dates)

#### Phase 3 - Power Features
- [ ] Natural language parsing ("tomorrow", "next monday", "+3d")
- [ ] Month/year quick picker (click to jump to any month/year)
- [ ] Week numbers display for project planning
- [ ] Custom date format preferences
- [ ] Recurring date patterns

#### Phase 4 - Customization
- [ ] First day of week preference (Sunday vs Monday)
- [ ] Configurable quick actions
- [ ] Theme variants (dark mode support)
- [ ] Optional time picker integration

</details>

## 💡 Inspiration

Flow is inspired by:
- **Personal Kanban** methodology by Jim Benson
- **Japandi** design aesthetic
- **Getting Things Done (GTD)** principles

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

Created with ❤️ for personal productivity

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/)
- UI framework: [Svelte](https://svelte.dev/)
- Icons: Custom SVG icons

---

<div align="center">

**[⬆ Back to Top](#flow---personal-kanban-board)**

Made with ❤️ in Heidelberg

</div>
