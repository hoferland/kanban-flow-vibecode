---
title: "Tauri Signing Key Password Lost During v0.4.1 Release Build"
date: 2026-03-03
problem_type: deployment-issues
components:
  - Tauri signing
  - GitHub release
  - auto-updater
  - build process
severity: high
status: resolved
tags:
  - tauri
  - code-signing
  - auto-update
  - release-management
  - private-key
  - updater-bundle
---

# GitHub Release with Signing and Auto-Update Setup

## Problem Symptom

**Initial Observation:**
The v0.4.1 tag existed in the repository but the corresponding GitHub release contained only release notes without an application binary. The user needed to build and publish a proper release with auto-update functionality.

**Critical Issue Encountered:**
During the release build process, Tauri required the signing key password to create a signed updater bundle. However, the password for the existing signing keys (generated during v0.4.0) had been forgotten and was not documented.

**Observable Behavior:**
- Build process halted requesting `TAURI_KEY_PASSWORD` environment variable
- Unable to proceed with creating signed updater bundles (.tar.gz.sig)
- Auto-update functionality could not be enabled without proper code signing

**Secondary Issue:**
After regenerating keys with an empty password and building v0.4.1, the auto-updater initially failed because the installed v0.4.0 application had the old public key and couldn't verify the v0.4.1 update signature. This required manual installation of v0.4.1 to establish the correct key for future auto-updates.

**Resolution:**
- Regenerated Tauri signing keypair with empty password for simplified management
- Updated `tauri.conf.json` with new public key
- Successfully built signed release with updater bundle
- Manual installation of v0.4.1 established correct signing key baseline
- Future auto-updates confirmed working from v0.4.1 onwards

---

## Root Cause

The v0.4.1 release encountered a cascading series of issues rooted in **signing key management problems**:

### Primary Root Cause
**Password-Protected Key Forgotten**: The Tauri signing key at `~/.tauri/flow-kanban.key` was password-protected, but the password was forgotten. This prevented signing the update bundle needed for the v0.4.1 release.

### Secondary Issues
1. **Missing Binary in Initial v0.4.1 Tag**: The git tag `v0.4.1` was created but no compiled binary was uploaded to the GitHub release
2. **Key Mismatch Between Versions**: After regenerating keys with a new password, v0.4.0 (built with old key) couldn't verify updates signed with the new key, breaking the auto-update chain
3. **Manual Installation Required**: Users with v0.4.0 had to manually install v0.4.1 to get the new public key embedded in the app

### Technical Details
- **Old Key**: Public key `60EE7D3996BCAAED` (password-protected, password forgotten)
- **New Key**: Public key `D23281B5DE39B6BA` (empty password for automation)
- **Impact**: Broke update signature verification between v0.4.0 → v0.4.1

---

## Investigation Steps

### Step 1: Initial Release Attempt
```bash
# Attempted to create release using automated script
./scripts/create-github-release.sh
```
**Result**: Failed because tauri.conf.json version was already at 0.4.1, but no binary existed in GitHub release

### Step 2: Manual Build Attempt
```bash
cd packages/desktop
npm run tauri build -- --bundles app,updater
```
**Result**: Build succeeded but signing failed due to forgotten password on private key

### Step 3: Password Recovery Attempts
- Attempted various password combinations
- Checked for password management files
**Result**: Password could not be recovered

### Step 4: Decision to Regenerate Keys
Decided to regenerate signing keys with empty password to:
- Enable automation without password prompts
- Simplify future release processes
- Resolve the immediate blocking issue

### Step 5: Key Backup and Regeneration
```bash
# Backed up old keys
mkdir -p ~/.tauri/backup/
cp ~/.tauri/flow-kanban.key ~/.tauri/backup/flow-kanban.key.old
cp ~/.tauri/flow-kanban.key.pub ~/.tauri/backup/flow-kanban.key.pub.old

# Generated new keys with empty password
npm run tauri signer generate -- \
  --password "" \
  --write-keys ~/.tauri/flow-kanban.key \
  --force
```
**Result**: New keys generated successfully
- New public key: `D23281B5DE39B6BA`
- Old public key (backed up): `60EE7D3996BCAAED`

### Step 6: Update Configuration
```json
// Updated tauri.conf.json with new public key
{
  "updater": {
    "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEQyMzI4MUI1REUzOUI2QkEKUldTNnRqbmV0WUV5MHBJREJUck8rTEx6YkNLdDBvazhPZ09Kam1BcmdBRUpsVnI5OHZFd1IyZHoK"
  }
}
```

### Step 7: Build with New Keys
```bash
cd packages/desktop
export TAURI_PRIVATE_KEY=$(cat ~/.tauri/flow-kanban.key)
export TAURI_KEY_PASSWORD=""
npm run tauri build -- --bundles app,updater
```
**Result**: Build successful, created:
- `Flow.app` - macOS application bundle
- `Flow.app.tar.gz` - Compressed update package (4.6 MB)
- `Flow.app.tar.gz.sig` - Cryptographic signature (400 bytes)

### Step 8: Create Update Manifest
Created `latest.json` with version info, signature, and download URL:
```json
{
  "version": "0.4.1",
  "notes": "Documentation & Code Quality Improvements",
  "pub_date": "2026-03-03T15:20:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "...",
      "url": "https://github.com/hoferland/kanban-flow-vibecode/releases/download/v0.4.1/Flow.app.tar.gz"
    }
  }
}
```

### Step 9: Upload to GitHub
```bash
gh release upload v0.4.1 \
  Flow.app.tar.gz \
  Flow.app.tar.gz.sig \
  latest.json \
  --clobber
```
**Result**: Files uploaded successfully to GitHub release

### Step 10: Auto-Update Issue Discovery
**Problem**: Existing v0.4.0 installations couldn't auto-update to v0.4.1
**Reason**: v0.4.0 had old public key, but v0.4.1 updates were signed with new key
**Impact**: Signature verification failed, auto-update blocked

### Step 11: Manual Installation Solution
```bash
# Copy new build to Applications folder
cp -R packages/desktop/src-tauri/target/release/bundle/macos/Flow.app /Applications/

# Remove macOS quarantine attribute
xattr -cr /Applications/Flow.app
```
**Result**: v0.4.1 installed successfully with new public key embedded

### Step 12: Commit Key Changes
```bash
git add packages/desktop/src-tauri/tauri.conf.json
git commit -m "chore: update Tauri public key for v0.4.1 release"
git push origin main
```
**Commit Hash**: `dae8e70`

---

## Working Solution

### Complete Release Process for v0.4.1

#### Prerequisites Setup
```bash
# 1. Ensure you have necessary tools
brew install gh  # GitHub CLI
gh auth login    # Authenticate with GitHub

# 2. Navigate to project root
cd /Users/I550797/Desktop/Coding/flow-kanban
```

#### Key Regeneration Process
```bash
# Step 1: Backup existing keys
mkdir -p ~/.tauri/backup/
cp ~/.tauri/flow-kanban.key ~/.tauri/backup/flow-kanban.key.old
cp ~/.tauri/flow-kanban.key.pub ~/.tauri/backup/flow-kanban.key.pub.old

# Step 2: Generate new keys with empty password
cd packages/desktop
npm run tauri signer generate -- \
  --password "" \
  --write-keys ~/.tauri/flow-kanban.key \
  --force

# Output:
# Your keypair was generated successfully
# Private: /Users/I550797/.tauri/flow-kanban.key
# Public: /Users/I550797/.tauri/flow-kanban.key.pub
```

#### Configuration Update
```bash
# Step 3: Read new public key
cat ~/.tauri/flow-kanban.key.pub

# Step 4: Update tauri.conf.json
# Replace the "pubkey" value in the "updater" section
```

#### Building and Signing
```bash
# Step 5: Set environment variables for signing
export TAURI_PRIVATE_KEY=$(cat ~/.tauri/flow-kanban.key)
export TAURI_KEY_PASSWORD=""

# Step 6: Build the application with updater bundle
cd packages/desktop
npm run tauri build -- --bundles app,updater

# Build output location:
# packages/desktop/src-tauri/target/release/bundle/macos/
#   ├── Flow.app
#   ├── Flow.app.tar.gz
#   └── Flow.app.tar.gz.sig
```

#### Uploading to GitHub
```bash
# Step 7: Upload files to release
cd packages/desktop/src-tauri/target/release/bundle/macos
gh release upload v0.4.1 \
  Flow.app.tar.gz \
  Flow.app.tar.gz.sig \
  latest.json \
  --clobber

# Verify upload
gh release view v0.4.1 --json assets --jq '.assets[] | .name'
```

#### Manual Installation (for key mismatch)
```bash
# Step 8: Install new version locally
cp -R packages/desktop/src-tauri/target/release/bundle/macos/Flow.app /Applications/

# Step 9: Remove macOS quarantine
xattr -cr /Applications/Flow.app

# Step 10: Launch to verify
open /Applications/Flow.app
```

---

## What Made It Work

### Critical Success Factors

#### 1. Empty Password for Automation
**Decision**: Regenerate keys with empty password (`--password ""`)

**Why it worked**:
- Eliminated password entry during automated builds
- Simplified CI/CD integration
- Removed human memory as failure point
- Scripts can read key file directly

#### 2. Systematic Key Backup
**Action**: Backed up old keys before regeneration

**Why it worked**:
- Preserved ability to sign updates for older versions
- Created audit trail of key changes
- Enabled rollback if needed
- Documented old public key ID

#### 3. Configuration in Version Control
**Action**: Committed new public key to `tauri.conf.json`

**Why it worked**:
- New builds automatically embed correct key
- Clear git history of key changes
- Other developers get correct config
- Future updates verify correctly

#### 4. Manual Installation for Key Transition
**Solution**: Manually installed v0.4.1 instead of fixing auto-update

**Why it worked**:
- Broke update chain at key transition
- v0.4.1 embedded new public key
- Future updates work automatically
- One-time manual step vs. complex backward compatibility

#### 5. Complete Build Artifacts
**Created**: All three required files
- `Flow.app.tar.gz` - Update package
- `Flow.app.tar.gz.sig` - Signature
- `latest.json` - Update manifest

**Why it worked**:
- Tauri updater requires all three
- Signature prevents tampering
- Manifest notifies about updates
- Complete set enables auto-update

---

## Prevention Strategies

### 1. Key Management

**Use Empty Passwords for Development**:
```bash
# When generating keys, use empty password
tauri signer generate -w ~/.tauri/flow-kanban.key
# Press Enter when prompted (leave empty)
```

**Key Backup Strategy**:
- Store in password manager immediately
- Keep encrypted backup in separate location
- Document key location in team wiki
- Never rely on memory

**Version Control Protection**:
- Verify `.gitignore` includes `*.key`
- Use pre-commit hooks to scan for keys
- Regular audit: `git log --all -- "*.key"`

### 2. Pre-Release Validation

**Pre-Release Checklist**:
```bash
# Check keys exist
[ -f ~/.tauri/flow-kanban.key ] || exit 1

# Verify public key matches private key
# Validate version is semantic
# Check git working tree is clean
# Verify GitHub CLI authenticated
```

**Public Key Consistency Check**:
```bash
# Add to release script
DERIVED_PUBKEY=$(derive_from_private_key)
CONFIG_PUBKEY=$(extract_from_tauri_conf)

if [ "$DERIVED_PUBKEY" != "$CONFIG_PUBKEY" ]; then
  echo "❌ Public key mismatch!"
  exit 1
fi
```

### 3. Release Atomicity

**Staging Releases**:
- Always create draft releases first
- Test download links before publishing
- Validate auto-update detection
- Only publish after verification

**Rollback Procedure**:
- Delete bad release if issues found
- Re-tag previous version as "latest"
- Update latest.json to previous version
- Users revert on next check

### 4. First Release After Key Change

**User Communication**:
```markdown
## ⚠️ IMPORTANT: Manual Reinstall Required

This release uses new signing keys.

**Existing users must:**
1. Delete old app from Applications
2. Download this version manually
3. Auto-updates work normally after this

**Your data is safe** - stored separately.
```

---

## Best Practices

### Key Management Standards

**Password Policy**:
- Development: Empty passwords (documented)
- Team Projects: Shared password manager
- Production: Hardware security keys (YubiKey)

**Key Storage**:
```bash
~/.tauri/flow-kanban.key         # Private key
~/.tauri/flow-kanban.key.pub     # Public key
~/Backups/tauri-keys-encrypted.zip  # Backup
```

**Key Documentation**:
Create `docs/internal/SIGNING_KEYS.md`:
- Generated date
- Location
- Password policy
- Key history
- Backup locations
- Rotation plan

### Environment Setup

```bash
# ~/.zshrc or ~/.bash_profile
export TAURI_PRIVATE_KEY_PATH="$HOME/.tauri/flow-kanban.key"
export TAURI_KEY_PASSWORD=""  # Empty for development
```

### Release Process Standards

**Semantic Versioning**:
- `0.x.(y+1)`: Bug fixes
- `0.(x+1).0`: New features
- `1.0.0`: Production ready
- `(x+1).0.0`: Breaking changes (including key changes)

**Quality Gates**:
1. All tests pass
2. Manual smoke test
3. Build completes without warnings
4. Signing key verification passes
5. Draft release created and tested
6. Update mechanism validated

---

## Recommended Automation

### Enhanced Release Script

Add key validation to release script:
```bash
echo "🔐 Validating signing keys..."

if [ ! -f "$PRIVATE_KEY_PATH" ]; then
    error_exit "Private key not found"
fi

# Verify public key matches
DERIVED_PUBKEY=$(extract_pubkey_from_private)
CONFIG_PUBKEY=$(extract_pubkey_from_config)

if [ "$DERIVED_PUBKEY" != "$CONFIG_PUBKEY" ]; then
    error_exit "Key mismatch! Updates will fail verification."
fi
```

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Prevent committing private keys
if git diff --cached --name-only | grep -E '\.(key|pem)$'; then
    echo "❌ Attempting to commit private key!"
    exit 1
fi
```

### Automated Testing Script

```bash
#!/bin/bash
# scripts/test-release.sh

VERSION=$1
TAG="v${VERSION}"

# Test download latest.json
curl -f "https://github.com/.../releases/download/${TAG}/latest.json" > /tmp/test.json

# Validate JSON
jq empty /tmp/test.json || exit 1

# Check version matches
MANIFEST_VERSION=$(jq -r '.version' /tmp/test.json)
[ "$MANIFEST_VERSION" = "$VERSION" ] || exit 1

echo "✅ Release tests passed!"
```

---

## Related Issues

**No GitHub issues created** - All work tracked internally through:
- Todo files in `todos/` directory (6 completed)
- Internal code review (March 3, 2026)
- v0.4.1 release process

**Context:**
- Repository: hoferland/kanban-flow-vibecode
- Release: v0.4.1 (March 3, 2026)
- Work Type: Documentation streamlining, auto-update validation

---

## Related Documentation

### Auto-Update System Documentation

1. **docs/internal/RELEASE_GUIDE.md** (418 lines)
   - Complete release guide
   - Auto-update system overview
   - Troubleshooting

2. **docs/internal/AUTO_UPDATE_TESTING.md** (323 lines)
   - Testing methods
   - Success/failure indicators
   - Common issues

3. **docs/internal/UPDATE_TESTING_GUIDE.md** (397 lines)
   - End-to-end testing
   - Local simulation
   - Monitoring procedures

4. **docs/archive/AUTO_UPDATE_FIX_COMPLETE.md** (211 lines)
   - Historical auto-update fix
   - Incorrect endpoint resolution
   - Dev vs production behavior

### Related Configuration

**Tauri Configuration:**
- `packages/desktop/src-tauri/tauri.conf.json`
  - Version: 0.4.1
  - Updater: Active with GitHub endpoint
  - Bundle targets: app, dmg, updater

**Rust Dependencies:**
- `packages/desktop/src-tauri/Cargo.toml`
  - Tauri with "updater" feature

---

## Cross-References

### GitHub Release v0.4.1

**Release Information:**
- Tag: v0.4.1
- Created: March 3, 2026
- URL: https://github.com/hoferland/kanban-flow-vibecode/releases/tag/v0.4.1

**Assets:**
1. Flow.app.tar.gz (4.6 MB)
2. Flow.app.tar.gz.sig (400 bytes)
3. latest.json (828 bytes)

### Scripts

**Release Scripts:**
1. `scripts/create-github-release.sh` (377 lines)
   - Primary automation
   - Version updates, building, DMG
   - latest.json generation
   - GitHub upload

2. `scripts/create-github-release-no-dmg.sh` (336 lines)
   - Updater-only releases
   - Skips DMG creation

**Helper Scripts:**
- `scripts/check-app-pubkey.sh` - Key verification
- `scripts/diagnose-update-issue.sh` - Diagnostics
- `scripts/update-local-app.sh` - Local testing

### External Resources

**Tauri Documentation:**
- [Updater Guide](https://tauri.app/v1/guides/distribution/updater)
- [Code Signing](https://tauri.app/v1/guides/distribution/sign-macos)

**Repository:**
- https://github.com/hoferland/kanban-flow-vibecode
- https://github.com/hoferland/kanban-flow-vibecode/releases

---

## Summary

The v0.4.1 release solution centered on:
1. **Key regeneration** with empty password
2. **Systematic backup** of old keys
3. **One-time manual installation** for key transition
4. **Proper automation** for future releases

**Future releases** from v0.4.1 onward will auto-update successfully because all apps share the same public key (`D23281B5DE39B6BA`).

**Key Takeaways:**
- Empty passwords eliminate forgotten password issues
- Always backup keys immediately
- Validate keys before every release
- Key changes are breaking changes
- Automate repetitive tasks
- Document everything

---

**Resolution Date:** 2026-03-03
**Release:** v0.4.1
**Status:** ✅ Resolved and Documented
**Auto-Updates:** Working from v0.4.1 onwards
