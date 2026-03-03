# Complete v0.2.2 Release Manually

## Current Status

✅ Version updated to 0.2.2 in `tauri.conf.json`
✅ App built successfully at: `packages/desktop/src-tauri/target/release/bundle/macos/Flow.app`
✅ Update bundle created: `Flow.app.tar.gz`
❌ Signature needs to be regenerated
❌ latest.json needs to be created
❌ GitHub release needs to be created

## Quick Steps to Complete

### Step 1: Sign the Update Bundle

```bash
cd packages/desktop/src-tauri/target/release/bundle/macos

# Remove old signature
rm Flow.app.tar.gz.sig

# Sign with your key (you'll be prompted for password)
npx @tauri-apps/cli signer sign Flow.app.tar.gz \
  --private-key ~/.tauri/flow-kanban.key
```

### Step 2: Create latest.json

The `latest.json` file should have been auto-generated but wasn't. You can create it manually or use the GitHub release script which will handle it.

**Option A: Use the GitHub release script**

```bash
# This script will create the release and upload all files
./scripts/create-github-release.sh
```

**Option B: Create manually**

Create `packages/desktop/src-tauri/target/release/bundle/dmg/latest.json`:

```json
{
  "version": "0.2.2",
  "notes": "Testing auto-update functionality",
  "pub_date": "2025-12-12T15:52:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "PASTE_SIGNATURE_CONTENT_HERE",
      "url": "https://github.com/hoferland/kanban-flow-vibecode/releases/download/v0.2.2/Flow.app.tar.gz"
    }
  }
}
```

Get the signature content from:
```bash
cat packages/desktop/src-tauri/target/release/bundle/macos/Flow.app.tar.gz.sig
```

### Step 3: Create GitHub Release

1. **Go to GitHub:**
   https://github.com/hoferland/kanban-flow-vibecode/releases/new

2. **Fill in details:**
   - Tag: `v0.2.2`
   - Title: `Flow 0.2.2`
   - Description: `Testing auto-update functionality`

3. **Upload these files** from `packages/desktop/src-tauri/target/release/bundle/`:
   
   From `macos/`:
   - `Flow.app.tar.gz`
   - `Flow.app.tar.gz.sig`
   
   From `dmg/`:
   - `latest.json`
   
   Optional (for manual installation):
   - `macos/rw.Flow_0.2.2_aarch64.dmg`

4. **Publish the release**

### Step 4: Test the Update!

**Important:** Keep v0.2.1 installed, don't install v0.2.2 yet!

1. **Launch your currently installed v0.2.1 app:**
   ```bash
   open /Applications/Flow.app
   ```

2. **Within seconds, you should see:**
   - Update notification in top-right corner
   - "Version 0.2.2 is ready to install"
   - "Update Now" and "Later" buttons

3. **Click "Update Now"** to test the full flow:
   - Download progress
   - App restarts
   - Now running v0.2.2!

## Troubleshooting

### If signing fails

Try with the full path to the key:
```bash
npx @tauri-apps/cli signer sign Flow.app.tar.gz \
  --private-key "$HOME/.tauri/flow-kanban.key" \
  --password ""
```

Or use the tauri-cli command directly if you have it installed globally:
```bash
tauri signer sign Flow.app.tar.gz -k ~/.tauri/flow-kanban.key
```

### If you don't have the private key

You'll need to regenerate the keys:
```bash
npx @tauri-apps/cli signer generate -w ~/.tauri/flow-kanban.key
```

Then update the pubkey in `tauri.conf.json` with the new public key from `~/.tauri/flow-kanban.key.pub`.

### Alternative: Use Existing Release Files

If you have the v0.2.1 release files that were properly signed, you can use those as a template:

1. Copy the signature format from v0.2.1
2. Sign the new v0.2.2 bundle with the same key
3. Update latest.json with new version and signature

## Quick Command Summary

```bash
# 1. Sign the bundle
cd packages/desktop/src-tauri/target/release/bundle/macos
rm Flow.app.tar.gz.sig
npx @tauri-apps/cli signer sign Flow.app.tar.gz --private-key ~/.tauri/flow-kanban.key

# 2. Use the release script (handles latest.json and GitHub)
cd /Users/I550797/Desktop/Coding/flow-kanban
./scripts/create-github-release.sh

# 3. Test!
open /Applications/Flow.app
# Watch for update notification!
```

## What You Should See

### Before Update (v0.2.1 running):
```
[Update] Checking for updates...
[Update] Check complete: { shouldUpdate: true, manifest: {...} }
[Update] Update available: 0.2.2
```

### Update Notification Appears:
- Top-right corner
- Shows version 0.2.2
- Has "Update Now" button

### After Clicking "Update Now":
- Downloads v0.2.2
- App restarts automatically
- Now running v0.2.2
- No more update notifications (both are 0.2.2)

## Success!

Once you see the update notification appear, your auto-update system is fully working! 🎉

The absence of notification when running v0.2.1 earlier was actually proof it was working correctly - it knew both versions were the same.
