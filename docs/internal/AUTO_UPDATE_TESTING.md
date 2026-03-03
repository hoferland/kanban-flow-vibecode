# Auto-Update Testing Guide

This guide explains how to test the auto-update functionality in your Flow Kanban app.

## Overview

The app uses Tauri's built-in updater to check for new versions on GitHub releases. The current implementation:

- **Checks for updates** automatically when the app starts
- **Shows a notification** in the top-right corner when an update is available
- **Provides a manual check button** (↻) in the header for testing
- **Console logging** for debugging update checks

## Fixed Issues

✅ **Added enhanced logging** to track update check process  
✅ **Added manual "Check for Updates" button** for easier testing  
✅ **Confirmed updater feature** is enabled in Cargo.toml  
✅ **Verified configuration** in tauri.conf.json  

## Testing Methods

### Method 1: Version Bump Test (Recommended for Production)

This simulates a real update scenario by creating an actual new version.

**Steps:**

1. **Create a higher version release on GitHub:**
   ```bash
   # Update version in tauri.conf.json
   # Change from 0.2.1 to 0.2.2 (or 0.3.0)
   
   # Build and release
   cd packages/desktop
   TAURI_PRIVATE_KEY="$HOME/.tauri/flow-kanban.key" npm run tauri build
   
   # Create GitHub release (follow docs/GITHUB_RELEASE_GUIDE.md)
   ```

2. **Install the older version (0.2.1) locally:**
   ```bash
   # Make sure you have v0.2.1 installed in /Applications
   ```

3. **Launch the app and check console:**
   - Open the app
   - Open DevTools (if in dev mode) or check system logs
   - Look for `[Update] Checking for updates...` logs
   - Should see `[Update] Update available: 0.2.2`
   - Update notification should appear in top-right

4. **Test the update flow:**
   - Click "Update Now" button
   - App should download and install
   - App should restart automatically

### Method 2: Manual Check Button (Quick Testing)

Use the new update check button in the header for quick testing.

**Steps:**

1. **Run the app in development mode:**
   ```bash
   cd packages/desktop
   npm run tauri dev
   ```

2. **Click the ↻ button** in the header (next to the ⚙ settings button)

3. **Check the console output:**
   ```
   [Manual Update Check] Starting...
   [Manual Update Check] Result: { shouldUpdate: false, manifest: null }
   ```

4. **Expected behavior:**
   - If no update: Alert shows "No updates available"
   - If update exists: Alert shows version number and details
   - Console shows detailed logging

### Method 3: Console Testing (Developer)

Test directly from browser DevTools console.

**Steps:**

1. **Run in dev mode and open DevTools:**
   ```bash
   cd packages/desktop
   npm run tauri dev
   ```

2. **In the console, run:**
   ```javascript
   const { checkUpdate } = await import('@tauri-apps/api/updater');
   const result = await checkUpdate();
   console.log('Update check result:', result);
   ```

3. **Inspect the result:**
   ```javascript
   {
     shouldUpdate: false,  // true if update available
     manifest: null       // contains version, notes if update exists
   }
   ```

### Method 4: Version Downgrade Test (Local Testing)

Test by temporarily downgrading your local version.

**Steps:**

1. **Modify `tauri.conf.json` locally:**
   ```json
   {
     "package": {
       "productName": "Flow",
       "version": "0.1.0"  // Lower than GitHub release
     }
   }
   ```

2. **Run in dev mode:**
   ```bash
   cd packages/desktop
   npm run tauri dev
   ```

3. **Should detect update** since 0.1.0 < 0.2.1

4. **Check console logs** for update detection

5. **Revert version** after testing:
   ```json
   {
     "package": {
       "version": "0.2.1"  // Back to current
     }
   }
   ```

## What to Look For

### ✅ Successful Update Detection

Console should show:
```
[Update] Checking for updates...
[Update] Check complete: { shouldUpdate: true, manifest: {...} }
[Update] Update available: 0.2.2
```

Update notification should:
- Appear in top-right corner
- Show the new version number
- Display release notes (if available)
- Have "Update Now" and "Later" buttons

### ❌ No Update Available

Console should show:
```
[Update] Checking for updates...
[Update] Check complete: { shouldUpdate: false, manifest: null }
[Update] No update available, current version is latest
```

No notification should appear.

### ⚠️ Update Check Failed

Console should show:
```
[Update] Checking for updates...
[Update] Update check failed: [error message]
```

Error notification may appear (red background) with error message.

## Common Issues & Solutions

### Issue: Update check times out or fails

**Possible causes:**
- No internet connection
- GitHub API rate limiting
- Invalid endpoint URL in `tauri.conf.json`
- Missing or invalid signature in `latest.json`

**Solution:**
```bash
# Check endpoint URL
# Should be: https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json

# Verify latest.json exists on GitHub
curl https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json

# Check signature matches in tauri.conf.json
```

### Issue: Update shows available but shouldn't

**Possible cause:**
- Version comparison issue
- Cached update manifest

**Solution:**
```bash
# Clear application cache
rm -rf ~/Library/Caches/com.flow.kanban
rm -rf ~/Library/Application\ Support/com.flow.kanban/.updater

# Restart app
```

### Issue: Update notification doesn't appear

**Possible causes:**
- UpdateNotification component not mounted
- Console has errors
- Update check failed silently

**Solution:**
1. Check console for errors
2. Verify UpdateNotification is in App.svelte
3. Check network tab for requests to GitHub

### Issue: "Signature verification failed"

**Possible cause:**
- Mismatch between pubkey in `tauri.conf.json` and the key used to sign the release

**Solution:**
```bash
# Verify the pubkey in tauri.conf.json matches your public key
cat ~/.tauri/flow-kanban.key.pub

# Regenerate keys if needed (see docs/RELEASE.md)
```

## Production Testing Checklist

Before releasing a new version:

- [ ] Build production version with higher version number
- [ ] Create GitHub release with all assets
- [ ] Install previous version on test machine
- [ ] Launch app and verify update notification appears
- [ ] Click "Update Now" and verify:
  - [ ] Download progresses
  - [ ] Installation completes
  - [ ] App restarts automatically
  - [ ] New version is running after restart
- [ ] Check that data persists after update
- [ ] Test "Later" button works (notification dismisses)
- [ ] Verify manual check button works

## Configuration Reference

### tauri.conf.json updater section:
```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json"
    ],
    "dialog": false,
    "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6..."
  }
}
```

### Cargo.toml features:
```toml
[dependencies]
tauri = { version = "1", features = ["updater", ...] }
```

## Debugging Tips

1. **Enable verbose logging:**
   ```bash
   # Set environment variable before running
   RUST_LOG=tauri=debug npm run tauri dev
   ```

2. **Check system logs (macOS):**
   ```bash
   log show --predicate 'process == "Flow"' --last 5m
   ```

3. **Inspect network requests:**
   - Open DevTools Network tab
   - Look for requests to `github.com`
   - Verify response includes `latest.json`

4. **Test with curl:**
   ```bash
   # Verify endpoint is accessible
   curl -v https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json
   ```

## Next Steps

After confirming updates work:

1. **Create a new release** (v0.2.2) to test with
2. **Install v0.2.1** locally
3. **Launch and verify** update detection
4. **Complete the update process**
5. **Document any issues** found

## Related Documentation

- [RELEASE.md](./RELEASE.md) - Release process
- [GITHUB_RELEASE_GUIDE.md](./GITHUB_RELEASE_GUIDE.md) - Creating releases
- [LOCAL_TESTING.md](./LOCAL_TESTING.md) - Local testing guide
- [Tauri Updater Docs](https://tauri.app/v1/guides/distribution/updater) - Official documentation
