# P2P-049: Add Rust Dependencies to Cargo.toml

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 1 pt  
**Status:** 🔴 Not Started  
**Dependencies:** None (first task in Phase 2)

---

## 🔄 Documentation Update Requirements

**⚠️ IMPORTANT: Before and After Each Work Session**

### Before Starting This BLI:
1. **Read the P2P Sync Documentation:**
   - Review [P2P Sync README](../README.md) - Section: "Phase 2: Desktop P2P Server"
   - Review [Phase 2 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md) - Dependencies section
   - Review [Master BACKLOG](../BACKLOG.md) - Phase 2 status
   - Note: This is the **first task** in Phase 2, no other dependencies

2. **Understand the Context:**
   - Phase 0 & 1 are complete (desktop & mobile foundations ready)
   - Starting Phase 2: Desktop P2P Server implementation
   - This task enables all subsequent sync functionality

### While Working:
1. **Track Progress:**
   - Update status in [BACKLOG.md](../BACKLOG.md): 🔴 → 🟡 In Progress
   - Note any version compatibility issues
   - Document any deviations from specified versions

### After Completion or Setback:
1. **Update Documentation:**
   - Mark this BLI as 🟢 Complete in [BACKLOG.md](../BACKLOG.md)
   - Check all acceptance criteria below
   - Update [README.md](../README.md) Phase 2 section if versions changed
   - Commit with message: `feat(sync): Add Rust dependencies for P2P server (P2P-049)`

2. **If Blocked/Setback:**
   - Document the specific dependency issue in "Issues Encountered" below
   - Check for version conflicts with existing dependencies
   - Update BACKLOG.md with blocker status
   - Consider alternative versions if needed

### Documentation Locations:
- **This BLI:** `docs/internal/p2p-sync/phase-2/P2P-049-Add-Rust-Dependencies.md`
- **README:** `docs/internal/p2p-sync/README.md#phase-2-desktop-p2p-server`
- **BACKLOG:** `docs/internal/p2p-sync/BACKLOG.md` (search for "P2P-049")
- **Epic:** `docs/internal/p2p-sync/phase-2/P2P-040-EPIC-Desktop-P2P-Server.md#dependencies`

---

## 📋 Description

Add all required Rust dependencies to `packages/desktop/src-tauri/Cargo.toml` for Phase 2 P2P sync functionality. These dependencies enable:
- **Async runtime** (tokio)
- **WebSocket communication** (tokio-tungstenite)
- **Service discovery** (mdns)
- **Encryption** (sodiumoxide)
- **Serialization** (serde, serde_json)
- **Utilities** (base64, sha2, rand, futures)

This is a foundational task that must be completed before any other Phase 2 work.

---

## 🎯 Acceptance Criteria

- [ ] All dependencies added to `Cargo.toml` with correct versions
- [ ] `cargo build` succeeds without errors
- [ ] No version conflicts with existing dependencies
- [ ] All dependency features properly specified (e.g., `tokio = { version = "1.35", features = ["full"] }`)
- [ ] Dependencies documented in `Cargo.lock` (auto-generated)
- [ ] No compiler warnings related to unused dependencies
- [ ] Git commit created with proper message

---

## 💻 Implementation Guide

### File to Modify

**Location:** `packages/desktop/src-tauri/Cargo.toml`

### Dependencies to Add

Add the following to the `[dependencies]` section:

```toml
# Async runtime for concurrent operations
tokio = { version = "1.35", features = ["full"] }

# WebSocket server for P2P communication
tokio-tungstenite = "0.21"

# mDNS service discovery for local network
mdns = "3.0"

# Cryptography for end-to-end encryption
sodiumoxide = "0.2"

# JSON serialization for sync messages
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Async utilities
futures = "0.3"

# Base64 encoding for encrypted messages
base64 = "0.21"

# SHA256 hashing for file integrity
sha2 = "0.10"

# Random number generation for PINs
rand = "0.8"
```

### Step-by-Step Instructions

1. **Open the file:**
   ```bash
   cd packages/desktop/src-tauri
   open Cargo.toml
   ```

2. **Locate the `[dependencies]` section**
   - Should already exist with rusqlite, uuid, chrono, tauri, etc.

3. **Add new dependencies** at the end of the existing dependencies
   - Keep existing dependencies intact
   - Add comment headers for organization

4. **Verify syntax:**
   - Ensure proper TOML formatting
   - Check that features are in brackets with quotes
   - Verify version strings are quoted

5. **Build to test:**
   ```bash
   cargo build
   ```
   - First build will take 5-10 minutes (downloads & compiles)
   - Watch for any version conflicts or errors

6. **Check for warnings:**
   ```bash
   cargo build 2>&1 | grep warning
   ```
   - Should be no warnings about dependencies

### Expected Cargo.toml Structure

```toml
[dependencies]
# Existing dependencies
rusqlite = "0.31"
uuid = "1.6"
chrono = "0.4"
tauri = "2.x"
# ... other existing deps ...

# NEW: Phase 2 P2P Sync Dependencies
# Async runtime
tokio = { version = "1.35", features = ["full"] }

# WebSocket & Networking
tokio-tungstenite = "0.21"
mdns = "3.0"

# Cryptography
sodiumoxide = "0.2"

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Utilities
futures = "0.3"
base64 = "0.21"
sha2 = "0.10"
rand = "0.8"
```

---

## 🧪 Testing

### Build Test
```bash
cd packages/desktop/src-tauri
cargo build --verbose
```

**Expected:** 
- ✅ Build succeeds
- ✅ All dependencies downloaded
- ✅ Cargo.lock updated
- ✅ No errors or warnings

### Verify Dependencies
```bash
cargo tree | grep -E "(tokio|tungstenite|mdns|sodiumoxide|serde)"
```

**Expected:**
- ✅ All new dependencies listed
- ✅ Correct versions shown
- ✅ Dependency tree looks reasonable

### Check for Conflicts
```bash
cargo check
```

**Expected:**
- ✅ No version conflicts
- ✅ No deprecated warnings
- ✅ No security advisories

---

## ⚠️ Potential Issues & Solutions

### Issue 1: sodiumoxide Build Failure

**Symptom:** Error about libsodium not found

**Solution:**
```bash
# macOS
brew install libsodium

# Then rebuild
cargo clean
cargo build
```

### Issue 2: Version Conflicts

**Symptom:** Cargo reports conflicting versions

**Solution:**
- Check existing dependencies in Cargo.toml
- Adjust version numbers to be compatible
- Try using `cargo update` to resolve

### Issue 3: Long Build Time

**Symptom:** First build takes > 10 minutes

**Solution:**
- This is normal for first build (many dependencies)
- Subsequent builds will be much faster
- Use `cargo build --release` only when needed

---

## 📚 References

- [P2P Sync README - Dependencies](../README.md#dependencies-to-add)
- [Phase 2 Epic - Dependencies Section](./P2P-040-EPIC-Desktop-P2P-Server.md#dependencies)
- [Cargo.toml Documentation](https://doc.rust-lang.org/cargo/reference/manifest.html)
- [tokio Documentation](https://tokio.rs/)
- [libsodium Documentation](https://doc.libsodium.org/)

---

## 📝 Implementation Notes

### Progress Log

| Date | Status | Notes |
|------|--------|-------|
| 2024-12-23 | Created | Initial BLI created |
| _[Add entries during work]_ | | |

### Decisions Made

_[Document any version changes or alternatives chosen]_

Example:
- Used tokio 1.35 instead of 1.36 due to stability
- Chose mdns 3.0 (latest stable at time of implementation)

### Issues Encountered

_[Document any problems and solutions]_

Example:
- Issue: libsodium not found on macOS
- Solution: Installed via homebrew (`brew install libsodium`)

### Version Notes

_[Track actual versions used if different from specification]_

| Dependency | Specified | Actual | Reason |
|------------|-----------|--------|--------|
| tokio | 1.35 | 1.35.1 | Cargo resolved to patch version |

---

## ✅ Definition of Done

This BLI is complete when:
- [x] All dependencies added to Cargo.toml
- [x] `cargo build` succeeds
- [x] No compiler warnings
- [x] Cargo.lock updated
- [x] Changes committed to git
- [x] BACKLOG.md updated to 🟢 Complete
- [x] This document updated with implementation notes

---

## 🔗 Related BLIs

**Depends On:** None (first Phase 2 task)

**Blocks:**
- P2P-050: Create sync module structure (needs dependencies)
- P2P-051: Implement mDNS (needs mdns dependency)
- P2P-054: Initialize encryption (needs sodiumoxide)
- P2P-056: WebSocket server (needs tokio-tungstenite)

**Part of:** [P2P-040 Epic - Desktop P2P Server](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Last Updated:** December 23, 2024  
**Owner:** Flow Development Team  
**Status:** 🔴 Not Started → Ready for Implementation
