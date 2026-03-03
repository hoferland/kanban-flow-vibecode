# P2P-054: Initialize Encryption Manager

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 5 pts  
**Status:** 🔴 Not Started  
**Dependencies:** P2P-049 (sodiumoxide), P2P-050 (module structure)

---

## 🔄 Documentation Update Requirements

**⚠️ IMPORTANT: Before and After Each Work Session**

### Before Starting:
- Review [P2P Sync README](../README.md#security--encryption)
- Review [Phase 2 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)
- Review [BACKLOG](../BACKLOG.md)

### While Working:
- Update [BACKLOG.md](../BACKLOG.md): 🔴 → 🟡

### After Completion:
- Mark 🟢 Complete in [BACKLOG.md](../BACKLOG.md)
- Commit: `feat(sync): Initialize encryption manager (P2P-054)`

### If Blocked:
- Document sodiumoxide issues
- Update BACKLOG.md

---

## 📋 Description

Initialize libsodium and implement ECDH key pair generation in EncryptionManager. Must:
- Initialize sodiumoxide library
- Generate X25519 key pair (public/private)
- Store keys securely in memory
- Provide public key as base64
- Implement shared key derivation (ECDH)

---

## 🎯 Acceptance Criteria

- [ ] EncryptionManager struct has key pair fields
- [ ] `new()` initializes sodiumoxide and generates keys
- [ ] `get_public_key_base64()` returns base64 public key
- [ ] `derive_shared_key()` implements ECDH
- [ ] Keys stored securely (not logged)
- [ ] Unit tests for key generation
- [ ] Unit tests for key derivation
- [ ] Code compiles without warnings

---

## 📚 Key References

- [P2P Sync README - Encryption](../README.md#security--encryption)
- [sodiumoxide Documentation](https://docs.rs/sodiumoxide/)
- File: `packages/desktop/src-tauri/src/sync/encryption.rs`

---

## 📝 Implementation Notes

### Progress Log
| Date | Status | Notes |
|------|--------|-------|
| 2024-12-23 | Created | Initial BLI created |

---

## ✅ Definition of Done

- [ ] Encryption manager initialized
- [ ] Key pair generation works
- [ ] Public key export works
- [ ] ECDH key derivation works
- [ ] Unit tests pass
- [ ] Committed to git
- [ ] BACKLOG.md updated

---

## 🔗 Related BLIs

**Depends On:** P2P-049, P2P-050  
**Blocks:** P2P-055 (Encrypt/decrypt), P2P-058 (Pairing handler)  
**Part of:** [P2P-040 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Status:** 🔴 Not Started
