# GitHub Release - Step-by-Step Guide

This guide explains exactly how to create a GitHub release with all the necessary files for the auto-updater to work.

## Understanding the Files

When you build your app with `./scripts/build-release.sh`, Tauri creates several files. Here's what each one is for:

### File Types Explained

After building, you'll find these files in `packages/desktop/src-tauri/target/release/bundle/dmg/`:

1. **`.dmg` files** - The installers your friends download and install
   - `Flow_0.1.1_aarch64.dmg` - For Apple Silicon Macs (M1/M2/M3)
   - `Flow_0.1.1_x64.dmg` - For Intel Macs
   - These are what users double-click to install

2. **`.dmg.tar.gz` files** - Compressed versions for the auto-updater
   - `Flow_0.1.1_aarch64.dmg.tar.gz` - Compressed Apple Silicon version
   - `Flow_0.1.1_x64.dmg.tar.gz` - Compressed Intel version
   - The app downloads these automatically when updating

3. **`.sig` files** - Security signatures
   - `Flow_0.1.1_aarch64.dmg.tar.gz.sig` - Signature for Apple Silicon
   - `Flow_0.1.1_x64.dmg.tar.gz.sig` - Signature for Intel
   - Proves the update files haven't been tampered with

4. **`latest.json`** - Update manifest (you create this manually)
   - Tells the app what version is available
   - Contains download URLs and signatures
   - Critical for auto-updates to work

---

## Step-by-Step: Creating Your First Release

### Step 1: Build the App

```bash
./scripts/build-release.sh
```

Wait for the build to complete (~2-5 minutes).

### Step 2: Locate the Files

Navigate to the build output folder:

```bash
cd packages/desktop/src-tauri/target/release/bundle/dmg/
ls -la
```

You should see:
```
Flow_0.1.1_aarch64.dmg
Flow_0.1.1_aarch64.dmg.tar.gz
Flow_0.1.1_aarch64.dmg.tar.gz.sig
Flow_0.1.1_x64.dmg
Flow_0.1.1_x64.dmg.tar.gz
Flow_0.1.1_x64.dmg.tar.gz.sig
```

### Step 3: Read the Signature Files

You need the contents of the `.sig` files for the `latest.json` file.

**For Apple Silicon:**
```bash
cat Flow_0.1.1_aarch64.dmg.tar.gz.sig
```

Copy the entire output (it's a long string like: `dW50cnVzdGVkIGNvbW1lbnQ6...`)

**For Intel:**
```bash
cat Flow_0.1.1_x64.dmg.tar.gz.sig
```

Copy this output too.

### Step 4: Create latest.json File

Create a new file called `latest.json` in the same folder:

```bash
nano latest.json
```

Or use any text editor. Paste this template and **replace the placeholders**:

```json
{
  "version": "0.1.1",
  "notes": "Initial release with core kanban features",
  "pub_date": "2025-05-12T15:30:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "PASTE_APPLE_SILICON_SIGNATURE_HERE",
      "url": "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v0.1.1/Flow_0.1.1_aarch64.dmg.tar.gz"
    },
    "darwin-x86_64": {
      "signature": "PASTE_INTEL_SIGNATURE_HERE",
      "url": "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v0.1.1/Flow_0.1.1_x64.dmg.tar.gz"
    }
  }
}
```

**Replace:**
- `PASTE_APPLE_SILICON_SIGNATURE_HERE` → The content from `Flow_0.1.1_aarch64.dmg.tar.gz.sig`
- `PASTE_INTEL_SIGNATURE_HERE` → The content from `Flow_0.1.1_x64.dmg.tar.gz.sig`
- `YOUR_USERNAME` → Your GitHub username (e.g., `hoferland`)
- `YOUR_REPO` → Your repository name (e.g., `kanban-flow-vibecode`)
- `2025-05-12T15:30:00Z` → Current date and time in UTC (format: YYYY-MM-DDTHH:MM:SSZ)

**Example with real values:**

```json
{
  "version": "0.1.1",
  "notes": "Initial release with core kanban features",
  "pub_date": "2025-05-12T15:30:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNEtHN05qQk04cXovWW1JUnFMZjBGL1pXR...",
      "url": "https://github.com/hoferland/kanban-flow-vibecode/releases/download/v0.1.1/Flow_0.1.1_aarch64.dmg.tar.gz"
    },
    "darwin-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUNEtHN05qQk04cX...",
      "url": "https://github.com/hoferland/kanban-flow-vibecode/releases/download/v0.1.1/Flow_0.1.1_x64.dmg.tar.gz"
    }
  }
}
```

Save the file.

### Step 5: Create the GitHub Release

1. **Go to your GitHub repository** in your browser

2. **Click "Releases"** (right sidebar) → **"Draft a new release"**

3. **Fill in the release information:**
   - **Tag version:** `v0.1.1` (must start with 'v')
   - **Release title:** `Flow v0.1.1 - Initial Release`
   - **Description:** 
     ```
     ## Flow v0.1.1 - Initial Release

     Personal Kanban board for UX designers managing multiple teams.

     ### Features
     - 4-column Kanban board (Inbox, Next, In Progress, Done)
     - Filter by team and work type
     - Drag and drop cards
     - Auto-save to local storage
     - Automatic updates

     ### Installation
     1. Download the appropriate `.dmg` file for your Mac:
        - **Apple Silicon (M1/M2/M3):** `Flow_0.1.1_aarch64.dmg`
        - **Intel:** `Flow_0.1.1_x64.dmg`
     2. Open the `.dmg` file
     3. Drag Flow to Applications
     4. Right-click Flow → "Open" (first time only)

     ### Privacy
     All your data is stored locally on your computer. Nothing is uploaded to any server.
     ```

4. **Upload the files:**
   - Drag and drop **ALL 7 files** into the upload area:
     - `Flow_0.1.1_aarch64.dmg`
     - `Flow_0.1.1_aarch64.dmg.tar.gz`
     - `Flow_0.1.1_aarch64.dmg.tar.gz.sig`
     - `Flow_0.1.1_x64.dmg`
     - `Flow_0.1.1_x64.dmg.tar.gz`
     - `Flow_0.1.1_x64.dmg.tar.gz.sig`
     - `latest.json`

5. **Verify all files are uploaded** - You should see all 7 files listed

6. **Click "Publish release"**

---

## Why Each File is Needed

| File | Used By | Purpose |
|------|---------|---------|
| `.dmg` | Users (manual download) | Install the app first time |
| `.dmg.tar.gz` | Auto-updater | Compressed update file to download |
| `.sig` | Auto-updater | Verify update hasn't been tampered with |
| `latest.json` | Auto-updater | Tells app what version is available |

### How Auto-Updates Work

1. User opens the app
2. App reads `latest.json` from GitHub
3. Compares version in JSON to current version
4. If newer version exists:
   - Shows update notification
   - User clicks "Update Now"
   - Downloads appropriate `.dmg.tar.gz` file
   - Verifies with `.sig` file
   - Installs and restarts

---

## For Future Updates

When you release version 0.1.2:

1. **Update version** in `tauri.conf.json` to `"0.1.2"`
2. **Build** with `./scripts/build-release.sh`
3. **Create new `latest.json`** with:
   - New version: `"0.1.2"`
   - New signatures (from new `.sig` files)
   - New URLs (with `/v0.1.2/` in path)
4. **Create new GitHub release** with tag `v0.1.2`
5. **Upload all 7 files** (new versions)

---

## Quick Checklist

Before publishing a release, verify:

- [ ] All 6 build files exist (2 .dmg, 2 .dmg.tar.gz, 2 .sig)
- [ ] `latest.json` file created with correct signatures
- [ ] `latest.json` URLs match your GitHub username and repo
- [ ] Version in `latest.json` matches tag version
- [ ] All 7 files uploaded to GitHub release
- [ ] Release is published (not draft)

---

## Troubleshooting

**Q: Where do I get the signatures?**  
A: From the `.sig` files created during build. Use `cat filename.sig` to view.

**Q: Do I need to upload the regular .dmg files?**  
A: Yes! Users download these for initial installation. The `.dmg.tar.gz` files are only for auto-updates.

**Q: What if I forget to upload latest.json?**  
A: Auto-updates won't work. You can edit the release and add it later.

**Q: Can I test the update before releasing?**  
A: Yes, create a draft release first, then test with the draft URLs. Once confirmed, publish it.

**Q: What's the pub_date format?**  
A: ISO 8601 format in UTC: `YYYY-MM-DDTHH:MM:SSZ`  
Example: `2025-05-12T15:30:00Z`  
You can get current UTC time with: `date -u +"%Y-%m-%dT%H:%M:%SZ"`

---

## Example Complete Workflow

```bash
# 1. Build the app
./scripts/build-release.sh

# 2. Go to build output
cd packages/desktop/src-tauri/target/release/bundle/dmg/

# 3. View signatures
cat Flow_0.1.1_aarch64.dmg.tar.gz.sig
cat Flow_0.1.1_x64.dmg.tar.gz.sig

# 4. Create latest.json (use signatures from step 3)
nano latest.json

# 5. Go to GitHub and create release
# 6. Upload all 7 files
# 7. Publish release
# 8. Done! Users can now install and receive auto-updates
```

---

**You're ready!** Follow these steps for each release and your friends will receive automatic updates while keeping all their data.
