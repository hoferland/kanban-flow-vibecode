# Fixing "App is Damaged" Error on macOS

If you download Flow from GitHub and get an error saying **"Flow is damaged and can't be opened"**, this is due to macOS Gatekeeper's security features. The app isn't actually damaged - it's just unsigned.

## Quick Fix (Recommended)

Open Terminal and run this command:

```bash
xattr -cr /Applications/Flow.app
```

This removes the quarantine flag from the app. After running this command, you can open Flow normally.

## Step-by-Step Instructions

### Method 1: Using Terminal (Easiest)

1. Install Flow by dragging it to Applications folder from the DMG
2. **Do NOT try to open it yet**
3. Open Terminal (Applications → Utilities → Terminal)
4. Copy and paste this command:
   ```bash
   xattr -cr /Applications/Flow.app
   ```
5. Press Enter
6. Now you can open Flow from Applications folder normally

### Method 2: Using Terminal Before Moving to Applications

If you haven't moved the app yet:

1. Mount the DMG file
2. Open Terminal
3. Run:
   ```bash
   xattr -cr "/Volumes/Flow_0.1.1_aarch64/Flow.app"
   ```
4. Drag Flow to Applications
5. Open normally

### Method 3: System Settings (Alternative)

If Terminal doesn't work:

1. Try to open Flow (it will show the error)
2. Go to System Settings → Privacy & Security
3. Scroll down to the Security section
4. You should see a message about Flow being blocked
5. Click "Open Anyway"
6. Confirm by clicking "Open" in the dialog

## Why Does This Happen?

- Flow is not code-signed with an Apple Developer certificate ($99/year)
- macOS marks apps downloaded from the internet with a "quarantine" flag
- Unsigned apps with this flag are blocked by Gatekeeper
- The `xattr -cr` command removes this flag

## Is It Safe?

Yes! This is safe because:
- You're downloading from your own GitHub repository
- The app stores all data locally on your computer
- No data is sent to external servers
- You can review the source code

## Future Solution

To avoid this issue entirely, you would need to:
1. Enroll in the Apple Developer Program ($99/year)
2. Code sign the app with your Developer ID
3. Optionally notarize the app with Apple

For a personal app, the `xattr -cr` command is a simple and effective workaround.

## Automated Installation Script

You can also create a script that handles this automatically:

```bash
#!/bin/bash
# install-flow.sh

# Remove quarantine from DMG contents
xattr -cr "/Volumes/Flow_0.1.1_aarch64/Flow.app"

# Copy to Applications
cp -R "/Volumes/Flow_0.1.1_aarch64/Flow.app" /Applications/

echo "✅ Flow installed successfully!"
echo "You can now open Flow from Applications folder."
```

Make it executable:
```bash
chmod +x install-flow.sh
./install-flow.sh
