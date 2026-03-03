# P2P-061: Create SyncSettings.svelte Component

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 8 pts  
**Status:** 🔴 Not Started  
**Dependencies:** P2P-049 through P2P-060 (all backend complete)

---

## 🔄 Documentation Update Requirements

**⚠️ IMPORTANT: Before and After Each Work Session**

### Before Starting:
- Review [P2P Sync README](../README.md#desktop-ui)
- Review [BACKLOG](../BACKLOG.md)

### While Working:
- Update [BACKLOG.md](../BACKLOG.md): 🔴 → 🟡

### After Completion:
- Mark 🟢 Complete in [BACKLOG.md](../BACKLOG.md)
- Commit: `feat(sync): Create SyncSettings component (P2P-061)`

---

## 📋 Description

Create Svelte component for sync settings panel. Must include:
- Enable/disable sync toggle
- 6-digit PIN display (large, prominent)
- Regenerate PIN button
- Paired devices list with remove buttons
- Manual sync button
- Last sync timestamp
- Sync statistics

---

## 🎯 Acceptance Criteria

- [ ] SyncSettings.svelte created
- [ ] Toggle to enable/disable sync
- [ ] PIN displayed prominently when enabled
- [ ] Regenerate PIN button works
- [ ] Paired devices list shows all paired devices
- [ ] Unpair button for each device
- [ ] Manual sync button triggers sync
- [ ] Shows last sync time
- [ ] Japandi design consistent with app
- [ ] Responsive layout

---

## 📚 Key References

- [P2P Sync README](../README.md)
- File: `packages/desktop/src/lib/SyncSettings.svelte`

---

## 📝 Implementation Notes

### Progress Log
| Date | Status | Notes |
|------|--------|-------|
| 2024-12-23 | Created | Initial BLI created |

---

## ✅ Definition of Done

- [ ] Component created
- [ ] All UI elements present
- [ ] Tauri commands integrated
- [ ] Visual design matches app
- [ ] Manual testing complete
- [ ] Committed to git
- [ ] BACKLOG.md updated

---

## 🔗 Related BLIs

**Depends On:** P2P-049 through P2P-060  
**Blocks:** P2P-062 (Settings modal integration)  
**Part of:** [P2P-040 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Status:** 🔴 Not Started
