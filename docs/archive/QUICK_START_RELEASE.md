# Quick Start: Create Your First Release

This guide will walk you through creating your first official release of Flow in just a few steps.

## Prerequisites

Before you start, make sure you have:

1. **GitHub CLI installed and authenticated**
   ```bash
   # Install GitHub CLI (if not already installed)
   brew install gh
   
   # Authenticate with GitHub
   gh auth login
   ```
   Follow the prompts to authenticate with your GitHub account.

2. **Your code pushed to GitHub**
   - Your repository should already be on GitHub at: `https://github.com/YOUR_USERNAME/YOUR_REPO`

3. **Rust and Node.js installed**
   - Rust: Required for Tauri builds
   - Node.js: Required for the frontend

## Step-by-Step Guide

### Step 1: Run the Release Script

From the project root directory, run:

```bash
./scripts/create-github-release.sh
```

### Step 2: Follow the Prompts

The script will ask you a few questions:

1. **"Do you want to update the version?"**
   - For your first release, press `n` (keep the current version 0.1.1)
   - For future releases, press `y` and enter the new version number

2. **"Enter release notes"**
   - Press Enter to use the default notes, or
   - Type your custom release notes (e.g., "Initial release with core kanban features")

3. **Wait for the build** (~2-5 minutes)
   - The script will build your app for both Apple Silicon and Intel Macs
   - You'll see progress messages

4. **"Ready to create GitHub release?"**
   - Review the generated `latest.json` content shown on screen
   - Press `y` to create the release
   - Press `n` to cancel (files will be saved locally)

### Step 3: Done! 🎉

The script will:
- Build your app
- Generate all necessary files (DMGs, signatures, latest.json)
- Create a GitHub release with tag `v0.1.1`
- Upload all files automatically

You'll see a success message with a link to view your release.

## What Gets Created

Your GitHub release will include:

1. **For Users (Manual Install):**
   - `Flow_0.1.1_aarch64.dmg` - Apple Silicon installer
   - `Flow_0.1.1_x64.dmg` - Intel Mac installer

2. **For Auto-Updates:**
   - `Flow_0.1.1_aarch64.dmg.tar.gz` - Compressed update for Apple Silicon
   - `Flow_0.1.1_x64.dmg.tar.gz` - Compressed update for Intel
   - `Flow_0.1.1_aarch64.dmg.tar.gz.sig` - Security signature for Apple Silicon
   - `Flow_0.1.1_x64.dmg.tar.gz.sig` - Security signature for Intel
   - `latest.json` - Update manifest (tells the app about new versions)

## Testing Your Release

### Test the Installation

1. Go to your GitHub release page (the script will give you the link)
2. Download the appropriate `.dmg` file for your Mac
3. Open the `.dmg` file
4. Drag Flow to your Applications folder
5. **Important:** Right-click Flow → "Open" (required first time on macOS)
6. The app should open successfully

### Test Your Data Persistence

1. Create some test cards in the app
2. Close the app
3. Reopen it - your cards should still be there
4. Data is stored in your browser's localStorage

## Future Releases (Updates)

When you want to release a new version:

```bash
# Run the same script
./scripts/create-github-release.sh

# This time, answer "y" to update the version
# Enter the new version number (e.g., 0.2.0)
# Follow the same prompts
```

**What happens for existing users:**
- Users who installed the previous version will automatically see an update notification
- They click "Update Now"
- The app downloads and installs the new version
- All their data is preserved

## Troubleshooting

### "gh: command not found"

Install GitHub CLI:
```bash
brew install gh
gh auth login
```

### "Build failed"

Make sure you have all dependencies:
```bash
# Update Rust
rustup update

# Install frontend dependencies
cd packages/desktop
npm install
```

### "Permission denied" when running script

Make the script executable:
```bash
chmod +x scripts/create-github-release.sh
```

### macOS says "App is from an unidentified developer"

This is normal without Apple code signing ($99/year). Tell users to:
1. Right-click the app
2. Click "Open"
3. Click "Open" in the dialog
4. This only needs to be done once

### Update not detected

Make sure:
1. The `latest.json` file was uploaded to the release
2. The updater endpoint in `tauri.conf.json` points to your repository
3. Users have an internet connection

## Manual Alternative

If you prefer to create releases manually, you can:

1. Build the app:
   ```bash
   ./scripts/build-release.sh
   ```

2. Follow the instructions in `docs/GITHUB_RELEASE_GUIDE.md` to:
   - Create the `latest.json` file manually
   - Upload files to GitHub manually

## Summary

That's it! With just one command, you can:
- Build your app for all Mac architectures
- Generate all necessary files
- Create a professional GitHub release
- Enable automatic updates for your users

Your first release is now live and ready for others to use! 🚀

## Next Steps

1. **Share the release link** with your users
2. **Test the installation** on a different Mac if possible
3. **Monitor for issues** via GitHub Issues
4. **Plan your next release** with new features or improvements

---

For more detailed information, see:
- [Full Release Guide](./RELEASE.md)
- [GitHub Release Guide](./GITHUB_RELEASE_GUIDE.md)
- [Installation Guide for Users](./INSTALLATION_GUIDE.md)
