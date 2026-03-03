# P2P-060: Implement Conflict Resolution

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 5 pts  
**Status:** 🔴 Not Started  
**Dependencies:** P2P-059 (sync request handler)

---

## 🔄 Documentation Update Requirements

**⚠️ IMPORTANT: Before and After Each Work Session**

### Before Starting:
- Review [P2P Sync README](../README.md#conflict-resolution)
- Review [BACKLOG](../BACKLOG.md)

### While Working:
- Update [BACKLOG.md](../BACKLOG.md): 🔴 → 🟡

### After Completion:
- Mark 🟢 Complete in [BACKLOG.md](../BACKLOG.md)
- Commit: `feat(sync): Implement conflict resolution (P2P-060)`

### If Blocked:
- Document resolution issues
- Update BACKLOG.md

---

## 📋 Description

Implement Last-Write-Wins conflict resolution algorithm. Rules:
- Compare timestamps of conflicting entities
- Most recent timestamp wins
- If timestamps equal, device_id tiebreaker (alphabetical)
- Deletions always win (tombstone logic)
- Log all conflict resolutions

---

## 🎯 Acceptance Criteria

- [ ] `resolve_conflict()` method implemented
- [ ] Compares updated_at timestamps
- [ ] Device ID used as tiebreaker
- [ ] Deletions always win logic
- [ ] Returns winning entity
- [ ] Logs conflict decisions
- [ ] Unit test: Desktop wins (newer)
- [ ] Unit test: Mobile wins (newer)
- [ ] Unit test: Deletion wins
- [ ] Unit test: Tiebreaker scenario

---

## 📚 Key References

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

- [ ] resolve_conflict() works
- [ ] All conflict scenarios tested
- [ ] Unit tests pass
- [ ] Committed to git
- [ ] BACKLOG.md updated

---

## 🔗 Related BLIs

**Depends On:** P2P-059  
**Used By:** P2P-059 (calls this for conflicts)  
**Part of:** [P2P-040 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Status:** 🔴 Not Started
