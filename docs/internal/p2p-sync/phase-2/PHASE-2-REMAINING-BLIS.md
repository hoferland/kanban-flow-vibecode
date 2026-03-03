# Phase 2 Remaining BLIs - Quick Reference

**Status:** 🔴 Not Started  
**Total Remaining:** 19 BLIs (88 story points)

This document provides a quick overview of all remaining Phase 2 BLIs. Each will be created as a separate detailed document as needed.

---

## Week 3: Desktop UI (4 remaining)

### P2P-062: Add Sync Section to SettingsModal (3 pts)
**Dependencies:** P2P-061  
**Description:** Integrate SyncSettings component into SettingsModal as new tab  
**Files:** `packages/desktop/src/lib/SettingsModal.svelte`

### P2P-063: Create Sync Status Indicator in Header (3 pts)
**Dependencies:** P2P-061  
**Description:** Add sync icon to Header showing connected/disconnected status  
**Files:** `packages/desktop/src/lib/Header.svelte`

### P2P-064: Implement Tauri Commands for Sync (5 pts)
**Dependencies:** P2P-049-060  
**Description:** Create Tauri commands: sync_start_server, sync_stop_server, sync_get_status, sync_unpair_device, sync_manual_sync  
**Files:** `packages/desktop/src-tauri/src/lib.rs`, `packages/desktop/src-tauri/src/sync/mod.rs`

### P2P-065: Add Sync State Management (2 pts)
**Dependencies:** P2P-064  
**Description:** Create Svelte store for sync state with reactive updates  
**Files:** `packages/desktop/src/stores/syncStore.js`

---

## Week 4: Testing & Integration (4 BLIs)

### P2P-066: Write Unit Tests for PIN (2 pts)
**Dependencies:** P2P-052, P2P-053  
**Description:** Comprehensive unit tests for PIN generation and validation  
**Files:** `packages/desktop/src-tauri/src/sync/pairing.rs` (test module)

### P2P-067: Write Unit Tests for Encryption (2 pts)
**Dependencies:** P2P-054, P2P-055  
**Description:** Unit tests for encryption manager, key derivation, encrypt/decrypt  
**Files:** `packages/desktop/src-tauri/src/sync/encryption.rs` (test module)

### P2P-068: Write Integration Tests (3 pts)
**Dependencies:** All Week 1-2 tasks  
**Description:** End-to-end integration tests for pairing and sync flows  
**Files:** `packages/desktop/src-tauri/tests/sync_integration.rs`

### P2P-069: Manual Testing on macOS (1 pt)
**Dependencies:** All Phase 2 tasks  
**Description:** Manual testing checklist, document issues, verify all features  
**Files:** `docs/internal/p2p-sync/phase-2/TESTING_RESULTS.md`

---

## User Stories (8 BLIs)

### P2P-041: Enable/Disable Sync Mode (5 pts)
**Type:** User Story  
**Dependencies:** P2P-061, P2P-064  
**Description:** As a desktop user, I can enable sync mode to allow mobile devices to connect  
**Acceptance Criteria:**
- [ ] Toggle in settings enables/disables sync
- [ ] mDNS service starts when enabled
- [ ] WebSocket server starts on port 9898
- [ ] UI shows current sync status
- [ ] Settings persist across app restarts

### P2P-042: View 6-Digit Pairing PIN (3 pts)
**Type:** User Story  
**Dependencies:** P2P-052, P2P-061  
**Description:** As a desktop user, I see a 6-digit PIN for secure pairing  
**Acceptance Criteria:**
- [ ] PIN displayed prominently when sync enabled
- [ ] PIN is large and easy to read
- [ ] PIN expires after 5 minutes
- [ ] Can regenerate PIN with button
- [ ] PIN changes are immediate

### P2P-043: View Paired Devices List (5 pts)
**Type:** User Story  
**Dependencies:** P2P-058, P2P-061  
**Description:** As a desktop user, I can view paired mobile devices  
**Acceptance Criteria:**
- [ ] List shows all paired devices
- [ ] Each entry shows device name
- [ ] Each entry shows last seen timestamp
- [ ] Each entry shows device type (iOS/Android)
- [ ] Empty state when no devices paired

### P2P-044: Unpair Devices (3 pts)
**Type:** User Story  
**Dependencies:** P2P-043, P2P-064  
**Description:** As a desktop user, I can unpair devices  
**Acceptance Criteria:**
- [ ] Remove button for each device
- [ ] Confirmation dialog before unpair
- [ ] Device removed from list
- [ ] Pairing data deleted from database
- [ ] Encryption keys removed

### P2P-045: Manual Sync Trigger (5 pts)
**Type:** User Story  
**Dependencies:** P2P-059, P2P-061  
**Description:** As a desktop user, I can manually trigger sync  
**Acceptance Criteria:**
- [ ] Manual sync button visible when device paired
- [ ] Button disabled when not connected
- [ ] Progress indicator during sync
- [ ] Success message on completion
- [ ] Error message on failure with details

### P2P-046: View Sync Status (3 pts)
**Type:** User Story  
**Dependencies:** P2P-063, P2P-065  
**Description:** As a desktop user, I see sync status and last sync time  
**Acceptance Criteria:**
- [ ] Header shows connected/disconnected icon
- [ ] Icon changes color based on status
- [ ] Tooltip shows last sync time
- [ ] Tooltip shows number of paired devices
- [ ] Click icon opens sync settings

### P2P-047: Receive Mobile Changes (13 pts)
**Type:** User Story  
**Dependencies:** P2P-059, P2P-065  
**Description:** As a desktop user, I receive mobile changes automatically  
**Acceptance Criteria:**
- [ ] Cards created on mobile appear on desktop
- [ ] Cards updated on mobile update on desktop
- [ ] Cards deleted on mobile delete on desktop
- [ ] Real-time UI updates (reactive stores)
- [ ] No user interaction required
- [ ] Works for cards, columns, attributes
- [ ] Maintains data integrity

### P2P-048: Automatic Conflict Resolution (13 pts)
**Type:** User Story  
**Dependencies:** P2P-060  
**Description:** As a desktop user, conflicts resolve automatically  
**Acceptance Criteria:**
- [ ] Last-Write-Wins algorithm applied
- [ ] No user intervention needed
- [ ] Conflicts logged for debugging
- [ ] User sees winning version
- [ ] No data loss
- [ ] Performance < 100ms per conflict
- [ ] Works for all entity types

---

## Database Schema Addition (1 BLI)

### P2P-070: Add Pairings Table to Schema (2 pts)
**Dependencies:** P2P-049  
**Description:** Add pairings table to store paired device information  
**Files:** `packages/desktop/src-tauri/src/database/schema.sql`  
**Schema:**
```sql
CREATE TABLE IF NOT EXISTS pairings (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL UNIQUE,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    public_key TEXT NOT NULL,
    paired_at INTEGER NOT NULL,
    last_seen INTEGER,
    last_sync_time INTEGER DEFAULT 0
);
```

---

## Summary by Week

| Week | BLIs | Story Points | Status |
|------|------|--------------|--------|
| Week 1-2 | 12 | 56 pts | ✅ Complete |
| Week 3 | 5 | 21 pts | 🔴 Not Started |
| Week 4 | 4 | 8 pts | 🔴 Not Started |
| User Stories | 8 | 55 pts | 🔴 Not Started |
| Database | 1 | 2 pts | 🔴 Not Started |
| **Total** | **30** | **142 pts** | **39% Complete** |

---

## Implementation Order

**Recommended sequence:**
1. P2P-070: Database schema (enables storage)
2. P2P-064: Tauri commands (connects backend to UI)
3. P2P-061: SyncSettings component (main UI)
4. P2P-062: Settings modal integration
5. P2P-065: Sync store (state management)
6. P2P-063: Header indicator
7. P2P-041-048: User stories (builds on above)
8. P2P-066-069: Testing (validates everything)

---

**Document Created:** December 23, 2024  
**Status:** Living document - update as BLIs are created individually
