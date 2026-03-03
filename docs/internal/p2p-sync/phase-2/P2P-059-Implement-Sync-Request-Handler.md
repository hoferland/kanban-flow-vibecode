# P2P-059: Implement Sync Request Handler

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 8 pts  
**Status:** 🔴 Not Started  
**Dependencies:** P2P-056 (WebSocket), P2P-057 (message types), P2P-058 (pairing handler)

---

## 🔄 Documentation Update Requirements

**⚠️ IMPORTANT: Before and After Each Work Session**

### Before Starting:
- Review [P2P Sync README](../README.md#sync-protocol)
- Review [Phase 2 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)
- Review [BACKLOG](../BACKLOG.md)

### While Working:
- Update [BACKLOG.md](../BACKLOG.md): 🔴 → 🟡

### After Completion:
- Mark 🟢 Complete in [BACKLOG.md](../BACKLOG.md)
- Commit: `feat(sync): Implement sync request handler (P2P-059)`

### If Blocked:
- Document sync protocol issues
- Update BACKLOG.md

---

## 📋 Description

Implement sync protocol handler to process SYNC_REQUEST messages. Must:
- Parse SyncRequest from mobile
- Query database for changes since last sync time
- Detect conflicts between mobile/desktop changes
- Apply conflict resolution (Last-Write-Wins)
- Return SyncResponse with changes
- Update last_sync_time for device

---

## 🎯 Acceptance Criteria

- [ ] `handle_sync_request()` fully implemented
- [ ] Queries database for changes since timestamp
- [ ] Detects conflicts (same entity modified on both)
- [ ] Applies conflict resolution algorithm
- [ ] Returns all desktop changes to mobile
- [ ] Applies mobile changes to desktop database
- [ ] Updates last_sync_time in pairings table
- [ ] Unit test: No conflicts scenario
- [ ] Unit test: Conflict resolution
- [ ] Integration test: Full sync flow

---

## 📚 Key References

- [P2P Sync README - Sync Protocol](../README.md#sync-protocol)
- [P2P Sync README - Conflict Resolution](../README.md#conflict-resolution)
- File: `packages/desktop/src-tauri/src/sync/protocol.rs`

---

## 📝 Implementation Notes

### Progress Log
| Date | Status | Notes |
|------|--------|-------|
| 2024-12-23 | Created | Initial BLI created |

---

## ✅ Definition of Done

- [ ] handle_sync_request() works
- [ ] Database queries correct
- [ ] Conflict resolution works
- [ ] All unit tests pass
- [ ] Integration test passes
- [ ] Committed to git
- [ ] BACKLOG.md updated

---

## 🔗 Related BLIs

**Depends On:** P2P-056, P2P-057, P2P-058  
**Blocks:** P2P-061 (Desktop UI needs working sync)  
**Related:** P2P-060 (Conflict resolution logic)  
**Part of:** [P2P-040 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Status:** 🔴 Not Started
