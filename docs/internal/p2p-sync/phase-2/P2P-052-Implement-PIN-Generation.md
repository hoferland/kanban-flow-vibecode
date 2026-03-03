# P2P-052: Implement PIN Generation

**Type:** Technical Task  
**Phase:** 2  
**Priority:** 🔴 Critical  
**Story Points:** 3 pts  
**Status:** 🔴 Not Started  
**Dependencies:** P2P-049 (dependencies), P2P-050 (module structure)

---

## 🔄 Documentation Update Requirements

**⚠️ IMPORTANT: Before and After Each Work Session**

### Before Starting This BLI:
1. **Read the P2P Sync Documentation:**
   - Review [P2P Sync README](../README.md#pairing-protocol) - PIN generation section
   - Review [Phase 2 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)
   - Review [Master BACKLOG](../BACKLOG.md) - Confirm P2P-049, P2P-050 complete
   - Review [Security & Encryption](../README.md#security--encryption)

2. **Understand the Context:**
   - 6-digit numeric PIN for user-friendly pairing
   - PIN expires after 5 minutes
   - Thread-safe implementation for concurrent access
   - Cryptographically secure random generation

### While Working:
1. **Track Progress:**
   - Update status in [BACKLOG.md](../BACKLOG.md): 🔴 → 🟡 In Progress
   - Note any security considerations
   - Document random number generation approach

### After Completion or Setback:
1. **Update Documentation:**
   - Mark this BLI as 🟢 Complete in [BACKLOG.md](../BACKLOG.md)
   - Check all acceptance criteria below
   - Commit with message: `feat(sync): Implement PIN generation (P2P-052)`

2. **If Blocked/Setback:**
   - Document any rand crate issues
   - Update BACKLOG.md with blocker status

### Documentation Locations:
- **This BLI:** `docs/internal/p2p-sync/phase-2/P2P-052-Implement-PIN-Generation.md`
- **README:** `docs/internal/p2p-sync/README.md#pairing-protocol`
- **BACKLOG:** `docs/internal/p2p-sync/BACKLOG.md` (search for "P2P-052")

---

## 📋 Description

Implement secure 6-digit PIN generation in the PairingManager. The PIN is used for one-time pairing between desktop and mobile devices. Requirements:
- Generate random 6-digit number (000000-999999)
- Use cryptographically secure random number generator
- Set expiry to 5 minutes from generation
- Store PIN with expiry timestamp
- Allow regeneration if expired

---

## 🎯 Acceptance Criteria

- [ ] `generate_pin()` method fully implemented in `pairing.rs`
- [ ] Returns 6-digit string (e.g., "123456")
- [ ] Uses `rand::thread_rng()` for secure randomness
- [ ] Sets expiry to current time + 300 seconds
- [ ] Stores PIN in `active_pin` field
- [ ] Can be called multiple times (overwrites previous PIN)
- [ ] Unit test: Generates valid 6-digit PIN
- [ ] Unit test: Each call generates different PIN
- [ ] Unit test: PIN stored with expiry timestamp
- [ ] Code compiles without warnings
- [ ] Changes committed to git

---

## 💻 Implementation Guide

### File to Modify

**Location:** `packages/desktop/src-tauri/src/sync/pairing.rs`

### Implementation

Replace the skeleton `generate_pin()` method:

```rust
use rand::Rng;
use std::time::{SystemTime, UNIX_EPOCH};

impl PairingManager {
    // ... existing new() method ...
    
    /// Generate a new 6-digit PIN
    /// 
    /// PIN is valid for 5 minutes from generation.
    /// Calling this method again will invalidate the previous PIN.
    pub fn generate_pin(&mut self) -> String {
        let mut rng = rand::thread_rng();
        
        // Generate 6-digit number (000000-999999)
        let pin_number: u32 = rng.gen_range(0..1_000_000);
        let pin = format!("{:06}", pin_number);
        
        // Calculate expiry: 5 minutes from now
        let expiry = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs() + 300; // 300 seconds = 5 minutes
        
        // Store PIN with expiry
        self.active_pin = Some((pin.clone(), expiry));
        
        println!("Generated PIN: {} (expires in 5 minutes)", pin);
        
        pin
    }
    
    /// Get the current PIN if one is active and not expired
    pub fn get_active_pin(&self) -> Option<String> {
        if let Some((pin, expiry)) = &self.active_pin {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            
            if now < *expiry {
                Some(pin.clone())
            } else {
                None
            }
        } else {
            None
        }
    }
    
    /// Clear the active PIN
    pub fn clear_pin(&mut self) {
        self.active_pin = None;
    }
}
```

### Testing

Add these tests to the `#[cfg(test)]` section:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;
    use std::time::Duration;
    
    #[test]
    fn test_pin_generation() {
        let mut manager = PairingManager::new();
        let pin = manager.generate_pin();
        
        // PIN should be 6 digits
        assert_eq!(pin.len(), 6);
        
        // PIN should be numeric
        assert!(pin.chars().all(|c| c.is_numeric()));
        
        // PIN should be stored
        assert!(manager.active_pin.is_some());
    }
    
    #[test]
    fn test_pin_randomness() {
        let mut manager = PairingManager::new();
        
        // Generate multiple PINs
        let pin1 = manager.generate_pin();
        thread::sleep(Duration::from_millis(10));
        let pin2 = manager.generate_pin();
        thread::sleep(Duration::from_millis(10));
        let pin3 = manager.generate_pin();
        
        // They should be different (very high probability)
        assert!(pin1 != pin2 || pin2 != pin3);
    }
    
    #[test]
    fn test_pin_expiry_stored() {
        let mut manager = PairingManager::new();
        manager.generate_pin();
        
        if let Some((_, expiry)) = manager.active_pin {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            
            // Expiry should be in the future
            assert!(expiry > now);
            
            // Expiry should be ~5 minutes from now (290-310 seconds)
            let diff = expiry - now;
            assert!(diff >= 290 && diff <= 310);
        } else {
            panic!("PIN not stored");
        }
    }
    
    #[test]
    fn test_get_active_pin() {
        let mut manager = PairingManager::new();
        
        // No PIN initially
        assert!(manager.get_active_pin().is_none());
        
        // Generate PIN
        let pin = manager.generate_pin();
        
        // Should retrieve same PIN
        assert_eq!(manager.get_active_pin(), Some(pin));
    }
    
    #[test]
    fn test_clear_pin() {
        let mut manager = PairingManager::new();
        manager.generate_pin();
        
        assert!(manager.active_pin.is_some());
        
        manager.clear_pin();
        
        assert!(manager.active_pin.is_none());
    }
    
    #[test]
    fn test_pin_regeneration() {
        let mut manager = PairingManager::new();
        
        let pin1 = manager.generate_pin();
        thread::sleep(Duration::from_millis(10));
        let pin2 = manager.generate_pin();
        
        // New PIN should overwrite old one
        assert_eq!(manager.get_active_pin(), Some(pin2));
    }
}
```

---

## ⚠️ Potential Issues & Solutions

### Issue 1: Non-Cryptographic Random

**Symptom:** Using `rand::random()` instead of `thread_rng()`

**Solution:**
- Always use `rand::thread_rng()` for security
- This ensures cryptographically secure randomness

### Issue 2: Leading Zeros Lost

**Symptom:** PIN "000123" displays as "123"

**Solution:**
- Use `format!("{:06}", number)` to pad with zeros
- Ensures all PINs are exactly 6 characters

### Issue 3: Time Went Backwards

**Symptom:** Panic in SystemTime::duration_since

**Solution:**
- Use `.expect()` or `.unwrap_or_default()` for robustness
- This is extremely rare but good to handle

---

## 📚 References

- [P2P Sync README - Pairing Protocol](../README.md#pairing-protocol)
- [Rust rand Crate](https://docs.rs/rand/latest/rand/)
- [P2P-050 Module Structure](./P2P-050-Create-Sync-Module-Structure.md)
- [P2P-053 PIN Validation](./P2P-053-Implement-PIN-Validation.md) (next BLI)

---

## 📝 Implementation Notes

### Progress Log

| Date | Status | Notes |
|------|--------|-------|
| 2024-12-23 | Created | Initial BLI created |

### Decisions Made

_[Document any implementation decisions]_

### Issues Encountered

_[Document any problems and solutions]_

---

## ✅ Definition of Done

- [ ] generate_pin() implemented
- [ ] get_active_pin() implemented
- [ ] clear_pin() implemented
- [ ] All 6 unit tests pass
- [ ] `cargo check` succeeds
- [ ] No warnings
- [ ] Committed to git
- [ ] BACKLOG.md updated to 🟢
- [ ] This document updated

---

## 🔗 Related BLIs

**Depends On:** 
- P2P-049: Dependencies (rand crate)
- P2P-050: Module structure

**Blocks:**
- P2P-053: PIN validation (uses generated PIN)
- P2P-042: Display PIN in UI (shows generated PIN)
- P2P-058: Pairing handler (validates PIN)

**Part of:** [P2P-040 Epic](./P2P-040-EPIC-Desktop-P2P-Server.md)

---

**Created:** December 23, 2024  
**Owner:** Flow Development Team  
**Status:** 🔴 Not Started
