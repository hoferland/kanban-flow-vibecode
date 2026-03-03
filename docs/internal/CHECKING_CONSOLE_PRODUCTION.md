# Checking Console Logs in Production Builds

## Methods to View Console Logs

### Method 1: Enable DevTools in Production (Recommended)

You can temporarily enable DevTools in your production build by modifying the Tauri config.

**Steps:**

1. **Edit `tauri.conf.json`** and add devtools to the window configuration:

```json
"windows": [
  {
    "title": "Flow - Personal Kanban",
    "width": 1200,
    "height": 800,
    "minWidth": 800,
    "minHeight": 600,
    "resizable": true,
    "fullscreen": false,
    "fileDropEnabled": false,
    "devtools": true  // ← Add this line
  }
]
```

2. **Rebuild the app**:
```bash
cd packages/desktop
npm run tauri build
```

3. **Install and run**:
```bash
open packages/desktop/src-tauri/target/release/bundle/macos/Flow.app
```

4. **Open DevTools** with one of these shortcuts:
- **macOS**: `Cmd + Option + I`
- **Windows/Linux**: `Ctrl + Shift + I`
- **Alternative**: Right-click in the app → "Inspect Element"

5. **View Console** - Click the "Console" tab to see all `[Update]` logs

### Method 2: System Logs (macOS)

View logs without rebuilding the app using macOS Console.

**Terminal Command:**
```bash
# View live logs from your app
log stream --predicate 'process == "Flow"' --level debug

# Or view recent logs
log show --predicate 'process == "Flow"' --last 5m --info
```

**Console App (GUI):**
1. Open **Console.app** (in `/Applications/Utilities/`)
2. In the search bar, enter: `process:Flow`
3. Click "Start" to stream logs
4. Launch your app and watch logs appear in real-time

### Method 3: Write Logs to a File

You can also log to a file for later inspection.

**Add to your Svelte component:**

```javascript
// In UpdateNotification.svelte
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';

async function logToFile(message) {
  try {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    await writeTextFile('update-logs.txt', logMessage, { 
      dir: BaseDirectory.AppData,
      append: true 
    });
  } catch (err) {
    // Fail silently
  }
}

async function checkForUpdates() {
  try {
    console.log('[Update] Checking for updates...');
    await logToFile('[Update] Checking for updates...');
    
    const { shouldUpdate, manifest } = await checkUpdate();
    
    const logMsg = `[Update] Check complete: ${JSON.stringify({ shouldUpdate, manifest })}`;
    console.log(logMsg);
    await logToFile(logMsg);
    
    // ... rest of your code
  } catch (err) {
    console.error('[Update] Update check failed:', err);
    await logToFile(`[Update] Update check failed: ${err.message}`);
  }
}
```

**View the log file:**
```bash
# macOS
cat ~/Library/Application\ Support/com.flow.kanban/update-logs.txt

# Or open in editor
open ~/Library/Application\ Support/com.flow.kanban/update-logs.txt
```

### Method 4: Use Alert Dialogs (Quick & Simple)

Since you already have the manual check button with alerts, use that!

The ↻ button shows alert dialogs with the results, which work perfectly in production:
- "Update available: v0.2.2"
- "No updates available"
- Error messages

**This is the easiest way to verify it's working!**

## Recommended Approach

For testing the auto-update mechanism:

### Step 1: Enable DevTools Temporarily

```json
// tauri.conf.json
"windows": [
  {
    // ... other settings
    "devtools": true  // Add this
  }
]
```

### Step 2: Rebuild

```bash
cd packages/desktop
npm run tauri build
```

### Step 3: Test

```bash
# Install the build
open packages/desktop/src-tauri/target/release/bundle/macos/Flow.app

# Open DevTools: Cmd + Option + I
# Click the ↻ button to trigger update check
# Watch the Console tab for [Update] messages
```

### Step 4: Check Results

You should see in the console:
```
[Update] Checking for updates...
[Update] Check complete: { shouldUpdate: false, manifest: null }
[Update] No update available, current version is latest
```

### Step 5: Remove DevTools (Optional)

Once you've verified everything works, remove the `devtools: true` line before final release:

```json
"windows": [
  {
    // ... other settings
    // Remove "devtools": true
  }
]
```

## Quick Test Without Rebuilding

If you don't want to rebuild, use macOS system logs:

```bash
# Terminal 1: Start log streaming
log stream --predicate 'process == "Flow"' --level debug

# Terminal 2: Launch your app
open /Applications/Flow.app

# Watch Terminal 1 for console.log output
```

## Summary

**Best for Development/Testing:**
- Enable `devtools: true` in tauri.conf.json
- Use `Cmd + Option + I` to open DevTools
- View Console tab

**Best for Production Monitoring:**
- Use macOS Console.app or `log stream`
- Or implement file logging

**Best for Quick Checks:**
- Use the ↻ button - shows alerts with results
- No console needed!

## Notes

- DevTools won't work in dev mode for Tauri APIs (like the updater)
- DevTools in production builds work normally
- System logs capture all console.log/console.error output
- The ↻ button alerts are the simplest way to verify functionality
