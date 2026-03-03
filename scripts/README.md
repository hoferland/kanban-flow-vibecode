# Flow Kanban - Build & Release Scripts

Utility scripts for building, testing, and releasing Flow Kanban desktop application.

---

## 📋 Script Index

### 🚀 Release & Distribution

#### `create-github-release.sh`
Creates a complete GitHub release with DMG file and update manifest.

**Purpose:** Full production release workflow
**What it does:**
- Builds production app bundle
- Creates DMG installer
- Generates signed update manifest
- Creates GitHub release
- Uploads artifacts

**Usage:**
```bash
./scripts/create-github-release.sh
```

**Prerequisites:**
- GitHub CLI (`gh`) authenticated
- Tauri signing keys in environment
- Clean git working tree

---

#### `create-github-release-no-dmg.sh`
Creates GitHub release with app bundle only (no DMG).

**Purpose:** Quick releases or testing
**What it does:**
- Builds production app bundle
- Generates signed update manifest
- Creates GitHub release
- Skips DMG creation

**Usage:**
```bash
./scripts/create-github-release-no-dmg.sh
```

**When to use:**
- Testing release process
- Internal distributions
- When DMG creation fails

---

#### `publish-existing-release.sh`
Publishes a draft release that was created manually or via script.

**Purpose:** Publish pre-created draft releases
**What it does:**
- Finds draft release by tag
- Publishes to make it public
- Triggers auto-update notifications

**Usage:**
```bash
./scripts/publish-existing-release.sh <tag>
# Example: ./scripts/publish-existing-release.sh v0.2.1
```

**When to use:**
- After manual testing of draft release
- Two-stage release process
- When you want to review before publishing

---

#### `build-release.sh`
Builds production app bundle locally (no GitHub interaction).

**Purpose:** Local production builds
**What it does:**
- Runs `tauri build`
- Creates app bundle in `target/release/bundle/`

**Usage:**
```bash
./scripts/build-release.sh
```

**When to use:**
- Testing production builds locally
- Debugging build issues
- Manual distribution

---

### 🧪 Testing & Debugging

#### `create-test-update.sh`
Creates a test update for validating auto-updater without publishing.

**Purpose:** Test auto-update system
**What it does:**
- Creates local update manifest
- Signs update with test keys
- Does NOT publish to GitHub
- Allows local testing of update flow

**Usage:**
```bash
./scripts/create-test-update.sh
```

**When to use:**
- Testing auto-updater changes
- Verifying update signatures
- Debugging update failures

**See also:** `docs/internal/AUTO_UPDATE_TESTING.md`

---

#### `diagnose-update-issue.sh`
Comprehensive diagnostics for auto-update problems.

**Purpose:** Debug update failures
**What it does:**
- Checks update endpoint availability
- Verifies manifest format
- Validates signatures
- Tests public key embedding
- Checks network connectivity

**Usage:**
```bash
./scripts/diagnose-update-issue.sh
```

**When to use:**
- Updates not appearing
- Signature verification errors
- Network/endpoint issues
- After update configuration changes

---

#### `check-app-pubkey.sh`
Verifies public key is correctly embedded in application.

**Purpose:** Validate update signature verification setup
**What it does:**
- Extracts public key from built app
- Compares with expected key
- Confirms signature verification will work

**Usage:**
```bash
./scripts/check-app-pubkey.sh
```

**When to use:**
- After changing signing keys
- Before publishing release
- Debugging signature errors
- Validating build configuration

---

#### `view-update-logs.sh`
Displays Tauri update logs from system.

**Purpose:** View auto-update activity logs
**What it does:**
- Locates Tauri log directory
- Displays recent update logs
- Shows check/download/install activity

**Usage:**
```bash
./scripts/view-update-logs.sh
```

**When to use:**
- Update not working
- Understanding update behavior
- Debugging update failures

---

### 📦 Installation Scripts

#### `install-flow.sh`
Installs app to /Applications for local testing.

**Purpose:** Quick local installation
**What it does:**
- Copies app bundle to `/Applications/`
- Overwrites existing installation
- Useful for testing builds

**Usage:**
```bash
./scripts/install-flow.sh
```

**When to use:**
- Testing production builds
- Manual installation
- Development workflow

---

#### `update-local-app.sh`
Updates local installation with new build.

**Purpose:** Test local update process
**What it does:**
- Removes old app
- Installs new build
- Simulates update workflow

**Usage:**
```bash
./scripts/update-local-app.sh
```

**When to use:**
- Testing update scenarios
- Verifying data persistence
- Development iteration

---

## 🔧 Prerequisites

### Required Tools

All scripts require:
- **macOS** (for DMG and app bundle creation)
- **Node.js 20+** and **npm**
- **Rust** and **Cargo**
- **Tauri CLI** - Install: `cargo install tauri-cli`

### Release Scripts Also Need:
- **GitHub CLI (`gh`)** - Install: `brew install gh`
  - Must be authenticated: `gh auth login`
- **Tauri signing keys** in environment (see below)

### Environment Variables

For release and update scripts:

```bash
# Required for signing updates
export TAURI_PRIVATE_KEY="your-private-key-content"
export TAURI_KEY_PASSWORD="your-key-password"

# Optional: GitHub token (if not using gh auth)
export GITHUB_TOKEN="ghp_your_token"
```

**Security:** Never commit these keys! Add to your `~/.zshrc` or `~/.bash_profile`

### Generating Signing Keys

If you need to generate new keys:

```bash
# Using Tauri CLI
tauri signer generate -w ~/.tauri/flow-kanban.key

# This creates:
# - Private key: ~/.tauri/flow-kanban.key
# - Public key: printed to console (add to tauri.conf.json)
```

See `docs/internal/RELEASE_GUIDE.md` for complete setup.

---

## 📖 Related Documentation

### Essential Reading

- **[Release Guide](../docs/internal/RELEASE_GUIDE.md)** - Complete release process walkthrough
- **[Auto Update Testing](../docs/internal/AUTO_UPDATE_TESTING.md)** - Testing update system
- **[Update Testing Guide](../docs/internal/UPDATE_TESTING_GUIDE.md)** - Manual update testing
- **[Local Testing](../docs/internal/LOCAL_TESTING.md)** - Local build testing

### Troubleshooting

- Updates not working? → Run `diagnose-update-issue.sh`
- Signature errors? → Run `check-app-pubkey.sh`
- Need logs? → Run `view-update-logs.sh`
- See docs/archive/ for historical troubleshooting docs

---

## 🎯 Common Workflows

### Creating a Production Release

```bash
# 1. Ensure clean working tree
git status

# 2. Update version in tauri.conf.json
# 3. Commit version bump

# 4. Create release
./scripts/create-github-release.sh

# 5. Wait for build to complete
# 6. Test the release
# 7. Publish if draft
./scripts/publish-existing-release.sh v0.x.x
```

### Testing Auto-Updates Locally

```bash
# 1. Create test update
./scripts/create-test-update.sh

# 2. Check logs
./scripts/view-update-logs.sh

# 3. Diagnose issues
./scripts/diagnose-update-issue.sh
```

### Quick Development Iteration

```bash
# 1. Build release locally
./scripts/build-release.sh

# 2. Install to test
./scripts/install-flow.sh

# 3. Launch and test
open /Applications/Flow.app
```

---

## ⚠️ Important Notes

### Before Running Scripts

1. **Read the script** - Understand what it does
2. **Check prerequisites** - Ensure tools are installed
3. **Backup data** - Some scripts are destructive
4. **Run from repo root** - Scripts expect to be run from project root

### Script Safety

- ✅ **Safe to run anytime:** `view-update-logs.sh`, `check-app-pubkey.sh`, `diagnose-update-issue.sh`
- ⚠️ **Modifies local files:** `install-flow.sh`, `update-local-app.sh`, `build-release.sh`
- 🔴 **Creates releases:** `create-github-release*.sh`, `publish-existing-release.sh`

### Git Hooks

Some operations may trigger git hooks:
- Pre-commit: Linting, formatting
- Pre-push: Tests

If hooks fail, fix the issues before proceeding.

---

## 🤝 Contributing

If you're adding new scripts:

1. **Follow naming convention:** `verb-noun.sh` (e.g., `build-release.sh`)
2. **Add to this README** with full documentation
3. **Include usage example** and prerequisites
4. **Add comments** in the script itself
5. **Test thoroughly** before committing

---

**Last Updated:** March 2026
**Maintained By:** Flow Kanban team
**Questions?** See docs/internal/ or create an issue
