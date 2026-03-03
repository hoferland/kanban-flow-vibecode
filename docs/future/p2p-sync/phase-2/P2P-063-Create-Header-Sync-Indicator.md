# P2P-063: Create Sync Status Indicator in Header

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 3 pts  
**Status:** 🔴 Not Started  
**Dependencies:** P2P-065 (sync store)

---

## 🔄 Documentation Update Requirements

**⚠️ IMPORTANT:** Review [P2P Sync README](../README.md) and [BACKLOG](../BACKLOG.md) before starting. Update BACKLOG.md during work. After completion, mark 🟢 and commit: `feat(sync): Add sync indicator to header (P2P-063)`

---

## 📋 Description

Add sync status icon to Header component showing connected/disconnected state with tooltip.

---

## 🎯 Acceptance Criteria

- [ ] Icon in Header showing sync status
- [ ] Green when connected, gray when disconnected
- [ ] Tooltip shows last sync time and paired device count
- [ ] Click opens sync settings
- [ ] Updates reactively from syncStore

---

## 📚 Key References

- File: `packages/desktop/src/lib/Header.svelte`

---

## 🔗 Related BLIs

**Depends On:** P2P-065  
**Part of:** [P2P-040 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Status:** 🔴 Not Started
