# All Remaining Phase 2 BLIs

**Quick reference for all remaining Phase 2 backlog items.**

---

## P2P-064: Implement Tauri Commands for Sync (5 pts)

**Dependencies:** P2P-049-060  
**Description:** Create Tauri commands for frontend-backend communication

### Commands to Implement:
- `sync_start_server()` - Start mDNS + WebSocket server
- `sync_stop_server()` - Stop all sync services
- `sync_get_status()` - Get current sync status
- `sync_get_pin()` - Get active PIN
- `sync_regenerate_pin()` - Generate new PIN
- `sync_get_paired_devices()` - List paired devices
- `sync_unpair_device(device_id)` - Remove pairing
- `sync_manual_sync(device_id)` - Trigger manual sync

**File:** `packages/desktop/src-tauri/src/lib.rs`

**🔄 Doc Requirements:** Review README, update BACKLOG before/after. Commit: `feat(sync): Implement Tauri commands (P2P-064)`

---

## P2P-065: Add Sync State Management (2 pts)

**Dependencies:** P2P-064  
**Description:** Create syncStore.js for reactive sync state

### Store State:
```javascript
{
  enabled: false,
  pin: null,
  pairedDevices: [],
  connected: false,
  lastSyncTime: null,
  syncing: false
}
```

**File:** `packages/desktop/src/stores/syncStore.js`

**🔄 Doc Requirements:** Review README, update BACKLOG. Commit: `feat(sync): Add sync state management (P2P-065)`

---

## P2P-066: Write Unit Tests for PIN (2 pts)

**Dependencies:** P2P-052, P2P-053  
**Description:** Comprehensive PIN tests

### Tests to Write:
- PIN generation produces 6 digits
- PIN validation works correctly
- PIN expiry after 5 minutes
- Rate limiting enforced

**File:** `packages/desktop/src-tauri/src/sync/pairing.rs`

**🔄 Doc Requirements:** Update BACKLOG. Commit: `test(sync): Add PIN unit tests (P2P-066)`

---

## P2P-067: Write Unit Tests for Encryption (2 pts)

**Dependencies:** P2P-054, P2P-055  
**Description:** Encryption tests

### Tests to Write:
- Key pair generation
- ECDH key derivation
- Encrypt/decrypt round-trip
- Tampering detection

**File:** `packages/desktop/src-tauri/src/sync/encryption.rs`

**🔄 Doc Requirements:** Update BACKLOG. Commit: `test(sync): Add encryption unit tests (P2P-067)`

---

## P2P-068: Write Integration Tests (3 pts)

**Dependencies:** All Week 1-2 tasks  
**Description:** End-to-end sync integration tests

### Test Scenarios:
- Complete pairing flow
- Sync with no conflicts
- Sync with conflicts
- Multiple devices
- Network interruption recovery

**File:** `packages/desktop/src-tauri/tests/sync_integration.rs`

**🔄 Doc Requirements:** Update BACKLOG. Commit: `test(sync): Add integration tests (P2P-068)`

---

## P2P-069: Manual Testing on macOS (1 pt)

**Dependencies:** All Phase 2 tasks  
**Description:** Manual testing checklist

### Test Areas:
- Enable/disable sync
- PIN display and expiry
- Device pairing
- Sync functionality
- UI responsiveness
- Error handling

**Create:** `docs/internal/p2p-sync/phase-2/TESTING_RESULTS.md`

**🔄 Doc Requirements:** Update BACKLOG. Document findings.

---

## P2P-070: Add Pairings Table to Database (2 pts)

**Dependencies:** None  
**Description:** Add pairings table to schema.sql

### Schema:
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

CREATE INDEX idx_pairings_device_id ON pairings(device_id);
```

**File:** `packages/desktop/src-tauri/src/database/schema.sql`

**🔄 Doc Requirements:** Update BACKLOG. Commit: `feat(sync): Add pairings table (P2P-070)`

---

## User Story: P2P-041 - Enable/Disable Sync Mode (5 pts)

**Dependencies:** P2P-061, P2P-064  
**Type:** User Story

**As a desktop user, I can enable sync mode to allow mobile devices to connect**

### Acceptance Criteria:
- [ ] Toggle in SyncSettings enables/disables sync
- [ ] Enabling starts mDNS + WebSocket server
- [ ] Disabling stops all services
- [ ] Status persists across app restarts
- [ ] Clear feedback on enable/disable

**🔄 Doc Requirements:** Update BACKLOG after testing. Commit: `feat(sync): Enable/disable sync mode (P2P-041)`

---

## User Story: P2P-042 - View Pairing PIN (3 pts)

**Dependencies:** P2P-052, P2P-061  
**Type:** User Story

**As a desktop user, I see a 6-digit PIN for secure pairing**

### Acceptance Criteria:
- [ ] PIN displayed prominently in SyncSettings
- [ ] Large font, easy to read
- [ ] Shows expiry countdown
- [ ] Regenerate button works
- [ ] PIN updates immediately

**🔄 Doc Requirements:** Update BACKLOG. Commit: `feat(sync): Display pairing PIN (P2P-042)`

---

## User Story: P2P-043 - View Paired Devices (5 pts)

**Dependencies:** P2P-058, P2P-061  
**Type:** User Story

**As a desktop user, I can view paired mobile devices**

### Acceptance Criteria:
- [ ] List shows all paired devices
- [ ] Shows device name, type, last seen
- [ ] Updates when devices connect/disconnect
- [ ] Empty state message when no devices
- [ ] Sorted by last seen (most recent first)

**🔄 Doc Requirements:** Update BACKLOG. Commit: `feat(sync): View paired devices (P2P-043)`

---

## User Story: P2P-044 - Unpair Devices (3 pts)

**Dependencies:** P2P-043, P2P-064  
**Type:** User Story

**As a desktop user, I can unpair devices**

### Acceptance Criteria:
- [ ] Unpair button for each device
- [ ] Confirmation dialog with device name
- [ ] Device removed immediately
- [ ] Database entry deleted
- [ ] Keys removed securely

**🔄 Doc Requirements:** Update BACKLOG. Commit: `feat(sync): Unpair devices (P2P-044)`

---

## User Story: P2P-045 - Manual Sync Trigger (5 pts)

**Dependencies:** P2P-059, P2P-061  
**Type:** User Story

**As a desktop user, I can manually trigger sync**

### Acceptance Criteria:
- [ ] Manual sync button in SyncSettings
- [ ] Button disabled when not connected
- [ ] Progress indicator shows during sync
- [ ] Success toast on completion
- [ ] Error toast with details on failure

**🔄 Doc Requirements:** Update BACKLOG. Commit: `feat(sync): Manual sync trigger (P2P-045)`

---

## User Story: P2P-046 - View Sync Status (3 pts)

**Dependencies:** P2P-063, P2P-065  
**Type:** User Story

**As a desktop user, I see sync status and last sync time**

### Acceptance Criteria:
- [ ] Header icon shows connected/disconnected
- [ ] Green = connected, Gray = disconnected
- [ ] Tooltip shows last sync time
- [ ] Tooltip shows paired device count
- [ ] Click opens sync settings

**🔄 Doc Requirements:** Update BACKLOG. Commit: `feat(sync): Sync status indicator (P2P-046)`

---

## User Story: P2P-047 - Receive Mobile Changes (13 pts)

**Dependencies:** P2P-059, P2P-065  
**Type:** User Story

**As a desktop user, I receive mobile changes automatically**

### Acceptance Criteria:
- [ ] Mobile card creates appear on desktop
- [ ] Mobile card updates appear on desktop
- [ ] Mobile card deletes appear on desktop
- [ ] UI updates reactively (no refresh needed)
- [ ] Works for cards, columns, attributes
- [ ] No user action required
- [ ] Data integrity maintained

**🔄 Doc Requirements:** Update BACKLOG. Commit: `feat(sync): Receive mobile changes (P2P-047)`

---

## User Story: P2P-048 - Automatic Conflict Resolution (13 pts)

**Dependencies:** P2P-060  
**Type:** User Story

**As a desktop user, conflicts resolve automatically**

### Acceptance Criteria:
- [ ] Last-Write-Wins applied automatically
- [ ] No user prompts for conflicts
- [ ] Conflicts logged to console
- [ ] Winning version displayed
- [ ] No data loss
- [ ] Performance < 100ms per conflict
- [ ] Works for all entity types

**🔄 Doc Requirements:** Update BACKLOG. Commit: `feat(sync): Automatic conflict resolution (P2P-048)`

---

## Quick Status Summary

| BLI | Title | Points | Status |
|-----|-------|--------|--------|
| P2P-062 | Settings integration | 3 | 🔴 |
| P2P-063 | Header indicator | 3 | 🔴 |
| P2P-064 | Tauri commands | 5 | 🔴 |
| P2P-065 | Sync store | 2 | 🔴 |
| P2P-066 | PIN tests | 2 | 🔴 |
| P2P-067 | Encryption tests | 2 | 🔴 |
| P2P-068 | Integration tests | 3 | 🔴 |
| P2P-069 | Manual testing | 1 | 🔴 |
| P2P-070 | Pairings table | 2 | 🔴 |
| P2P-041 | Enable sync | 5 | 🔴 |
| P2P-042 | View PIN | 3 | 🔴 |
| P2P-043 | View devices | 5 | 🔴 |
| P2P-044 | Unpair | 3 | 🔴 |
| P2P-045 | Manual sync | 5 | 🔴 |
| P2P-046 | Sync status | 3 | 🔴 |
| P2P-047 | Receive changes | 13 | 🔴 |
| P2P-048 | Conflict resolution | 13 | 🔴 |

**Total:** 17 BLIs, 73 story points

---

**Created:** December 23, 2024  
**Note:** Create individual detailed BLI documents as needed for implementation
