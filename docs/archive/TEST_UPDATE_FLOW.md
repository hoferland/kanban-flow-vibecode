# Testing Auto-Update Flow - Complete Guide

## Why You See No Notification

Your current app is **v0.2.1** and GitHub also has **v0.2.1**.

✅ This is **CORRECT** behavior - no update notification should appear!

The updater is working properly by detecting you're already on the latest version.

## How to See an Update Notification

You need to create a newer version on GitHub. Here's exactly how:

### Step-by-Step: Test the Full Update Flow

#### Step 1: Create Version 0.2.2

1. **Update the version in `tauri.conf.json`:**

```json
{
  "package": {
    "productName": "Flow",
    "version": "0.2.2"  // Change from 0.2.1 to 0.2.2
  }
}
```

2. **Build the new version:**

```bash
cd packages/desktop
TAURI_PRIVATE_KEY="$HOME/.tauri/flow-kanban.key" npm run tauri build
```

Enter your key password when prompted.

3. **Verify the build succeeded:**

```bash
ls -la packages/desktop/src-tauri/target/release/bundle/macos/
# Should see Flow.app and other files

ls -la packages/desktop/src-tauri/target/release/bundle/dmg/
# Should see latest.json
```

#### Step 2: Create GitHub Release v0.2.2

1. **Go to GitHub releases:**
   https://github.com/hoferland/kanban-flow-vibecode/releases/new

2. **Fill in the release details:**
   - Tag version: `v0.2.2`
   - Release title: `Flow 0.2.2`
   - Description: `Testing auto-update functionality`

3. **Upload ALL these files** (from `packages/desktop/src-tauri/target/release/bundle/`):
   
   From `bundle/dmg/`:
   - `latest.json` ← **CRITICAL**
   
   From `bundle/macos/`:
   - `Flow.app.tar.gz`
   - `Flow.app.tar.gz.sig`
   
   Or you can upload the DMG if you prefer:
   - `Flow_0.2.2_aarch64.dmg` (from bundle/dmg/)

4. **Publish the release**

#### Step 3: Keep v0.2.1 Installed

**Important:** Don't install v0.2.2 yet! Keep v0.2.1 installed so you can test the update.

```bash
# Make sure you have v0.2.1 installed
# Check in /Applications/Flow.app
```

If you need to reinstall v0.2.1:
```bash
# Option 1: Download from GitHub
# https://github.com/hoferland/kanban-flow-vibecode/releases/tag/v0.2.1

# Option 2: Build v0.2.1 locally
# Change tauri.conf.json back to "version": "0.2.1"
# Build and install
```

#### Step 4: Launch and See the Update Notification!

```bash
open /Applications/Flow.app
```

Within a few seconds, you should see:
- ✅ A notification in the **top-right corner**
- ✅ Shows "Update Available"
- ✅ Displays "Version 0.2.2 is ready to install"
- ✅ Has "Update Now" and "Later" buttons

#### Step 5: Test the Update Process

1. **Click "Update Now"**
2. **Watch it download** (shows spinner and "Downloading update...")
3. **App restarts automatically**
4. **Verify new version** - Check if it's now v0.2.2

## Alternative: Quick Test Without GitHub Release

If you want to test locally without creating a GitHub release:

### Option A: Temporarily Change the Endpoint

1. **Change `tauri.conf.json` to point to a local test file:**

```json
"updater": {
  "active": true,
  "endpoints": [
    "http://localhost:8080/latest.json"
  ],
  // ... rest of config
}
```

2. **Serve the file locally:**

```bash
# Create a test latest.json with version 0.2.2
cd packages/desktop/src-tauri/target/release/bundle/dmg/
python3 -m http.server 8080
```

3. **Build and test with this local endpoint**

**Note:** This is more complex and requires changing the signature. Using a real GitHub release is easier.

### Option B: Test with System Logs

Even without a notification, you can verify the updater is working:

1. **Open system logs:**
```bash
log stream --predicate 'process == "Flow"' --level debug
```

2. **Launch the app** (v0.2.1)

3. **Look for these log entries:**
```
[Update] Checking for updates...
[Update] Check complete: { shouldUpdate: false, manifest: null }
[Update] No update available, current version is latest
```

This confirms:
- ✅ The updater is running
- ✅ It's successfully checking GitHub
- ✅ It correctly detects you're on the latest version

## Expected Behavior at Each Stage

### Current State (v0.2.1 installed, v0.2.1 on GitHub)
- ✅ No notification = **CORRECT**
- ✅ Logs show "No update available" = **CORRECT**
- ✅ ↻ button alert says "No updates available" = **CORRECT**

### After Creating v0.2.2 (v0.2.1 installed, v0.2.2 on GitHub)
- ✅ Notification appears in top-right = **CORRECT**
- ✅ Shows "Version 0.2.2 is ready to install" = **CORRECT**
- ✅ Logs show "Update available: 0.2.2" = **CORRECT**
- ✅ ↻ button alert says "Update available: v0.2.2" = **CORRECT**

### After Updating (v0.2.2 installed, v0.2.2 on GitHub)
- ✅ No notification = **CORRECT**
- ✅ App is running v0.2.2 = **SUCCESS!**

## Troubleshooting

### Issue: Built v0.2.2 but accidentally installed it

**Solution:** Build v0.2.1 again and install:

```bash
# Edit tauri.conf.json, change version back to "0.2.1"
cd packages/desktop
TAURI_PRIVATE_KEY="$HOME/.tauri/flow-kanban.key" npm run tauri build
rm -rf /Applications/Flow.app
cp -R packages/desktop/src-tauri/target/release/bundle/macos/Flow.app /Applications/
```

### Issue: Update notification doesn't appear after creating v0.2.2

**Check:**
1. Did you upload `latest.json` to the GitHub release?
2. Is the file accessible? Test: `curl -L https://github.com/hoferland/kanban-flow-vibecode/releases/download/v0.2.2/latest.json`
3. Is v0.2.1 actually installed? Check version in the app header
4. Wait a few seconds - the check happens on app startup

### Issue: Want to see logs to debug

**Enable DevTools:**
```json
// tauri.conf.json
"windows": [
  {
    // ... other settings
    "devtools": true
  }
]
```

Rebuild, then press `Cmd + Option + I` to open DevTools.

## Summary

**Current Status:**
- Your app correctly shows NO notification (both are v0.2.1) ✅
- The updater IS working properly ✅

**To See an Update Notification:**
1. Create v0.2.2 release on GitHub with `latest.json`
2. Keep v0.2.1 installed locally
3. Launch app - notification will appear!

**The system is working!** You just need a newer version on GitHub to trigger the notification.
