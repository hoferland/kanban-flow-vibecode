# Release Guide - Flow Kanban

Complete guide for creating and distributing releases of Flow Kanban.

## Quick Start

The fastest way to create a release:

```bash
./scripts/create-github-release.sh
```

This script will:
1. Optionally update the version number
2. Build the application for your Mac's architecture
3. Generate all necessary files including `latest.json`
4. Create a GitHub release with all artifacts
5. Enable automatic updates for users

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating Your First Release](#creating-your-first-release)
3. [How Auto-Updates Work](#how-auto-updates-work)
4. [Manual Release Process](#manual-release-process)
5. [Troubleshooting](#troubleshooting)
6. [Architecture Support](#architecture-support)

---

## Prerequisites

### Required Tools

1. **GitHub CLI**
   ```bash
   brew install gh
   gh auth login
   ```

2. **Tauri Signing Key**
   - Your private key should be at `~/.tauri/flow-kanban.key`
   - Or set `TAURI_PRIVATE_KEY_PATH` environment variable

3. **Development Environment**
   - Node.js and npm installed
   - Rust toolchain installed
   - All dependencies: `npm install`

### Initial Setup

1. **Update tauri.conf.json**

   Set your GitHub repository in the updater endpoint:
   ```json
   "updater": {
     "active": true,
     "endpoints": [
       "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json"
     ]
   }
   ```

2. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

---

## Creating Your First Release

### Automated Method (Recommended)

Run the release script from the project root:

```bash
./scripts/create-github-release.sh
```

The script will guide you through:

1. **Version Update** (optional)
   - Press `n` to keep current version
   - Press `y` to enter a new version (e.g., `0.2.3`)

2. **Release Notes**
   - Press Enter for default notes
   - Or type custom release notes

3. **Build Process**
   - Automatically builds for your Mac's architecture
   - Takes 2-5 minutes

4. **Review & Confirm**
   - Reviews generated `latest.json`
   - Confirms before publishing

5. **Done!**
   - Release is live on GitHub
   - Users will automatically receive updates

### What Gets Created

The script creates these files:

**For Manual Installation:**
- `Flow_X.X.X_aarch64.dmg` - Apple Silicon installer (if building on M1/M2/M3)
- `Flow_X.X.X_x64.dmg` - Intel installer (if building on Intel Mac)

**For Auto-Updates:**
- `Flow_X.X.X_aarch64.dmg.tar.gz` - Compressed update (Apple Silicon)
- `Flow_X.X.X_x64.dmg.tar.gz` - Compressed update (Intel)
- `Flow_X.X.X_aarch64.dmg.tar.gz.sig` - Security signature (Apple Silicon)
- `Flow_X.X.X_x64.dmg.tar.gz.sig` - Security signature (Intel)
- `latest.json` - Update manifest (tells app about new versions)

---

## How Auto-Updates Work

### For Users

1. **First Installation**
   - Download `.dmg` from GitHub Releases
   - Open the file and drag to Applications
   - Right-click app → "Open" (first time only)

2. **Automatic Updates**
   - App checks for updates on startup
   - User sees notification when update available
   - Click "Update Now" to download and install
   - App restarts automatically
   - All data is preserved

### Update Flow

```
User Opens App
     ↓
App reads latest.json from GitHub
     ↓
Compares version with current
     ↓
If newer version exists:
  → Shows UpdateNotification component
  → User clicks "Update Now"
  → Downloads .dmg.tar.gz file
  → Verifies with .sig file
  → Installs and restarts
```

### Update Manifest (latest.json)

The `latest.json` file tells the app about available updates:

```json
{
  "version": "0.2.2",
  "notes": "Bug fixes and improvements",
  "pub_date": "2025-12-12T16:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ...",
      "url": "https://github.com/USER/REPO/releases/download/v0.2.2/Flow_0.2.2_aarch64.dmg.tar.gz"
    },
    "darwin-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ...",
      "url": "https://github.com/USER/REPO/releases/download/v0.2.2/Flow_0.2.2_x64.dmg.tar.gz"
    }
  }
}
```

**Important:** Only include platforms that were actually built. The script handles this automatically.

---

## Manual Release Process

If you prefer to create releases manually:

### Step 1: Build

```bash
./scripts/build-release.sh
```

### Step 2: Locate Files

```bash
cd packages/desktop/src-tauri/target/release/bundle/
```

Files are in:
- `dmg/` - DMG installers
- `macos/` - .tar.gz and .sig files

### Step 3: Create latest.json

```bash
cd dmg/
```

Create `latest.json`:

```json
{
  "version": "0.2.2",
  "notes": "Your release notes",
  "pub_date": "2025-12-12T16:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "<paste content from .sig file>",
      "url": "https://github.com/USER/REPO/releases/download/v0.2.2/Flow_0.2.2_aarch64.dmg.tar.gz"
    }
  }
}
```

Get signatures:
```bash
cat Flow_0.2.2_aarch64.dmg.tar.gz.sig
```

### Step 4: Create GitHub Release

```bash
gh release create v0.2.2 \
  --title "Flow 0.2.2" \
  --notes "Your release notes" \
  dmg/Flow_0.2.2_aarch64.dmg \
  macos/Flow.app.tar.gz \
  macos/Flow.app.tar.gz.sig \
  dmg/latest.json
```

---

## Troubleshooting

### "gh: command not found"

Install GitHub CLI:
```bash
brew install gh
gh auth login
```

### "Private key not found"

The script looks for the key at `~/.tauri/flow-kanban.key`.

Set a custom path:
```bash
export TAURI_PRIVATE_KEY_PATH="/path/to/your/key"
```

### Build Fails

Update dependencies:
```bash
rustup update
cd packages/desktop && npm install
```

Clean and rebuild:
```bash
cd packages/desktop/src-tauri
rm -rf target
cd ../..
npm run tauri build
```

### "Unidentified Developer" Warning

This is normal without Apple code signing ($99/year Apple Developer account).

**Solution for users:**
1. Right-click the app → "Open"
2. Click "Open" in the dialog
3. Only needed once

### Updates Not Detected

**Check:**
1. Is `latest.json` in the GitHub release?
2. Is the updater endpoint URL correct in `tauri.conf.json`?
3. Is the version in `latest.json` higher than installed version?
4. Check browser console for error messages (in development)

**Verify latest.json is accessible:**
```bash
curl -L https://github.com/USER/REPO/releases/latest/download/latest.json
```

### DMG Build Fails: "error running bundle_dmg.sh"

This error occurs when there are leftover DMG files from previous builds.

**Solution:** The updated script automatically cleans old DMG files before building. If you still encounter this issue:

```bash
# Manually clean old DMG files
rm -rf packages/desktop/src-tauri/target/release/bundle/dmg/*.dmg
rm -rf packages/desktop/src-tauri/target/release/bundle/macos/rw.*.dmg

# Then run the release script again
./scripts/create-github-release.sh
```

**Note:** Tauri creates updater files as `Flow.app.tar.gz` in the `macos/` directory. The release script automatically copies and renames these files with proper version numbers for the GitHub release.

---

## Architecture Support

### Current Behavior

- Building on **Apple Silicon Mac** → Creates Apple Silicon (aarch64) builds only
- Building on **Intel Mac** → Creates Intel (x64) builds only

The release script automatically:
- Detects which architecture was built
- Includes only that architecture in `latest.json`
- Shows appropriate warnings if expected files are missing

### Supporting Both Architectures

To support both architectures in a single release, you would need to:

1. Build on both Mac types
2. Manually combine the artifacts
3. Create `latest.json` with both platforms

This is an advanced use case. Most projects choose one architecture (typically Apple Silicon for new Macs).

---

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- `0.1.0` → `0.1.1` - Bug fixes
- `0.1.0` → `0.2.0` - New features (backward compatible)
- `0.1.0` → `1.0.0` - Major changes (breaking changes)

---

## Data Persistence

- All card data is stored in **localStorage** on each user's computer
- Data is NOT uploaded to any server
- Data persists through app updates
- The app identifier (`com.flow.kanban`) ensures data stays connected to the app

---

## Security

### Code Signing

Without an Apple Developer account ($99/year), apps show an "unidentified developer" warning.

**Users can bypass this:**
1. Right-click app → "Open"
2. Click "Open" in dialog
3. Only needed once

**To get proper code signing:**
1. Enroll in Apple Developer Program
2. Create signing certificates
3. Update `tauri.conf.json` with certificate info
4. Rebuild releases

### Update Verification

Updates are verified using cryptographic signatures:
- Each `.dmg.tar.gz` has a corresponding `.sig` file
- App verifies signature before installing
- Prevents tampered updates from being installed

---

## Quick Reference

```bash
# Create a release (automated)
./scripts/create-github-release.sh

# Build only (no release)
./scripts/build-release.sh

# Check current version
grep '"version"' packages/desktop/src-tauri/tauri.conf.json

# View latest release
gh release view --json tagName,name,createdAt,assets

# Test update endpoint
curl -L https://github.com/USER/REPO/releases/latest/download/latest.json
```

---

## Need Help?

- Check the [Tauri documentation](https://tauri.app/v1/guides/distribution/)
- Review logs in the terminal during build
- Check browser console (Dev Tools) for update errors
- Verify all files uploaded to GitHub release

---

**Remember:** The release script handles most of the complexity. Just run `./scripts/create-github-release.sh` and follow the prompts!
