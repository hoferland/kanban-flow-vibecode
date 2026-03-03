# P2P-051: Implement mDNS Service Advertisement

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 8 pts  
**Status:** 🔴 Not Started  
**Dependencies:** P2P-049 (dependencies), P2P-050 (module structure)

---

## 🔄 Documentation Update Requirements

**⚠️ IMPORTANT: Before and After Each Work Session**

### Before Starting This BLI:
1. **Read the P2P Sync Documentation:**
   - Review [P2P Sync README](../README.md#phase-2-desktop-p2p-server) - mDNS section
   - Review [Phase 2 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md#discoveryservice)
   - Review [Master BACKLOG](../BACKLOG.md) - Confirm P2P-049, P2P-050 complete
   - Review [Network Architecture](../README.md#network-architecture)

2. **Understand the Context:**
   - mDNS enables mobile devices to discover desktop on local network
   - Service type: `_flow-kanban._tcp.local`
   - TXT records include device metadata
   - Critical for zero-configuration setup

### While Working:
1. **Track Progress:**
   - Update status in [BACKLOG.md](../BACKLOG.md): 🔴 → 🟡 In Progress
   - Note any mDNS library issues
   - Document port and service name decisions

### After Completion or Setback:
1. **Update Documentation:**
   - Mark this BLI as 🟢 Complete in [BACKLOG.md](../BACKLOG.md)
   - Check all acceptance criteria below
   - Update [README.md](../README.md) if implementation differs
   - Commit with message: `feat(sync): Implement mDNS service advertisement (P2P-051)`

2. **If Blocked/Setback:**
   - Document mDNS-specific issues (network permissions, firewall, etc.)
   - Check macOS mDNSResponder service status
   - Update BACKLOG.md with blocker details

### Documentation Locations:
- **This BLI:** `docs/internal/p2p-sync/phase-2/P2P-051-Implement-mDNS-Service.md`
- **README:** `docs/internal/p2p-sync/README.md#network-architecture`
- **BACKLOG:** `docs/internal/p2p-sync/BACKLOG.md` (search for "P2P-051")
- **Epic:** `docs/internal/p2p-sync/phase-2/P2P-040-EPIC-Desktop-P2P-Server.md`

---

## 📋 Description

Implement mDNS (Multicast DNS) service advertisement to enable mobile devices to automatically discover the desktop sync server on the local network. The service will broadcast:
- Service type: `_flow-kanban._tcp.local`
- Device name (e.g., "John's MacBook")
- Device ID (unique identifier)
- Port number (9898)
- Protocol version

This enables zero-configuration networking - users don't need to manually enter IP addresses.

---

## 🎯 Acceptance Criteria

- [ ] DiscoveryService in `discovery.rs` fully implemented
- [ ] Service advertises on local network using mdns crate
- [ ] Service type is `_flow-kanban._tcp.local`
- [ ] TXT records include: `device_name`, `device_id`, `version`, `port`
- [ ] Service starts successfully when called
- [ ] Service stops cleanly when called
- [ ] Can be discovered by iOS device using dns-sd or Bonjour Browser
- [ ] Error handling for network issues
- [ ] Logs service status (started/stopped)
- [ ] Unit tests for service creation
- [ ] Integration test with mock discovery client
- [ ] Manual test: `dns-sd -B _flow-kanban._tcp` shows service

---

## 💻 Implementation Guide

### File to Modify

**Location:** `packages/desktop/src-tauri/src/sync/discovery.rs`

### Complete Implementation

Replace the skeleton in `discovery.rs` with:

```rust
//! mDNS Service Discovery
//! 
//! Advertises the sync service on the local network for mobile devices to discover.

use mdns::{Responder, Record};
use std::error::Error;
use std::net::IpAddr;
use std::sync::{Arc, Mutex};
use std::thread;

/// mDNS service for local network discovery
pub struct DiscoveryService {
    service_name: String,
    port: u16,
    responder: Arc<Mutex<Option<thread::JoinHandle<()>>>>,
}

impl DiscoveryService {
    /// Create a new discovery service
    pub fn new(device_name: &str, port: u16) -> Self {
        Self {
            service_name: device_name.to_string(),
            port,
            responder: Arc::new(Mutex::new(None)),
        }
    }
    
    /// Start advertising the service via mDNS
    /// 
    /// Advertises _flow-kanban._tcp.local with TXT records containing:
    /// - device_name: Human-readable device name
    /// - device_id: Unique device identifier
    /// - version: Protocol version (1.0.0)
    /// - port: WebSocket server port
    pub fn advertise(&self, device_id: &str, version: &str) -> Result<(), Box<dyn Error>> {
        let service_name = self.service_name.clone();
        let port = self.port;
        let device_id = device_id.to_string();
        let version = version.to_string();
        
        println!("Starting mDNS advertisement:");
        println!("  Service: _flow-kanban._tcp.local");
        println!("  Name: {}", service_name);
        println!("  Device ID: {}", device_id);
        println!("  Port: {}", port);
        println!("  Version: {}", version);
        
        // Start responder in separate thread
        let handle = thread::spawn(move || {
            if let Err(e) = Self::run_responder(&service_name, port, &device_id, &version) {
                eprintln!("mDNS responder error: {}", e);
            }
        });
        
        *self.responder.lock().unwrap() = Some(handle);
        
        Ok(())
    }
    
    /// Stop advertising the service
    pub fn stop(&self) -> Result<(), Box<dyn Error>> {
        println!("Stopping mDNS advertisement");
        
        // Take the handle and wait for thread to finish
        if let Some(handle) = self.responder.lock().unwrap().take() {
            // Thread will stop when dropped
            drop(handle);
        }
        
        Ok(())
    }
    
    /// Internal: Run the mDNS responder
    fn run_responder(
        service_name: &str,
        port: u16,
        device_id: &str,
        version: &str,
    ) -> Result<(), Box<dyn Error>> {
        let responder = Responder::new()?;
        let service_type = "_flow-kanban._tcp.local";
        
        // Create TXT records with metadata
        let txt_records = vec![
            format!("version={}", version),
            format!("device_name={}", service_name),
            format!("device_id={}", device_id),
            format!("port={}", port),
        ];
        
        // Register service
        let _service = responder.register(
            service_type.to_owned(),
            service_name.to_owned(),
            port,
            &txt_records,
        );
        
        // Keep responder alive
        loop {
            thread::sleep(std::time::Duration::from_secs(1));
        }
    }
}

impl Drop for DiscoveryService {
    fn drop(&mut self) {
        let _ = self.stop();
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
    
    #[test]
    fn test_discovery_lifecycle() {
        let service = DiscoveryService::new("Test", 9999);
        
        // Start service
        let result = service.advertise("test-device-123", "1.0.0");
        assert!(result.is_ok());
        
        // Stop service
        let result = service.stop();
        assert!(result.is_ok());
    }
}
```

### Testing the Implementation

#### Test 1: Verify Service Advertisement (macOS)

```bash
# In one terminal, run the desktop app (once implemented)
cd packages/desktop
npm run tauri dev

# In another terminal, check for mDNS service
dns-sd -B _flow-kanban._tcp

# Should show: 
# Browsing for _flow-kanban._tcp
# Timestamp A/R Flags if Domain Service Type Instance Name
# 11:40:30 Add     2   0 local. _flow-kanban._tcp. John's MacBook
```

#### Test 2: Verify TXT Records

```bash
# Get full service info including TXT records
dns-sd -L "John's MacBook" _flow-kanban._tcp local

# Should show:
# device_name=John's MacBook
# device_id=desktop-abc-123
# version=1.0.0
# port=9898
```

#### Test 3: Use Bonjour Browser (Optional)

- Download Bonjour Browser app for macOS
- Look for _flow-kanban._tcp services
- Verify metadata is correct

---

## ⚠️ Potential Issues & Solutions

### Issue 1: Service Not Advertising

**Symptom:** `dns-sd -B` doesn't show service

**Solutions:**
1. Check firewall settings (allow mDNS port 5353)
2. Verify network connection (must be on WiFi, not ethernet in some cases)
3. Check macOS mDNSResponder is running:
   ```bash
   sudo launchctl list | grep mDNSResponder
   ```
4. Restart mDNSResponder if needed:
   ```bash
   sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.mDNSResponder.plist
   sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.mDNSResponder.plist
   ```

### Issue 2: mdns Crate Compilation Issues

**Symptom:** Build fails with mdns errors

**Solutions:**
- Verify mdns version is 3.0 in Cargo.toml
- Check for platform-specific issues (mDNS works differently on Linux/Windows)
- Consider alternative: mdns-sd crate if needed

### Issue 3: Thread Panics

**Symptom:** mDNS responder thread crashes

**Solutions:**
- Add proper error handling in run_responder
- Log errors instead of panicking
- Implement reconnection logic

### Issue 4: Port Already in Use

**Symptom:** Error binding to port 9898

**Solutions:**
- Check if another Flow instance is running
- Allow configurable port in future
- Add port availability check before starting

---

## 📚 References

- [P2P Sync README - Network Architecture](../README.md#network-architecture)
- [mDNS RFC 6762](https://datatracker.ietf.org/doc/html/rfc6762)
- [mdns Rust Crate](https://docs.rs/mdns/latest/mdns/)
- [Bonjour Service Discovery](https://developer.apple.com/bonjour/)
- [P2P-050 Module Structure](./P2P-050-Create-Sync-Module-Structure.md)

---

## 📝 Implementation Notes

### Progress Log

| Date | Status | Notes |
|------|--------|-------|
| 2024-12-23 | Created | Initial BLI created |
| _[Add entries during work]_ | | |

### Decisions Made

_[Document any implementation decisions]_

Example:
- Used thread-based responder instead of async (mdns crate limitation)
- Chose port 9898 as default (no conflicts with common services)
- TXT records include all metadata needed for pairing

### Issues Encountered

_[Document any problems and solutions]_

### Network Testing Notes

_[Document results from different network configurations]_

| Network Type | Works? | Notes |
|--------------|--------|-------|
| Home WiFi | ? | |
| Corporate WiFi | ? | May block mDNS |
| Hotspot | ? | |

---

## ✅ Definition of Done

This BLI is complete when:
- [ ] discovery.rs fully implemented
- [ ] Service advertises correctly
- [ ] TXT records include all metadata
- [ ] Lifecycle methods (start/stop) work
- [ ] Unit tests pass
- [ ] `dns-sd` command shows service
- [ ] Changes committed to git
- [ ] BACKLOG.md updated to 🟢 Complete
- [ ] This document updated with testing results

---

## 🔗 Related BLIs

**Depends On:** 
- P2P-049: Add Rust dependencies (mdns crate)
- P2P-050: Create sync module structure (discovery.rs file)

**Blocks:**
- P2P-056: WebSocket server (needs service advertising for discovery)
- P2P-064: Tauri commands (will call advertise/stop methods)

**Related:**
- P2P-079: Mobile discovery service (Phase 3 - will discover this service)

**Part of:** [P2P-040 Epic - Desktop P2P Server](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Last Updated:** December 23, 2024  
**Owner:** Flow Development Team  
**Status:** 🔴 Not Started → Ready for Implementation
