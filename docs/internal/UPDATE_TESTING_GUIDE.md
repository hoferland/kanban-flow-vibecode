# Update Testing Guide

Complete guide for testing the automatic update system.

## 🎯 Testing Strategy

There are 3 ways to test updates:

### 1. **Full End-to-End Test** (Recommended)
Test the complete update flow as a real user would experience it.

### 2. **Quick Version Check Test**
Verify update detection without installing.

### 3. **Local Update Simulation**
Test with a local server (advanced).

---

## 📋 Method 1: Full End-to-End Test (Best)

This tests everything: detection, download, installation, and notification.

### Prerequisites
- Have v0.2.4 released on GitHub
- Have an older version installed (v0.2.3 or lower)

### Steps

#### Step 1: Install Old Version
```bash
# If you have the old DMG saved, install it
# OR build an old version:
cd /Users/I550797/Desktop/Coding/flow-kanban

# Temporarily revert to old version
git stash  # Save current changes
git checkout HEAD~1  # Go to previous commit

# Build and install
cd packages/desktop
npm run tauri build

# Install the old build
open src-tauri/target/release/bundle/macos/Flow.app

# OR copy to Applications
cp -r src-tauri/target/release/bundle/macos/Flow.app /Applications/

# Return to current version
git checkout main  # or your current branch
git stash pop  # Restore changes if any
```

#### Step 2: Launch Old Version
```bash
# Launch from Applications
open -a Flow

# OR launch directly
open /Applications/Flow.app
```

#### Step 3: Watch for Update

**What to look for:**

1. **On Startup:**
   - App checks for updates automatically
   - Console log: "Checking for updates..."

2. **If Update Available:**
   - Notification appears at top of window
   - Shows: "New version X.X.X available"
   - "Update Now" button appears

3. **After Clicking "Update Now":**
   - Shows "Downloading update..."
   - Downloads in background
   - After download: "Installing update..."
   - App restarts automatically
   - Opens with new version

#### Step 4: Verify New Version

**Check version:**
```bash
# In the app's console (open DevTools)
# You should see the new version number in startup logs

# OR check the About dialog if you have one
# OR check Help → About Flow
```

### Expected Timeline
- **Update check:** ~2-3 seconds after launch
- **Download:** ~10-30 seconds (depends on connection)
- **Install:** ~3-5 seconds
- **Restart:** Automatic

---

## 📋 Method 2: Quick Version Check Test

Test just the update detection without installing.

### Steps

#### Step 1: Check Current Version
```bash
# Open the app and check version in console or about dialog
open -a Flow
```

#### Step 2: Temporarily Lower Version

**Edit `tauri.conf.json`:**
```json
{
  "package": {
    "productName": "Flow",
    "version": "0.2.2"  // Set lower than released version
  }
}
```

#### Step 3: Build & Run
```bash
cd packages/desktop
npm run tauri dev
```

#### Step 4: Observe
- Update notification should appear
- "New version 0.2.4 available" message
- Don't click update (you're in dev mode)

#### Step 5: Restore Version
```bash
# Change tauri.conf.json back to 0.2.4
```

---

## 📋 Method 3: Local Update Simulation (Advanced)

Test with a local update server to avoid needing GitHub releases.

### Prerequisites
```bash
# Install simple HTTP server
npm install -g http-server
# or use Python's built-in server
```

### Steps

#### Step 1: Create Test Update Files

```bash
# Create a test directory
mkdir -p /tmp/flow-update-test
cd /tmp/flow-update-test

# Copy your update files
cp /Users/I550797/Desktop/Coding/flow-kanban/packages/desktop/src-tauri/target/release/bundle/macos/Flow.app.tar.gz ./Flow_0.2.4_aarch64.app.tar.gz
cp /Users/I550797/Desktop/Coding/flow-kanban/packages/desktop/src-tauri/target/release/bundle/macos/Flow.app.tar.gz.sig ./Flow_0.2.4_aarch64.app.tar.gz.sig
```

#### Step 2: Create Local latest.json

Create `/tmp/flow-update-test/latest.json`:
```json
{
  "version": "0.2.4",
  "notes": "Test update",
  "pub_date": "2025-12-15T10:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "<COPY_FROM_YOUR_ACTUAL_SIG_FILE>",
      "url": "http://localhost:8000/Flow_0.2.4_aarch64.app.tar.gz"
    }
  }
}
```

#### Step 3: Start Local Server
```bash
cd /tmp/flow-update-test
python3 -m http.server 8000
# OR
http-server -p 8000
```

#### Step 4: Configure App for Local Updates

**Edit `tauri.conf.json`:**
```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "http://localhost:8000/latest.json"
    ],
    "dialog": false,
    "pubkey": "<YOUR_PUBLIC_KEY>"
  }
}
```

#### Step 5: Test

```bash
# Set version lower
# Edit tauri.conf.json: "version": "0.2.2"

# Build and run
cd packages/desktop
npm run tauri build
open src-tauri/target/release/bundle/macos/Flow.app
```

**Important:** After testing, restore the GitHub endpoint in `tauri.conf.json`!

---

## 🔍 Monitoring & Debugging

### View Console Logs

**In Production App:**
```bash
# macOS Console.app
# Filter for "Flow" or "tauri"

# OR use command line
log stream --predicate 'process == "Flow"' --level debug
```

**In Dev Mode:**
```bash
# Console is automatically visible
npm run tauri dev
```

### What to Look For in Logs

**Successful Update Check:**
```
[INFO] Checking for updates...
[INFO] Update available: 0.2.4
[INFO] Current version: 0.2.3
[INFO] Downloading update from: https://github.com/...
```

**Failed Update Check:**
```
[ERROR] Failed to check for updates: <reason>
[ERROR] Network error / Invalid signature / etc.
```

### Common Issues & Solutions

#### 1. "No update available" when there should be
- ✅ Verify GitHub release exists
- ✅ Check `latest.json` is accessible
- ✅ Confirm version in app < version in release
- ✅ Check updater endpoint URL in tauri.conf.json

#### 2. "Invalid signature"
- ✅ Ensure public key in tauri.conf.json matches private key used to sign
- ✅ Verify .sig file is uploaded to release
- ✅ Check signature wasn't corrupted during upload

#### 3. "Download failed"
- ✅ Check internet connection
- ✅ Verify GitHub release assets are public
- ✅ Check URL in latest.json is correct

#### 4. Update downloads but doesn't install
- ✅ Check app has write permissions
- ✅ Verify app isn't running from read-only location (DMG)
- ✅ Check macOS security settings

---

## ✅ Testing Checklist

Use this checklist for thorough testing:

- [ ] **Update Detection**
  - [ ] App checks for updates on startup
  - [ ] Detects when new version available
  - [ ] Shows update notification

- [ ] **Update Download**
  - [ ] Download starts when "Update Now" clicked
  - [ ] Progress indicator works
  - [ ] Download completes successfully

- [ ] **Update Installation**
  - [ ] Update installs correctly
  - [ ] App restarts automatically
  - [ ] New version launches successfully

- [ ] **Post-Update**
  - [ ] All data preserved
  - [ ] App functions normally
  - [ ] Version number updated
  - [ ] No update notification (already on latest)

- [ ] **Error Handling**
  - [ ] Graceful handling of network errors
  - [ ] Clear error messages
  - [ ] App remains functional if update fails

---

## 🎯 Recommended Test Flow

**For your situation (first real release):**

1. **Publish v0.2.4 to GitHub**
   ```bash
   ./scripts/publish-existing-release.sh
   ```

2. **Create test version 0.2.2**
   - Set version to 0.2.2 in tauri.conf.json
   - Build: `npm run tauri build`
   - Install to /Applications

3. **Test update**
   - Launch the 0.2.2 version
   - Wait for update notification
   - Click "Update Now"
   - Verify it updates to 0.2.4

4. **Verify result**
   - App should restart automatically
   - Check version is now 0.2.4
   - Verify all your data is intact

---

## 💡 Pro Tips

1. **Keep Old DMGs:** Save DMG files of each version for easy testing

2. **Test on Clean Install:** Test with a fresh macOS user account to simulate first-time users

3. **Check Different Scenarios:**
   - Fresh install
   - Update from previous version
   - Skip a version (0.2.2 → 0.2.4)

4. **Monitor GitHub API:** Check rate limits if testing many times
   ```bash
   curl -s https://api.github.com/rate_limit
   ```

5. **Disable Gatekeeper for Testing:** (Re-enable after!)
   ```bash
   sudo spctl --master-disable  # Disable
   sudo spctl --master-enable   # Re-enable
   ```

---

## 🚀 Quick Start

**Fastest way to test right now:**

```bash
# 1. Publish v0.2.4
./scripts/publish-existing-release.sh

# 2. Lower version temporarily
# Edit packages/desktop/src-tauri/tauri.conf.json
# Change "version": "0.2.4" to "version": "0.2.2"

# 3. Build test version
cd packages/desktop
npm run tauri build

# 4. Run it
open src-tauri/target/release/bundle/macos/Flow.app

# 5. Watch for update notification!
# Should appear within 5 seconds of app opening

# 6. Restore version
# Change tauri.conf.json back to "0.2.4"
```

That's it! The update should be detected and offered automatically.
