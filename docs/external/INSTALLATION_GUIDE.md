# Flow - Installation Guide for Users

Welcome! This guide will help you install and use Flow, a personal Kanban board for managing your UX design work.

## What is Flow?

Flow is a desktop app that helps you organize your design tasks across multiple teams. All your data is stored **locally on your computer** - nothing is uploaded to any server.

---

## First-Time Installation

### Step 1: Download the App

1. Go to the [GitHub Releases page](https://github.com/YOUR_USERNAME/YOUR_REPO/releases) (your friend will provide the actual link)
2. Download the appropriate file for your Mac:
   - **Apple Silicon (M1/M2/M3)**: Download the file ending in `_aarch64.dmg`
   - **Intel Mac**: Download the file ending in `_x64.dmg`
   
   > **Not sure which Mac you have?** Click the Apple menu → About This Mac. If it says "Apple M1", "M2", or "M3", download the `_aarch64` version. Otherwise, download the `_x64` version.

### Step 2: Install the App

1. Open the downloaded `.dmg` file
2. Drag the **Flow** icon to your **Applications** folder
3. Close the installer window

### Step 3: First Launch (Important!)

Because Flow isn't signed with an Apple Developer certificate, you need to do this **one time**:

#### Option 1: Using Finder (Easiest)

1. Open **Applications** folder
2. **Right-click** (or Control-click) on **Flow**
3. Select **"Open"** from the menu
4. A dialog appears saying "Flow is from an unidentified developer"
5. Click **"Open"** to confirm

#### Option 2: Using Terminal (If Option 1 doesn't work)

If the app still won't open, you may need to remove the quarantine attribute:

1. Open **Terminal** (Applications → Utilities → Terminal)
2. Copy and paste this command:
   ```bash
   xattr -cr /Applications/Flow.app
   ```
3. Press **Enter**
4. Now try opening Flow normally

> **What does this do?** This command removes macOS's quarantine flag from the app, which prevents it from being blocked. It's safe and only affects this one app.

After this first time, you can open Flow normally by double-clicking.

---

## Using Flow

### Your Kanban Board

Flow has four columns:
- **Inbox**: New tasks go here
- **Next**: Tasks you'll work on soon
- **In Progress**: What you're currently working on
- **Done**: Completed tasks

### Adding a Task

1. Click the **"+ Add Card"** button at the top
2. Fill in:
   - Title (required)
   - Team/Area (e.g., Team A, Team B, Cross-team)
   - Type (Discovery, Design, Other)
   - Notes (optional)
3. Click **"Add Card"**

### Moving Tasks

Simply **drag and drop** cards between columns to update their status.

### Editing Tasks

Click on any card to edit its details or delete it.

### Filtering

Use the filter dropdown to view:
- All tasks
- Tasks by specific team
- Tasks by work type

---

## Automatic Updates

Flow will automatically check for updates when you open the app.

### When an Update is Available

1. You'll see a notification in the top-right corner
2. Click **"Update Now"** to download and install
3. The app will restart automatically
4. **Your data is preserved** - all your cards will be exactly as you left them

### If You Prefer to Wait

Click **"Later"** to dismiss the notification. You can update next time you open the app.

---

## Your Data

### Where is it Stored?

All your cards are stored locally on your Mac in a secure location:
- Path: `~/Library/Application Support/com.flow.kanban/`
- Format: Browser localStorage (safe and fast)

### Important Facts

✅ **Private**: Your data never leaves your computer  
✅ **Automatic**: Saves instantly as you make changes  
✅ **Persistent**: Survives app updates  
✅ **No account needed**: No logins or cloud services

### Backing Up Your Data

While your data is safe, you can manually export it:
1. Open Flow
2. Use the export feature (if available)
3. Save the JSON file somewhere safe

*(Note: Export/import feature coming soon!)*

---

## Troubleshooting

### "Flow can't be opened because it is from an unidentified developer"

**Solution 1** - Using System Settings:
1. Open **System Settings** → **Privacy & Security**
2. Scroll down to the Security section
3. Find the message about Flow being blocked
4. Click **"Open Anyway"**
5. Confirm by clicking **"Open"**

**Solution 2** - Using Terminal (if the above doesn't work):
1. Open **Terminal** (Applications → Utilities → Terminal)
2. Run this command:
   ```bash
   xattr -cr /Applications/Flow.app
   ```
3. Try opening Flow again

### App Won't Open

Try:
1. Quit Flow completely (Cmd + Q)
2. Right-click Flow in Applications → "Open"
3. If still stuck, restart your Mac

### Updates Not Working

1. Make sure you're connected to the internet
2. Try closing and reopening the app
3. If still not working, manually download the latest version

### Lost Your Cards?

Cards are stored locally and survive updates. If they're gone:
1. Check if you're looking at a filter (switch to "All")
2. Check `~/Library/Application Support/com.flow.kanban/`
3. Contact your friend who shared the app

---

## Tips & Tricks

### Keyboard Shortcuts

- `Cmd + Q` - Quit app
- Click and drag - Move cards between columns

### Best Practices

1. **Use the Inbox**: Add all new tasks to Inbox first
2. **Limit In Progress**: Keep only 2-3 items in progress at once
3. **Archive Done items**: Move completed tasks to Done regularly
4. **Add notes**: Use the notes field for context you might forget

### Workflow Example

1. Daily: Review Inbox, move urgent items to Next
2. Weekly: Move Next items to In Progress as you start them
3. As you finish: Move to Done
4. Monthly: Clear out Done column (they're just reference)

---

## Getting Help

If you have questions or issues:

1. Check this guide first
2. Look at the [RELEASE.md](RELEASE.md) documentation
3. Contact your friend who shared Flow with you
4. Check for a newer version (might fix your issue)

---

## Privacy & Security

- ✅ No telemetry or tracking
- ✅ No internet connection required (except for updates)
- ✅ No personal information collected
- ✅ Open source - you can review the code
- ✅ Private GitHub repository - only invited users can access

---

## System Requirements

- **macOS**: 10.15 (Catalina) or later
- **Disk Space**: ~50 MB
- **RAM**: 100 MB (minimal)
- **Internet**: Only needed for downloading updates

---

**Enjoy using Flow!** 🎉

Remember: Your data stays on your computer, and updates are automatic. Just focus on getting your work organized!
