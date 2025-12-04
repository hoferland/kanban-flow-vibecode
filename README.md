# Flow - Personal Kanban App

A lightweight, personal Kanban application designed for UX designers managing work across multiple Scrum teams.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- Rust (for desktop app)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/flow-kanban.git
cd flow-kanban

# Install dependencies
npm install

# Start desktop app
npm run dev:desktop

## Project Strucutre

flow-kanban/
├── packages/
│   ├── desktop/     # Tauri + Svelte desktop app
│   ├── mobile/      # React Native mobile app (coming soon)
│   └── shared/      # Shared business logic
├── docs/            # Documentation
└── tests/           # Tests

🛠️ Development
Desktop App
cd packages/desktop
npm run tauri:dev
Build Desktop App
cd packages/desktop
npm run tauri:build
📝 License
MIT License - see LICENSE file for details

Save it.