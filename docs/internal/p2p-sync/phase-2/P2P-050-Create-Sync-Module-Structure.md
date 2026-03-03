# P2P-050: Create Sync Module Structure

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 2 pts  
**Status:** 🔴 Not Started  
**Dependencies:** P2P-049 (Rust dependencies must be added first)

---

## 🔄 Documentation Update Requirements

**⚠️ IMPORTANT: Before and After Each Work Session**

### Before Starting This BLI:
1. **Read the P2P Sync Documentation:**
   - Review [P2P Sync README](../README.md) - Section: "Phase 2: Desktop P2P Server" 
   - Review [Phase 2 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md) - Architecture section
   - Review [Master BACKLOG](../BACKLOG.md) - Confirm P2P-049 is complete
   - Review [P2P-049](./P2P-049-Add-Rust-Dependencies.md) - Verify dependencies are ready

2. **Understand the Context:**
   - This creates the foundational module structure for all sync code
   - All subsequent sync features will be built on this structure
   - Following Rust module best practices for organization

### While Working:
1. **Track Progress:**
   - Update status in [BACKLOG.md](../BACKLOG.md): 🔴 → 🟡 In Progress
   - Note any structural decisions made
   - Document any deviations from planned structure

### After Completion or Setback:
1. **Update Documentation:**
   - Mark this BLI as 🟢 Complete in [BACKLOG.md](../BACKLOG.md)
   - Check all acceptance criteria below
   - Update [README.md](../README.md) if module structure differs
   - Commit with message: `feat(sync): Create sync module structure (P2P-050)`

2. **If Blocked/Setback:**
   - Document the specific issue in "Issues Encountered" below
   - Update BACKLOG.md with blocker status
   - Consider if Rust compilation issues need dependency fixes

### Documentation Locations:
- **This BLI:** `docs/internal/p2p-sync/phase-2/P2P-050-Create-Sync-Module-Structure.md`
- **README:** `docs/internal/p2p-sync/README.md#phase-2-desktop-p2p-server`
- **BACKLOG:** `docs/internal/p2p-sync/BACKLOG.md` (search for "P2P-050")
- **Epic:** `docs/internal/p2p-sync/phase-2/P2P-040-EPIC-Desktop-P2P-Server.md#architecture`

---

## 📋 Description

Create the complete module structure for the sync functionality in the Rust backend. This includes creating all module files with proper exports and basic structure, preparing the foundation for implementing:
- mDNS service discovery
- WebSocket server
- Pairing management
- Encryption
- Sync protocol handlers
- Message type definitions

This structure follows Rust best practices and separates concerns for maintainability.

---

## 🎯 Acceptance Criteria

- [ ] Directory `src-tauri/src/sync/` created
- [ ] File `src/sync/mod.rs` created with proper module exports
- [ ] File `src/sync/server.rs` created with skeleton structure
- [ ] File `src/sync/discovery.rs` created with skeleton structure
- [ ] File `src/sync/pairing.rs` created with skeleton structure
- [ ] File `src/sync/encryption.rs` created with skeleton structure
- [ ] File `src/sync/types.rs` created with skeleton structure
- [ ] File `src/sync/protocol.rs` created with skeleton structure
- [ ] Sync module declared in `src/lib.rs`
- [ ] Project compiles without errors: `cargo check` succeeds
- [ ] No unused module warnings
- [ ] Git commit created with proper message

---

## 💻 Implementation Guide

### Directory Structure to Create

```
packages/desktop/src-tauri/src/
├── lib.rs                    # (modify - add sync module)
├── main.rs                   # (existing)
├── database/                 # (existing)
│   ├── mod.rs
│   └── schema.rs
└── sync/                     # (NEW - create this)
    ├── mod.rs                # Module exports
    ├── server.rs             # WebSocket server
    ├── discovery.rs          # mDNS service
    ├── pairing.rs            # PIN & pairing logic
    ├── encryption.rs         # Crypto operations
    ├── types.rs              # Message type definitions
    └── protocol.rs           # Sync protocol handlers
```

### Step-by-Step Instructions

#### Step 1: Create Sync Directory

```bash
cd packages/desktop/src-tauri/src
mkdir sync
```

#### Step 2: Create mod.rs (Module Exports)

**File:** `src/sync/mod.rs`

```rust
//! Flow P2P Sync Module
//! 
//! Handles peer-to-peer synchronization between desktop and mobile devices
//! over local networks with end-to-end encryption.

pub mod server;
pub mod discovery;
pub mod pairing;
pub mod encryption;
pub mod types;
pub mod protocol;

// Re-export commonly used types
pub use types::{SyncMessage, PairRequest, SyncRequest};
pub use server::SyncServer;
pub use discovery::DiscoveryService;
pub use pairing::PairingManager;
pub use encryption::EncryptionManager;

/// Sync module version for protocol compatibility
pub const SYNC_VERSION: &str = "1.0.0";

/// Default WebSocket port for sync server
pub const DEFAULT_SYNC_PORT: u16 = 9898;

/// mDNS service type for discovery
pub const MDNS_SERVICE_TYPE: &str = "_flow-kanban._tcp.local";
```

#### Step 3: Create server.rs (WebSocket Server Skeleton)

**File:** `src/sync/server.rs`

```rust
//! WebSocket Server
//! 
//! Handles WebSocket connections from mobile devices for P2P sync.

use tokio::net::TcpListener;
use std::error::Error;

/// WebSocket server for P2P sync
pub struct SyncServer {
    port: u16,
}

impl SyncServer {
    /// Create a new sync server on the specified port
    pub fn new(port: u16) -> Self {
        Self { port }
    }
    
    /// Start the WebSocket server
    /// 
    /// This will listen for connections and handle sync messages.
    pub async fn start(&self) -> Result<(), Box<dyn Error>> {
        let addr = format!("0.0.0.0:{}", self.port);
        let _listener = TcpListener::bind(&addr).await?;
        
        println!("Sync server listening on {}", addr);
        
        // TODO: P2P-056 - Implement connection handling
        
        Ok(())
    }
    
    /// Stop the WebSocket server
    pub async fn stop(&self) -> Result<(), Box<dyn Error>> {
        // TODO: P2P-056 - Implement graceful shutdown
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_server_creation() {
        let server = SyncServer::new(9898);
        assert_eq!(server.port, 9898);
    }
}
```

#### Step 4: Create discovery.rs (mDNS Service Skeleton)

**File:** `src/sync/discovery.rs`

```rust
//! mDNS Service Discovery
//! 
//! Advertises the sync service on the local network for mobile devices to discover.

use std::error::Error;

/// mDNS service for local network discovery
pub struct DiscoveryService {
    service_name: String,
    port: u16,
}

impl DiscoveryService {
    /// Create a new discovery service
    pub fn new(device_name: &str, port: u16) -> Self {
        Self {
            service_name: device_name.to_string(),
            port,
        }
    }
    
    /// Start advertising the service via mDNS
    pub fn advertise(&self, device_id: &str) -> Result<(), Box<dyn Error>> {
        println!("Advertising service: {} on port {}", self.service_name, self.port);
        println!("Device ID: {}", device_id);
        
        // TODO: P2P-051 - Implement mDNS advertisement
        
        Ok(())
    }
    
    /// Stop advertising the service
    pub fn stop(&self) -> Result<(), Box<dyn Error>> {
        // TODO: P2P-051 - Implement mDNS stop
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_discovery_creation() {
        let service = DiscoveryService::new("Test Device", 9898);
        assert_eq!(service.service_name, "Test Device");
        assert_eq!(service.port, 9898);
    }
}
```

#### Step 5: Create pairing.rs (PIN Manager Skeleton)

**File:** `src/sync/pairing.rs`

```rust
//! Pairing Management
//! 
//! Handles PIN generation, validation, and device pairing.

use std::time::{SystemTime, UNIX_EPOCH};

/// Manages device pairing with PIN authentication
pub struct PairingManager {
    active_pin: Option<(String, u64)>, // (PIN, expiry_timestamp)
}

impl PairingManager {
    /// Create a new pairing manager
    pub fn new() -> Self {
        Self { active_pin: None }
    }
    
    /// Generate a new 6-digit PIN
    pub fn generate_pin(&mut self) -> String {
        // TODO: P2P-052 - Implement PIN generation
        "000000".to_string()
    }
    
    /// Validate a PIN
    pub fn validate_pin(&self, pin: &str) -> bool {
        // TODO: P2P-053 - Implement PIN validation
        if let Some((active_pin, expiry)) = &self.active_pin {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            
            now < *expiry && pin == active_pin
        } else {
            false
        }
    }
}

impl Default for PairingManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_pairing_manager_creation() {
        let manager = PairingManager::new();
        assert!(manager.active_pin.is_none());
    }
}
```

#### Step 6: Create encryption.rs (Crypto Manager Skeleton)

**File:** `src/sync/encryption.rs`

```rust
//! Encryption Management
//! 
//! Handles key generation, encryption, and decryption using libsodium.

use std::error::Error;

/// Manages encryption keys and operations
pub struct EncryptionManager {
    // TODO: P2P-054 - Add key pair fields
}

impl EncryptionManager {
    /// Create a new encryption manager and generate key pair
    pub fn new() -> Self {
        // TODO: P2P-054 - Initialize libsodium and generate keys
        Self {}
    }
    
    /// Get the public key as base64
    pub fn get_public_key_base64(&self) -> String {
        // TODO: P2P-054 - Return actual public key
        String::new()
    }
    
    /// Derive a shared key from peer's public key
    pub fn derive_shared_key(&self, _peer_public_key_b64: &str) -> Result<(), Box<dyn Error>> {
        // TODO: P2P-054 - Implement ECDH key derivation
        Ok(())
    }
    
    /// Encrypt a message
    pub fn encrypt(&self, _plaintext: &str) -> Result<(String, String), Box<dyn Error>> {
        // TODO: P2P-055 - Implement encryption
        // Returns (nonce, ciphertext) as base64
        Ok((String::new(), String::new()))
    }
    
    /// Decrypt a message
    pub fn decrypt(&self, _nonce_b64: &str, _ciphertext_b64: &str) -> Result<String, Box<dyn Error>> {
        // TODO: P2P-055 - Implement decryption
        Ok(String::new())
    }
}

impl Default for EncryptionManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_encryption_manager_creation() {
        let _manager = EncryptionManager::new();
        // TODO: Add tests after P2P-054/055
    }
}
```

#### Step 7: Create types.rs (Message Types Skeleton)

**File:** `src/sync/types.rs`

```rust
//! Sync Message Types
//! 
//! Defines all message types used in the sync protocol.

use serde::{Deserialize, Serialize};

/// Base sync message structure
#[derive(Debug, Serialize, Deserialize)]
pub struct SyncMessage {
    #[serde(rename = "type")]
    pub msg_type: String,
    pub message_id: String,
    pub timestamp: i64,
    pub device_id: String,
    pub payload: serde_json::Value,
}

/// Pairing request from mobile device
#[derive(Debug, Serialize, Deserialize)]
pub struct PairRequest {
    pub device_name: String,
    pub device_type: String,
    pub pin: String,
    pub public_key: String,
}

/// Sync request with changes
#[derive(Debug, Serialize, Deserialize)]
pub struct SyncRequest {
    pub last_sync_time: i64,
    pub changes: Vec<Change>,
}

/// Represents a change to sync
#[derive(Debug, Serialize, Deserialize)]
pub struct Change {
    pub entity_type: String,
    pub action: String, // "create", "update", "delete"
    pub entity: Option<serde_json::Value>,
    pub entity_id: Option<String>,
    pub deleted_at: Option<i64>,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_message_serialization() {
        // TODO: P2P-057 - Add serialization tests
    }
}
```

#### Step 8: Create protocol.rs (Protocol Handler Skeleton)

**File:** `src/sync/protocol.rs`

```rust
//! Sync Protocol Handlers
//! 
//! Implements the P2P sync protocol message handlers.

use crate::sync::types::{SyncMessage, Change};
use std::error::Error;

/// Handles sync protocol messages
pub struct ProtocolHandler {
    // TODO: Add database connection, encryption manager, etc.
}

impl ProtocolHandler {
    /// Create a new protocol handler
    pub fn new() -> Self {
        Self {}
    }
    
    /// Handle a pairing request
    pub async fn handle_pair_request(&self, _message: SyncMessage) -> Result<SyncMessage, Box<dyn Error>> {
        // TODO: P2P-058 - Implement pairing handler
        unimplemented!()
    }
    
    /// Handle a sync request
    pub async fn handle_sync_request(&self, _message: SyncMessage) -> Result<SyncMessage, Box<dyn Error>> {
        // TODO: P2P-059 - Implement sync handler
        unimplemented!()
    }
    
    /// Resolve conflicts between client and server versions
    pub fn resolve_conflict(&self, _client_entity: &serde_json::Value, _server_entity: &serde_json::Value) -> serde_json::Value {
        // TODO: P2P-060 - Implement Last-Write-Wins
        serde_json::Value::Null
    }
}

impl Default for ProtocolHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_protocol_handler_creation() {
        let _handler = ProtocolHandler::new();
    }
}
```

#### Step 9: Update lib.rs to Include Sync Module

**File:** `src/lib.rs`

Add this line near the top with other module declarations:

```rust
pub mod sync;
```

### Verification Steps

1. **Check compilation:**
   ```bash
   cd packages/desktop/src-tauri
   cargo check
   ```
   Should succeed with no errors

2. **Run tests:**
   ```bash
   cargo test --lib sync
   ```
   All skeleton tests should pass

3. **Verify structure:**
   ```bash
   tree src/sync
   ```
   Should show all 7 files

---

## 🧪 Testing

### Compilation Test
```bash
cd packages/desktop/src-tauri
cargo check --verbose
```

**Expected:** 
- ✅ Compiles successfully
- ✅ No errors
- ✅ May have warnings about unused code (acceptable for skeletons)

### Module Tests
```bash
cargo test sync:: --lib
```

**Expected:**
- ✅ All skeleton tests pass
- ✅ 6+ tests run successfully

### Verify Module Exports
```bash
cargo doc --no-deps --open
```

**Expected:**
- ✅ Sync module appears in documentation
- ✅ All submodules listed
- ✅ Public API documented

---

## ⚠️ Potential Issues & Solutions

### Issue 1: Compilation Errors

**Symptom:** cargo check fails with errors

**Solution:**
- Verify all files have correct syntax
- Check that mod.rs exports match actual files
- Ensure lib.rs has `pub mod sync;` line

### Issue 2: Unused Code Warnings

**Symptom:** Many warnings about unused structs/functions

**Solution:**
- This is expected for skeleton code
- Can be suppressed with `#[allow(dead_code)]` if needed
- Will be resolved as implementations are added

### Issue 3: Test Failures

**Symptom:** Skeleton tests fail

**Solution:**
- Verify test modules are properly marked with `#[cfg(test)]`
- Check that test assertions match skeleton implementation
- Run `cargo test --lib sync -- --nocapture` for details

---

## 📚 References

- [P2P Sync README - Architecture](../README.md#architecture)
- [Phase 2 Epic - Module Structure](./P2P-040-EPIC-Desktop-P2P-Server.md#module-structure)
- [Rust Module System](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html)
- [P2P-049 Dependencies](./P2P-049-Add-Rust-Dependencies.md)

---

## 📝 Implementation Notes

### Progress Log

| Date | Status | Notes |
|------|--------|-------|
| 2024-12-23 | Created | Initial BLI created |
| _[Add entries during work]_ | | |

### Decisions Made

_[Document any structural decisions]_

Example:
- Separated protocol.rs from server.rs for clearer separation of concerns
- Used skeleton functions with TODO comments for future BLIs

### Issues Encountered

_[Document any problems and solutions]_

### Module Organization Notes

_[Track any changes to planned structure]_

---

## ✅ Definition of Done

This BLI is complete when:
- [ ] All 7 files created in src/sync/
- [ ] mod.rs properly exports all modules
- [ ] lib.rs includes sync module
- [ ] `cargo check` succeeds
- [ ] Skeleton tests pass
- [ ] Changes committed to git
- [ ] BACKLOG.md updated to 🟢 Complete
- [ ] This document updated with implementation notes

---

## 🔗 Related BLIs

**Depends On:** 
- P2P-049: Add Rust dependencies (must be complete)

**Blocks:**
- P2P-051: Implement mDNS (needs discovery.rs)
- P2P-052: PIN generation (needs pairing.rs)
- P2P-054: Encryption manager (needs encryption.rs)
- P2P-056: WebSocket server (needs server.rs)
- P2P-057: Message types (needs types.rs)

**Part of:** [P2P-040 Epic - Desktop P2P Server](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Last Updated:** December 23, 2024  
**Owner:** Flow Development Team  
**Status:** 🔴 Not Started → Ready for Implementation
