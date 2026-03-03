# P2P-040: [EPIC] Desktop P2P Sync Server

**Type:** Epic  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 144 pts  
**Status:** 🔴 Not Started  
**Target Version:** v0.4.0  
**Dependencies:** Phase 0 complete ✅, Phase 1 complete ✅

---

## 📋 Epic Description

Enable the Flow desktop application to act as a P2P sync server, allowing mobile devices to discover, pair with, and sync data over the local network. This maintains Flow's privacy-first philosophy with end-to-end encryption and no cloud services.

---

## 🎯 Goals

1. **Discovery:** Desktop advertises sync service via mDNS on local network
2. **Pairing:** Secure 6-digit PIN-based pairing with mobile devices
3. **Communication:** WebSocket server for bidirectional messaging
4. **Encryption:** End-to-end encryption using libsodium
5. **Sync:** Handle sync requests with conflict resolution
6. **UI:** User-friendly desktop interface for sync management

---

## 👥 User Stories (8 stories)

1. **P2P-041:** Enable/disable sync mode
2. **P2P-042:** View 6-digit pairing PIN
3. **P2P-043:** View paired devices list
4. **P2P-044:** Unpair devices
5. **P2P-045:** Manual sync trigger
6. **P2P-046:** View sync status
7. **P2P-047:** Receive mobile changes
8. **P2P-048:** Automatic conflict resolution

---

## 🔧 Technical Tasks (24 tasks)

### Week 1: Foundation & Discovery (7 tasks - 26 pts)
- P2P-049: Add dependencies
- P2P-050: Create module structure
- P2P-051: mDNS advertisement
- P2P-052: PIN generation
- P2P-053: PIN validation
- P2P-054: Encryption manager init
- P2P-055: Encrypt/decrypt functions

### Week 2: WebSocket & Protocol (5 tasks - 34 pts)
- P2P-056: WebSocket server
- P2P-057: Message type definitions
- P2P-058: Pairing handler
- P2P-059: Sync request handler
- P2P-060: Conflict resolution

### Week 3: Desktop UI (5 tasks - 21 pts)
- P2P-061: SyncSettings component
- P2P-062: Settings modal integration
- P2P-063: Header sync indicator
- P2P-064: Tauri commands
- P2P-065: State management

### Week 4: Testing (4 tasks - 8 pts)
- P2P-066: PIN unit tests
- P2P-067: Encryption unit tests
- P2P-068: Integration tests
- P2P-069: Manual testing

---

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] Desktop can enable/disable sync mode via UI
- [ ] When enabled, 6-digit PIN is generated and displayed
- [ ] Desktop advertises service via mDNS (_flow-kanban._tcp.local)
- [ ] Mobile devices can discover desktop on network
- [ ] Pairing succeeds with correct PIN within 5 minutes
- [ ] Pairing fails with incorrect PIN
- [ ] WebSocket server accepts connections on port 9898
- [ ] All messages are encrypted with libsodium
- [ ] Pairing information persists in database
- [ ] Sync requests are processed correctly
- [ ] Conflicts are resolved using Last-Write-Wins
- [ ] Desktop UI shows sync status (connected/disconnected)
- [ ] Desktop UI shows paired devices list
- [ ] Manual sync button triggers sync
- [ ] Changes from mobile appear on desktop in real-time

### Non-Functional Requirements
- [ ] Sync completes in < 5s for 100 changes
- [ ] Supports 3+ concurrent mobile connections
- [ ] < 50MB memory usage for sync process
- [ ] No data loss in any scenario
- [ ] Graceful handling of network interruptions
- [ ] Clear error messages for users

### Technical Requirements
- [ ] Unit test coverage > 80%
- [ ] Integration tests cover happy path + 3 error scenarios
- [ ] Code follows Rust best practices
- [ ] No compiler warnings
- [ ] Documentation updated
- [ ] Security review passed

---

## 🏗️ Architecture

### Module Structure
```
src-tauri/src/sync/
├── mod.rs              # Module exports
├── server.rs           # WebSocket server
├── discovery.rs        # mDNS service
├── pairing.rs          # PIN & pairing logic
├── encryption.rs       # Crypto operations
├── types.rs            # Message types
└── protocol.rs         # Sync protocol handlers
```

### Key Components

**DiscoveryService:**
- Advertises mDNS service
- Includes device metadata in TXT records
- Lifecycle management (start/stop)

**WebSocketServer:**
- Listens on port 9898
- Accepts concurrent connections
- Routes messages by type
- Handles disconnections

**PairingManager:**
- Generates 6-digit PINs
- Validates PINs with expiry
- Manages paired devices

**EncryptionManager:**
- Key pair generation (ECDH)
- Shared secret derivation
- Encrypt/decrypt operations

**SyncProtocol:**
- Handles PAIR_REQUEST/RESPONSE
- Handles SYNC_REQUEST/RESPONSE
- Conflict resolution
- Database integration

---

## 📦 Dependencies

### New Rust Crates
```toml
[dependencies]
tokio = { version = "1.35", features = ["full"] }
tokio-tungstenite = "0.21"
mdns = "3.0"
sodiumoxide = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
futures = "0.3"
base64 = "0.21"
sha2 = "0.10"
rand = "0.8"
```

### Existing Dependencies (Used)
- rusqlite: Database operations
- uuid: Device ID generation
- chrono: Timestamp handling
- tauri: Frontend communication

---

## 🧪 Testing Strategy

### Unit Tests (15+ tests)
- PIN generation produces valid 6-digit numbers
- PIN validation works correctly
- PIN expiry after 5 minutes
- Encryption/decryption round-trip
- Conflict resolution scenarios
- Message serialization/deserialization

### Integration Tests (8+ tests)
- WebSocket server startup/shutdown
- mDNS service lifecycle
- Mock client connection
- Pairing flow end-to-end
- Sync message processing
- Multiple concurrent connections

### Manual Testing
- Test on macOS
- Test with iOS simulator
- Test network scenarios
- Test firewall configurations

---

## 🚧 Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| mDNS not working on all networks | High | Medium | Fallback: Manual IP entry |
| WebSocket performance issues | Medium | Low | Use tokio async runtime |
| Encryption overhead | Low | Low | libsodium is optimized |
| Complex state management | Medium | Medium | Careful Rust lifetimes |
| Firewall blocking port 9898 | High | Medium | Document port requirements |

---

## 📚 References

- [P2P Sync README](../README.md) - Complete implementation guide
- [Sync Protocol Specification](../README.md#sync-protocol) - Message formats
- [Security & Encryption](../README.md#security--encryption) - Crypto details
- [Desktop Database Schema](../../desktop/src-tauri/src/database/schema.sql)

---

## 🎯 Success Metrics

- [ ] All 32 BLIs completed
- [ ] 100% of acceptance criteria met
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] No critical bugs
- [ ] Ready for Phase 3 (Mobile P2P)

---

**Created:** December 23, 2024  
**Owner:** Flow Development Team  
**Status:** 🔴 Ready to Start
