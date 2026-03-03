# Flow Kanban - Distribution Setup Complete ✅

Your Flow Kanban app is now configured for private distribution with automatic updates!

## What's Been Set Up

### ✅ Auto-Updater Configuration
- **Tauri updater plugin** enabled in `Cargo.toml` and `tauri.conf.json`
- **Update notification UI** component created (`UpdateNotification.svelte`)
- **Automatic update checking** on app startup
- All user data (localStorage) persists through updates

### ✅ Documentation Created
- **`docs/RELEASE.md`** - Complete guide for building and releasing
- **`docs/INSTALLATION_GUIDE.md`** - User-friendly guide for your friends
- **`scripts/build-release.sh`** - Helper script to build releases

### ✅ Privacy & Security
- All data stored locally (localStorage)
- No server-side storage required
- Private GitHub repository for controlled access
- Updates delivered through GitHub Releases

---

## Quick Start Guide

### 1. Before Your First Release

**Update the GitHub endpoint URL** in `packages/desktop/src-tauri/tauri.conf.json`:

```json
"endpoints": [
  "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json"
]
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

### 2. Create GitHub Repository

```bash
# Create a new private repository on GitHub, then:
git init
git add .
git commit -m "Initial commit - Flow Kanban v0.1.0"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 3. Build Your First Release

Option A: Use the helper script:
```bash
./scripts/build-release.sh
```

Option B: Build manually:
```bash
cd packages/desktop
npm run tauri build
```

Build artifacts will be in: `packages/desktop/src-tauri/target/release/bundle/dmg/`

### 4. Create GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Draft a new release"
3. Tag: `v0.1.0`
4. Title: `Flow v0.1.0 - Initial Release`
5. Upload ALL files from the build folder:
   - `Flow_0.1.0_aarch64.dmg`
   - `Flow_0.1.0_x64.dmg`
   - `Flow_0.1.0_aarch64.dmg.tar.gz`
   - `Flow_0.1.0_x64.dmg.tar.gz`
   - All `.sig` signature files

6. Create `latest.json` (see docs/RELEASE.md for format)
7. Upload `latest.json` to the release
8. Publish release

### 5. Share with Friends

1. Add them as collaborators on GitHub
2. Share the installation guide: `docs/INSTALLATION_GUIDE.md`
3. Share the releases page URL

---

## For Future Updates

### When You Make Changes:

1. **Update version** in `packages/desktop/src-tauri/tauri.conf.json`:
   ```json
   "version": "0.2.0"
   ```

2. **Build the app**:
   ```bash
   ./scripts/build-release.sh
   ```

3. **Create new GitHub release** with the new version tag (e.g., `v0.2.0`)

4. **Upload build files** and updated `latest.json`

5. **Your friends' apps will auto-detect** the update and prompt them to install it

### What Your Friends Experience:

1. They open the app
2. A notification appears: "Update Available - Version 0.2.0"
3. They click "Update Now"
4. App downloads, installs, and restarts
5. Their cards are preserved (all data stays intact)

---

## How It Works

### Update Flow

```
App Starts → Checks GitHub for latest.json
              ↓
          New version found?
              ↓
          Show notification
              ↓
          User clicks "Update Now"
              ↓
          Download update from GitHub
              ↓
          Install and restart
              ↓
          App reopens with same data
```

### Data Storage

- **Location**: `~/Library/Application Support/com.flow.kanban/`
- **Format**: Browser localStorage
- **Persistence**: Survives app updates
- **Privacy**: Never leaves the user's computer

---

## Important Files

### Configuration
- `packages/desktop/src-tauri/tauri.conf.json` - App config & updater settings
- `packages/desktop/src-tauri/Cargo.toml` - Rust dependencies

### Code
- `packages/desktop/src/lib/UpdateNotification.svelte` - Update UI component
- `packages/desktop/src/App.svelte` - Main app (includes UpdateNotification)
- `packages/desktop/src/stores/cardStore.js` - Data storage (localStorage)

### Documentation
- `docs/RELEASE.md` - Detailed release process
- `docs/INSTALLATION_GUIDE.md` - User installation guide
- `scripts/build-release.sh` - Build helper script

---

## Troubleshooting

### Updates Not Working

**Check:**
1. Is `latest.json` uploaded to the GitHub release?
2. Is the endpoint URL correct in `tauri.conf.json`?
3. Are the file URLs in `latest.json` correct?
4. Do users have access to the private repository?

### Build Fails

```bash
# Update Rust
rustup update

# Clean build
cd packages/desktop
rm -rf src-tauri/target
npm run tauri build
```

### "Unidentified Developer" Warning

This is normal without Apple code signing ($99/year Apple Developer account).

**Users should:**
1. Right-click app → "Open"
2. Click "Open" in dialog
3. Only needed once

---

## Optional: Code Signing (Future)

To remove the "unidentified developer" warning:

1. Enroll in Apple Developer Program ($99/year)
2. Get signing certificate
3. Update `tauri.conf.json` with signing info
4. Rebuild with signing enabled

See Apple's [code signing documentation](https://developer.apple.com/support/code-signing/) for details.

---

## Key Benefits of This Setup

✅ **Private** - Only invited users can access  
✅ **Automatic** - Updates happen seamlessly  
✅ **Local** - All data stays on user's computer  
✅ **Free** - No hosting costs (using GitHub)  
✅ **Controlled** - You decide when to release updates  
✅ **Safe** - Data persists through all updates

---

## Next Steps

1. ✅ Configuration complete
2. ⏭️ Update endpoint URL in `tauri.conf.json`
3. ⏭️ Create GitHub repository
4. ⏭️ Build first release
5. ⏭️ Create GitHub release with files
6. ⏭️ Add friends as collaborators
7. ⏭️ Share installation guide

---

## Resources

- **Tauri Documentation**: https://tauri.app
- **GitHub Releases**: https://docs.github.com/en/repositories/releasing-projects-on-github
- **Semantic Versioning**: https://semver.org

---

**You're all set!** 🎉

Your app is ready for private distribution with automatic updates. All user data stays local, and updates are seamless.

For detailed instructions, see:
- Building & releasing: `docs/RELEASE.md`
- User installation: `docs/INSTALLATION_GUIDE.md`
