# Create GitHub Release v0.2.2 - Ready to Upload!

## ✅ All Files Are Ready!

Everything is prepared and signed. You just need to upload to GitHub.

## Required Files (All Ready)

Located in your build folders:

1. ✅ `Flow.app.tar.gz` - Update bundle
   - Location: `packages/desktop/src-tauri/target/release/bundle/macos/Flow.app.tar.gz`
   
2. ✅ `Flow.app.tar.gz.sig` - Signature file  
   - Location: `packages/desktop/src-tauri/target/release/bundle/macos/Flow.app.tar.gz.sig`
   
3. ✅ `latest.json` - Update manifest
   - Location: `packages/desktop/src-tauri/target/release/bundle/dmg/latest.json`

## Step-by-Step: Create the Release

### 1. Go to GitHub Releases

Open this URL in your browser:
```
https://github.com/hoferland/kanban-flow-vibecode/releases/new
```

### 2. Fill in Release Details

- **Choose a tag**: Type `v0.2.2` and click "Create new tag: v0.2.2 on publish"
- **Release title**: `Flow 0.2.2`
- **Description**: 
  ```
  Testing auto-update functionality
  
  Changes:
  - Added enhanced logging for update checks
  - Added manual "Check for Updates" button (↻) in header
  - Fixed auto-update endpoint URL
  ```

### 3. Upload the 3 Files

Click "Attach binaries by dropping them here or selecting them"

**Upload these files from your project:**

```bash
# From terminal, you can open Finder to these locations:
open packages/desktop/src-tauri/target/release/bundle/macos/
open packages/desktop/src-tauri/target/release/bundle/dmg/
```

**Files to upload:**
1. `Flow.app.tar.gz` (from macos/ folder)
2. `Flow.app.tar.gz.sig` (from macos/ folder)  
3. `latest.json` (from dmg/ folder)

### 4. Publish

Click the green **"Publish release"** button at the bottom.

## After Publishing

### Test Immediately!

1. **Make sure v0.2.1 is installed** (don't install v0.2.2 yet):
   ```bash
   # Check current installed version
   /Applications/Flow.app/Contents/MacOS/Flow --version
   ```

2. **Launch the app:**
   ```bash
   open /Applications/Flow.app
   ```

3. **Wait 3-5 seconds** - Update notification should appear in top-right!

### Expected Result

You should see:
- 📦 **Update notification** in top-right corner
- 📝 "Update Available"
- 🎯 "Version 0.2.2 is ready to install"
- 🔄 "Update Now" and "Later" buttons

### Click "Update Now" to test full flow:
1. Download progress shown
2. App restarts automatically  
3. Now running v0.2.2!
4. No more notifications (both versions are 0.2.2)

## Troubleshooting

### If notification doesn't appear:

1. **Check the version badge** in the app header - should show v0.2.1
2. **Wait longer** - can take up to 30 seconds
3. **Click the ↻ button** in the header to manually trigger check
4. **Check system logs:**
   ```bash
   log stream --predicate 'process == "Flow"' --level debug
   ```

### If you see an error:

Check the console/logs for:
- Network errors (check internet connection)
- Signature verification errors (verify files uploaded correctly)
- Version comparison errors

## Quick Command Reference

```bash
# Open folders with files
open packages/desktop/src-tauri/target/release/bundle/macos/
open packages/desktop/src-tauri/target/release/bundle/dmg/

# Verify files exist
ls -la packages/desktop/src-tauri/target/release/bundle/macos/Flow.app.tar.gz*
ls -la packages/desktop/src-tauri/target/release/bundle/dmg/latest.json

# Launch app after release is created
open /Applications/Flow.app

# Watch logs
log stream --predicate 'process == "Flow"' --level debug
```

## Success Checklist

After upload and testing:

- [ ] GitHub release v0.2.2 created
- [ ] All 3 files uploaded (tar.gz, .sig, latest.json)
- [ ] Release published (not draft)
- [ ] Launched v0.2.1 app
- [ ] Update notification appeared
- [ ] Clicked "Update Now"
- [ ] App restarted automatically
- [ ] Now running v0.2.2
- [ ] 🎉 Auto-update fully working!

## The Moment of Truth

Once you upload these files and launch your v0.2.1 app, you'll see the update notification within seconds. This will prove your auto-update system is fully functional!

The reason you saw no notification earlier was correct - both versions were 0.2.1. Now with v0.2.2 released, the notification will appear! 🚀
