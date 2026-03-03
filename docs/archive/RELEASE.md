# Release & Distribution Guide

This guide explains how to build, release, and distribute Flow as a desktop application with automatic updates.

## Table of Contents

1. [Initial GitHub Setup](#initial-github-setup)
2. [Building the Application](#building-the-application)
3. [Creating a Release](#creating-a-release)
4. [How Updates Work](#how-updates-work)
5. [Troubleshooting](#troubleshooting)

---

## Initial GitHub Setup

### 1. Create a Private GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top-right corner → "New repository"
3. Fill in:
   - **Repository name**: `flow-kanban` (or your preferred name)
   - **Description**: "Personal Kanban Board for UX Designers"
   - **Privacy**: Select **Private**
   - **DO NOT** initialize with README (you already have one)
4. Click "Create repository"

### 2. Update tauri.conf.json

Before pushing to GitHub, update the updater endpoint:

1. Open `packages/desktop/src-tauri/tauri.conf.json`
2. Find the `plugins.updater.endpoints` section
3. Replace `YOUR_USERNAME/YOUR_REPO` with your actual GitHub username and repository name:

```json
"endpoints": [
  "https://github.com/YOUR_USERNAME/flow-kanban/releases/latest/download/latest.json"
]
```

Example: If your username is `johndoe`:
```json
"endpoints": [
  "https://github.com/johndoe/flow-kanban/releases/latest/download/latest.json"
]
```

### 3. Push Your Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Flow Kanban v0.1.0"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Add Collaborators (Your Friends)

1. Go to your repository on GitHub
2. Click "Settings" → "Collaborators"
3. Click "Add people"
4. Enter their GitHub usernames or email addresses
5. They'll receive an invitation to access the private repository

---

## Building the Application

### Prerequisites

Make sure you have:
- Node.js installed
- Rust installed (required for Tauri)
- All dependencies installed: `npm install`

### Build for Production

From the project root directory:

```bash
# Navigate to desktop package
cd packages/desktop

# Build the production app
npm run tauri build
```

This will create:
- **macOS**: `.dmg` installer in `packages/desktop/src-tauri/target/release/bundle/dmg/`
- **Apple Silicon (.aarch64)**: For M1/M2/M3 Macs
- **Intel (.x64)**: For Intel Macs

The build process typically takes 2-5 minutes.

### What Gets Generated

After building, you'll find:
- `Flow_0.1.0_aarch64.dmg` - For Apple Silicon Macs (M1/M2/M3)
- `Flow_0.1.0_x64.dmg` - For Intel Macs
- Update signature files (`.sig`)

---

## Creating a Release

### Method 1: Manual Release (Recommended for First Release)

#### Step 1: Create GitHub Personal Access Token

This is needed to create releases from the command line (optional for manual releases):

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Flow Releases"
4. Select scopes:
   - `repo` (Full control of private repositories)
5. Click "Generate token"
6. **IMPORTANT**: Copy the token immediately (you won't see it again)
7. Save it securely (you'll use it for automated releases later)

#### Step 2: Create the Release on GitHub

1. Go to your repository on GitHub
2. Click "Releases" (on the right sidebar) → "Draft a new release"
3. Fill in:
   - **Tag version**: `v0.1.0` (must start with 'v')
   - **Release title**: `Flow v0.1.0 - Initial Release`
   - **Description**: Describe what's new or what the app does

Example description:
```
## Flow v0.1.0 - Initial Release

Personal Kanban board for UX designers managing multiple teams.

### Features
- Inbox, Next, In Progress, and Done columns
- Filter by team and work type
- Drag and drop cards
- Auto-save to local storage
- Automatic updates

### Installation
1. Download the appropriate `.dmg` file for your Mac:
   - Apple Silicon (M1/M2/M3): Download `Flow_0.1.0_aarch64.dmg`
   - Intel: Download `Flow_0.1.0_x64.dmg`
2. Open the `.dmg` file
3. Drag Flow to Applications
4. Right-click Flow → "Open" (first time only due to no code signing)

All your data is stored locally on your computer.
```

4. Upload the files:
   - Drag and drop the `.dmg` files from `packages/desktop/src-tauri/target/release/bundle/dmg/`
   - Upload ALL `.dmg` and `.dmg.tar.gz` and `.sig` files

5. Click "Publish release"

#### Step 3: Generate Update Manifest

After creating the release, you need to manually create the `latest.json` file:

1. Create a file named `latest.json` with this content (update the values):

```json
{
  "version": "0.1.0",
  "notes": "Initial release with core features",
  "pub_date": "2025-05-12T15:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "PASTE_SIGNATURE_FROM_aarch64.dmg.tar.gz.sig_FILE_HERE",
      "url": "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v0.1.0/Flow_0.1.0_aarch64.dmg.tar.gz"
    },
    "darwin-x86_64": {
      "signature": "PASTE_SIGNATURE_FROM_x64.dmg.tar.gz.sig_FILE_HERE",
      "url": "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v0.1.0/Flow_0.1.0_x64.dmg.tar.gz"
    }
  }
}
```

2. Get the signatures:
   - Open `Flow_0.1.0_aarch64.dmg.tar.gz.sig` in a text editor
   - Copy the entire content (it's a long string)
   - Paste it in the `signature` field for `darwin-aarch64`
   - Repeat for `Flow_0.1.0_x64.dmg.tar.gz.sig` → `darwin-x86_64`

3. Update the date to current UTC time (format: `YYYY-MM-DDTHH:MM:SSZ`)

4. Upload `latest.json` to the same release

---

## How Updates Work

### For You (Developer)

1. Make changes to the app
2. Update version in `packages/desktop/src-tauri/tauri.conf.json`:
   ```json
   "version": "0.2.0"
   ```
3. Build the app: `npm run tauri build`
4. Create a new GitHub release with the new version
5. Your friends' apps will automatically detect the update

### For Your Friends (Users)

1. **First Installation**:
   - Download the `.dmg` from GitHub Releases
   - Right-click → "Open" (to bypass "unidentified developer" warning)
   - The app opens and they can start using it

2. **Automatic Updates**:
   - When they open the app, it checks for updates
   - If a new version exists, they see a notification
   - Click "Update Now" → app downloads, installs, and restarts
   - All their cards are preserved (stored locally)

### Data Persistence

- All card data is stored in **localStorage** on each user's computer
- Data is NOT uploaded to any server
- Data persists through app updates
- The app identifier (`com.flow.kanban`) ensures data stays connected to the app

---

## Troubleshooting

### "The app is from an unidentified developer"

This is normal without Apple code signing ($99/year Apple Developer account).

**Solution for users**:
1. Right-click the app → "Open"
2. Click "Open" in the dialog
3. This only needs to be done once

### Updates not detected

**Check**:
1. Is the `latest.json` file in the GitHub release?
2. Is the endpoint URL correct in `tauri.conf.json`?
3. Is the repository private? Ensure users have access
4. Check browser console in dev tools for error messages

### Build fails

**Common fixes**:
```bash
# Update Rust
rustup update

# Clean build
cd packages/desktop
rm -rf src-tauri/target
npm run tauri build
```

### "Permission denied" on macOS

Users need to:
1. Open System Settings → Privacy & Security
2. Scroll down to find the blocked app
3. Click "Open Anyway"

---

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- `0.1.0` → `0.1.1` - Bug fixes
- `0.1.0` → `0.2.0` - New features (backward compatible)
- `0.1.0` → `1.0.0` - Major changes (might break things)

---

## Future Enhancements

### Add Code Signing (Optional)

To remove the "unidentified developer" warning:

1. Enroll in Apple Developer Program ($99/year)
2. Create signing certificates
3. Update `tauri.conf.json` with certificate info
4. Rebuild and releases will be properly signed

### Automate Releases (Optional)

Create a script to automate building and releasing:

```bash
#!/bin/bash
# release.sh

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh <version>"
  exit 1
fi

# Update version in tauri.conf.json
# Build app
# Create GitHub release
# Upload files
```

---

## Quick Reference

```bash
# Build production app
cd packages/desktop && npm run tauri build

# Files will be in:
packages/desktop/src-tauri/target/release/bundle/dmg/

# Update version before each release
# Edit: packages/desktop/src-tauri/tauri.conf.json
```

---

**Need Help?** Check the [Tauri documentation](https://tauri.app/v1/guides/distribution/) for more advanced topics.
