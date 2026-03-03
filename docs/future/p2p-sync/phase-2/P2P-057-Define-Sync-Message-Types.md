# P2P-057: Define Sync Message Types

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 3 pts  
**Status:** 🔴 Not Started  
**Dependencies:** P2P-049 (serde), P2P-050 (module structure)

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
- Commit: `feat(sync): Define sync message types (P2P-057)`

### If Blocked:
- Document serialization issues
- Update BACKLOG.md

---

## 📋 Description

Define all message type structs for the sync protocol with serde serialization. Must include:
- Base SyncMessage wrapper
- PairRequest/PairResponse
- SyncRequest/SyncResponse
- Change entity structure
- Error messages

All types must serialize to/from JSON for WebSocket transport.

---

## 🎯 Acceptance Criteria

- [ ] All message types defined in `types.rs`
- [ ] Structs have `#[derive(Serialize, Deserialize)]`
- [ ] Field names match protocol spec (camelCase/snake_case)
- [ ] Timestamp fields are i64 (Unix milliseconds)
- [ ] Optional fields properly handled
- [ ] Unit test: Serialize to JSON
- [ ] Unit test: Deserialize from JSON
- [ ] Unit test: Round-trip serialization
- [ ] Code compiles without warnings

---

## 📚 Key References

- [P2P Sync README - Message Format](../README.md#message-format)
- [serde Documentation](https://serde.rs/)
- File: `packages/desktop/src-tauri/src/sync/types.rs`

---

## 📝 Implementation Notes

### Progress Log
| Date | Status | Notes |
|------|--------|-------|
| 2024-12-23 | Created | Initial BLI created |

---

## ✅ Definition of Done

- [ ] All message types defined
- [ ] Serialization works
- [ ] Deserialization works
- [ ] Unit tests pass
- [ ] Committed to git
- [ ] BACKLOG.md updated

---

## 🔗 Related BLIs

**Depends On:** P2P-049, P2P-050  
**Blocks:** P2P-058 (Pairing handler), P2P-059 (Sync handler)  
**Part of:** [P2P-040 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Status:** 🔴 Not Started
