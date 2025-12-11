# Flow - Personal Kanban Board

<div align="center">

![Flow Version](https://img.shields.io/badge/version-0.2.1-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A lightweight, privacy-focused Kanban application designed for UX designers managing work across multiple teams.

[Download Latest Release](https://github.com/hoferland/kanban-flow-vibecode/releases/latest) • [Installation Guide](docs/INSTALLATION_GUIDE.md) • [Documentation](docs/)

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
- 💾 **Auto-Save** - Changes saved instantly, no manual save needed

## 📥 Installation

### For End Users

1. **Download** the latest release from the [Releases page](https://github.com/hoferland/kanban-flow-vibecode/releases/latest)
2. **Install** by dragging Flow.app to your Applications folder
3. **Launch** by right-clicking Flow → "Open" (first time only)

For detailed installation instructions, see the [Installation Guide](docs/INSTALLATION_GUIDE.md).

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
│   ├── desktop/              # Tauri + Svelte desktop application
│   │   ├── src/             # Svelte components and app logic
│   │   ├── src-tauri/       # Rust backend (Tauri)
│   │   └── public/          # Static assets
│   ├── mobile/              # React Native (planned)
│   └── shared/              # Shared business logic and models
│       ├── src/models/      # Data models
│       └── src/constants/   # Shared constants
├── docs/                    # Documentation
│   ├── INSTALLATION_GUIDE.md
│   ├── DEVELOPMENT.md
│   ├── ARCHITECTURE.md
│   └── RELEASE.md
├── scripts/                 # Build and release scripts
│   ├── create-github-release.sh
│   └── build-release.sh
└── tests/                   # Test files
```

## 🏗️ Architecture

Flow is built using:

- **Frontend**: Svelte 4 + Vite
- **Backend**: Tauri 2 (Rust)
- **Storage**: LocalStorage (browser-based, persisted)
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

- **[Installation Guide](docs/INSTALLATION_GUIDE.md)** - End-user installation instructions
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup for developers
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture overview
- **[Release Guide](docs/RELEASE.md)** - Creating and publishing releases
- **[Quick Start](docs/QUICK_START_RELEASE.md)** - Quick release process guide

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

For more help, see [Installation Guide](docs/INSTALLATION_GUIDE.md) or [create an issue](https://github.com/hoferland/kanban-flow-vibecode/issues).

## 🎯 Roadmap

- [ ] Export/Import functionality
- [ ] Dark mode
- [ ] Custom themes
- [ ] Keyboard shortcuts
- [ ] Mobile app (React Native)
- [ ] Card templates
- [ ] Time tracking
- [ ] Statistics and insights

## 💡 Inspiration

Flow is inspired by:
- **Personal Kanban** methodology by Jim Benson
- **Japandi** design aesthetic
- **Getting Things Done (GTD)** principles

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

Created by hoferland

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/)
- UI framework: [Svelte](https://svelte.dev/)
- Icons: Custom SVG icons

---

<div align="center">

**[⬆ Back to Top](#flow---personal-kanban-board)**

Made with ❤️ for UX designers managing multiple teams

</div>
