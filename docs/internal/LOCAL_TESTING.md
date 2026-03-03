# Testing Production Builds Locally

This guide explains how to test the production version of your app locally by replacing the installed app in your Applications folder.

## Quick Method: One-Command Update

Use this script to build and automatically replace the app:

```bash
# From project root
./scripts/update-local-app.sh
```

This will:
1. Build the production app
2. Close any running instances of Flow
3. Replace the app in /Applications
4. Open the new version

## Manual Method: Step-by-Step

If you prefer to do it manually or need more control:

### Step 1: Build the Production App

```bash
cd packages/desktop
TAURI_PRIVATE_KEY="$HOME/.tauri/flow-kanban.key" npm run tauri build
```

Enter your key password when prompted.

### Step 2: Close the Running App

If Flow is currently running:

```bash
# Force quit Flow if it's running
killall Flow 2>/dev/null || true
```

Or manually: Cmd+Q in the app, or right-click dock icon → Quit

### Step 3: Replace the App

**Option A: Using the command line**

```bash
# Remove old version
rm -rf /Applications/Flow.app

# Copy new version
cp -R packages/desktop/src-tauri/target/release/bundle/macos/Flow.app /Applications/

# Make it executable
chmod +x /Applications/Flow.app/Contents/MacOS/Flow
```

**Option B: Using Finder**

1. Open Finder
2. Navigate to `/Applications`
3. Delete the old `Flow.app` (drag to Trash)
4. Navigate to your project folder:
   - `packages/desktop/src-tauri/target/release/bundle/macos/`
5. Drag the new `Flow.app` to `/Applications`

### Step 4: Launch the New Version

**From command line:**
```bash
open /Applications/Flow.app
```

**Or from Finder:**
- Go to Applications folder
- Double-click Flow.app

## Preserving Your Data

**Good news:** Your card data is automatically preserved! 

Your data is stored in:
```
~/Library/Application Support/com.flow.kanban/
```

This location is separate from the app itself, so replacing the app doesn't affect your data.

## Quick Development Workflow

For rapid iteration during development:

### Development Mode (Hot Reload)
```bash
cd packages/desktop
npm run tauri dev
```
- Changes reflect instantly
- Don't need to rebuild
- Best for active development

### Production Testing (After Changes)
```bash
# Quick script to rebuild and replace
./scripts/update-local-app.sh
```
- Tests the actual production build
- Verifies everything works as deployed
- Use before creating GitHub releases

## Troubleshooting

### "Flow.app is damaged and can't be opened"

This happens because macOS Gatekeeper doesn't recognize unsigned apps.

**Solution:**
```bash
# Remove quarantine attribute
xattr -cr /Applications/Flow.app
```

Then try opening again.

### App won't launch after replacing

**Check permissions:**
```bash
chmod -R +x /Applications/Flow.app/Contents/MacOS/
```

### "Another instance is already running"

**Kill all instances:**
```bash
killall -9 Flow
```

Then try opening again.

### Data not appearing in new version

Your data should persist automatically. If not:

1. Check that the app identifier hasn't changed in `tauri.conf.json`:
   - Should be: `"identifier": "com.flow.kanban"`

2. Verify data location:
```bash
ls -la ~/Library/Application\ Support/com.flow.kanban/
```

If data exists there, it should load automatically.

## Verifying the Production Build

After replacing the app, verify:

✅ **App launches correctly**  
✅ **All your cards are still there**  
✅ **Changes you made are visible**  
✅ **Drag and drop works**  
✅ **Add/edit/delete cards works**  
✅ **Filters work correctly**  

## Build Artifacts Location

After building, files are located at:
```
packages/desktop/src-tauri/target/release/bundle/macos/
├── Flow.app              # The application bundle
├── Flow.app.tar.gz       # Compressed for updates
└── Flow.app.tar.gz.sig   # Signature for updates
```

Only `Flow.app` is needed for local testing.

## Differences: Dev vs Production

| Feature | Dev Mode | Production Build |
|---------|----------|------------------|
| Speed | Instant changes | Need to rebuild |
| Performance | Slower | Optimized |
| Size | Larger | Minimized |
| DevTools | Open by default | Hidden |
| Hot reload | Yes | No |
| Represents deployed app | No | Yes |

## When to Use Each Method

**Use Dev Mode when:**
- Actively writing code
- Testing UI changes
- Debugging issues
- Iterating quickly

**Use Production Build when:**
- Final testing before release
- Verifying performance
- Testing update mechanism
- Checking actual bundle size
- Preparing for GitHub release

---

**Pro Tip:** Keep both workflows handy - use dev mode 90% of the time, but always do a final production test before releasing to friends!
