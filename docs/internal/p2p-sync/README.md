# Flow P2P Sync - Complete Implementation Guide

**Version:** 1.0  
**Last Updated:** December 23, 2024  
**Status:** 🟢 Ready for Phase 2 Implementation  
**Epic Owner:** Flow Development Team

> **Single Source of Truth** - This document contains everything a developer needs to understand and implement P2P sync for Flow Kanban. All information is current and reflects the actual implementation state.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Current Status](#current-status)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [Sync Protocol](#sync-protocol)
7. [Security & Encryption](#security--encryption)
8. [Phase 2: Desktop P2P Server](#phase-2-desktop-p2p-server)
9. [Phase 3: Mobile P2P Client](#phase-3-mobile-p2p-client)
10. [Phase 4: Attachment Sync](#phase-4-attachment-sync)
11. [Testing Strategy](#testing-strategy)
12. [Troubleshooting](#troubleshooting)
13. [FAQs](#faqs)
14. [References](#references)

---

## 🚀 Quick Start

### For New Developers

**Get up to speed in 5 minutes:**

1. **Understand the Goal**
   - Enable Flow desktop and mobile apps to sync data peer-to-peer over local network
   - No cloud services, no third-party dependencies
   - End-to-end encrypted, privacy-first

2. **Check Prerequisites**
   ```bash
   # Desktop already complete (Phase 0)
   ✅ SQLite database with sync schema
   ✅ Device ID generation
   ✅ Tombstone tracking
   
   # Mobile already complete (Phase 1)
   ✅ SQLite database with same schema
   ✅ Device ID tracking
   ✅ React Native app with full UI
   ```

3. **What's Next: Phase 2**
   - Implement WebSocket server in Rust (desktop)
   - Add mDNS service discovery
   - Create encryption layer with libsodium
   - Build pairing protocol with 6-digit PIN
   - Create sync message handlers

4. **Start Coding**
   ```bash
   cd packages/desktop/src-tauri
   
   # Add dependencies to Cargo.toml
   # See "Phase 2 Implementation" section below
   
   # Create sync module
   mkdir src/sync
   touch src/sync/mod.rs
   ```

---

## 📖 Project Overview

### What is Flow P2P Sync?

Flow is expanding from a desktop-only Kanban application to include mobile support with peer-to-peer data synchronization. This maintains Flow's core philosophy: **local-first, privacy-focused, and no third-party dependencies**.

### Why P2P Sync?

1. **Privacy** - Data never leaves user's devices
2. **No Cost** - No cloud services to pay for
3. **User Control** - Users own their data completely
4. **Simple Setup** - Works on local network automatically
5. **Fast** - Direct device-to-device communication

### Key Design Principles

- ✅ **Offline-First** - Both apps work without sync
- ✅ **Local Network** - Sync only on same WiFi (mDNS)
- ✅ **Encrypted** - End-to-end encryption (libsodium)
- ✅ **Conflict Resolution** - Automatic (Last-Write-Wins)
- ✅ **Optional** - Sync is opt-in, not required

### Success Criteria

1. **Functionality:** Reliable bidirectional sync of all data
2. **Privacy:** Zero external data sharing, E2E encryption
3. **Performance:** Sync completes < 5s for typical dataset
4. **Reliability:** No data loss, graceful error handling
5. **UX:** Simple pairing (6-digit PIN), automatic sync

---

## 📊 Current Status

### Phase 0: Desktop SQLite Migration ✅ **COMPLETE**

**Completed:** December 18, 2024  
**Version:** v0.3.0

| Component | Status |
|-----------|--------|
| SQLite database with sync schema | ✅ Complete |
| Device ID generation | ✅ Complete |
| Tombstone tracking | ✅ Complete |
| All CRUD operations refactored | ✅ Complete |
| Rust backend ready | ✅ Complete |

**Key Files:**
- `packages/desktop/src-tauri/src/database/schema.sql` - Complete schema
- `packages/desktop/src-tauri/src/database/mod.rs` - Database operations
- `packages/desktop/src-tauri/src/lib.rs` - Tauri commands

### Phase 1: Mobile App Foundation ✅ **COMPLETE**

**Completed:** December 18, 2024  
**Version:** v1.0.0-alpha

| Component | Status |
|-----------|--------|
| React Native app structure | ✅ Complete |
| SQLite database (same schema) | ✅ Complete |
| All screens (Board, Card Detail, Settings) | ✅ Complete |
| DatePicker component | ✅ Complete |
| Settings/Configuration | ✅ Complete |
| Navigation & UI components | ✅ Complete |
| Japandi design system | ✅ Complete |

**Known Limitations:**
- ⚠️ Filtering UI not implemented (deferred to v1.1)
- ⚠️ Attachment upload not implemented (Phase 4)

**Key Files:**
- `packages/mobile/src/services/database.ts` - SQLite wrapper (950+ lines)
- `packages/mobile/src/screens/BoardScreen.tsx` - Main kanban view
- `packages/mobile/src/screens/CardDetailScreen.tsx` - Card editing
- `packages/mobile/src/screens/SettingsScreen.tsx` - Configuration (740+ lines)
- `packages/mobile/src/components/DatePicker.tsx` - Date selection (490+ lines)

### Phase 2: Desktop P2P Server 🔴 **NOT STARTED**

**Status:** Ready to implement  
**Estimated Duration:** 3-4 weeks  
**Target Version:** v0.4.0

**Objective:** Enable desktop to act as sync server for mobile devices.

**What Needs Building:**
- [ ] mDNS service advertisement
- [ ] WebSocket server in Rust
- [ ] Encryption layer (libsodium)
- [ ] Pairing protocol (6-digit PIN)
- [ ] Sync message handlers
- [ ] Desktop sync UI

### Phase 3: Mobile P2P Client 🔴 **NOT STARTED**

**Status:** Waiting for Phase 2  
**Estimated Duration:** 3-4 weeks  
**Target Version:** v1.0.0-beta

**Objective:** Enable mobile to discover and sync with desktop.

**What Needs Building:**
- [ ] mDNS discovery (react-native-zeroconf)
- [ ] WebSocket client
- [ ] Encryption layer (react-native-sodium)
- [ ] Pairing flow UI
- [ ] Sync service
- [ ] Mobile sync UI

### Phase 4: Attachment Sync 🔴 **NOT STARTED**

**Status:** Waiting for Phase 2-3  
**Estimated Duration:** 2-3 weeks  
**Target Version:** v1.1.0

**Objective:** Sync file attachments between devices.

**What Needs Building:**
- [ ] Chunked file transfer
- [ ] Hash-based deduplication
- [ ] On-demand download
- [ ] Progress tracking
- [ ] Mobile file picker integration

### Timeline Overview

```
Now             Week 4          Week 8          Week 11         Week 14
 │                │                │                │                │
 ├─ Phase 2 ─────┤                │                │                │
 │  (Desktop P2P) │                │                │                │
 │                ├─ Phase 3 ──────┤                │                │
 │                │  (Mobile P2P)  │                │                │
 │                │                ├─ Phase 4 ──────┤                │
 │                │                │  (Attachments) │                │
 │                │                │                ├─ Phase 5 ──────┤
 │                │                │                │  (Polish)      │
 └────────────────┴────────────────┴────────────────┴────────────────┘
                                                                v1.0 🚀
```

**Total Time to Full P2P Sync:** 10-13 weeks

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Flow Ecosystem                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │  Desktop App    │              │   Mobile App    │      │
│  │  (Tauri/Svelte) │◄────P2P─────►│ (React Native)  │      │
│  │                 │   Encrypted  │                 │      │
│  │                 │   WebSocket  │                 │      │
│  └────────┬────────┘              └────────┬────────┘      │
│           │                                 │              │
│  ┌────────▼────────┐              ┌────────▼────────┐      │
│  │  SQLite DB      │              │   SQLite DB     │      │
│  │  (Desktop)      │              │   (Mobile)      │      │
│  │                 │              │                 │      │
│  │  • cards        │              │  • cards        │      │
│  │  • columns      │              │  • columns      │      │
│  │  • attributes   │              │  • attributes   │      │
│  │  • attachments  │              │  • attachments  │      │
│  │  • tombstones   │              │  • tombstones   │      │
│  │  • sync_meta    │              │  • sync_meta    │      │
│  └─────────────────┘              └─────────────────┘      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Shared Business Logic Layer                │  │
│  │  (packages/shared - JavaScript)                      │  │
│  │  - Models: Card, Attachment, Column                  │  │
│  │  - Utils: Date, Validation                           │  │
│  │  - Theme: Japandi Design Tokens                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Desktop (Tauri + Rust)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **UI Framework** | Svelte | 4.x | Reactive UI |
| **Backend** | Rust | 1.75+ | Native operations |
| **Database** | SQLite | Latest | Via rusqlite |
| **WebSocket** | tokio-tungstenite | 0.21+ | P2P communication |
| **Encryption** | libsodium-sys | 0.2+ | Cryptography |
| **Discovery** | mdns | 3.0+ | Service discovery |
| **Async Runtime** | tokio | 1.35+ | Async operations |

#### Mobile (React Native + TypeScript)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React Native | 0.73+ | Cross-platform |
| **Language** | TypeScript | 5.x | Type safety |
| **Database** | react-native-sqlite-storage | 6.0+ | Local storage |
| **WebSocket** | Built-in | - | P2P communication |
| **Encryption** | react-native-sodium | 0.3+ | Cryptography |
| **Discovery** | react-native-zeroconf | 11.x | mDNS/Bonjour |
| **Navigation** | React Navigation | 6.x | Screen routing |

#### Shared (JavaScript/ES Modules)

| Component | Purpose |
|-----------|---------|
| **Models** | Card, Column, Attribute classes |
| **Utils** | Date formatting, validation |
| **Theme** | Japandi design tokens |
| **Constants** | Shared enums, configs |

### Data Flow

```
USER ACTION (Create/Update/Delete Card)
    ↓
UI COMPONENT (React Native / Svelte)
    ↓
VALIDATION (Shared business logic)
    ↓
STORAGE LAYER (SQLite)
    ├─> Write to database
    ├─> Update timestamps (updatedAt)
    ├─> Track device (deviceId)
    └─> Mark as needs sync (syncedAt = 0)
    ↓
SYNC LAYER (when connection available)
    ├─> Detect changes since last sync
    ├─> Encrypt payload (libsodium)
    ├─> Send via WebSocket
    └─> Wait for acknowledgment
    ↓
PEER DEVICE
    ├─> Decrypt payload
    ├─> Resolve conflicts (LWW)
    ├─> Write to local database
    ├─> Update syncedAt timestamp
    └─> Send acknowledgment
```

### Network Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Local Network                        │
│                   (192.168.1.0/24)                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐                                    │
│  │   Desktop       │                                    │
│  │  (Server)       │                                    │
│  │                 │                                    │
│  │  1. Advertise   │                                    │
│  │     via mDNS    │                                    │
│  │     _flow-kanban│                                    │
│  │     ._tcp        │                                    │
│  │                 │                                    │
│  │  2. Listen      │                                    │
│  │     WebSocket   │                                    │
│  │     Port: 9898  │                                    │
│  └────────┬────────┘                                    │
│           │                                              │
│           │ ┌────────────────────┐                      │
│           │ │  mDNS Discovery    │                      │
│           │ │  Service Info:     │                      │
│           │ │  - device_name     │                      │
│           │ │  - device_id       │                      │
│           │ │  - version         │                      │
│           │ │  - port            │                      │
│           │ └────────────────────┘                      │
│           │                                              │
│           │ Encrypted WebSocket (TLS-like)              │
│           │ ↓                                            │
│  ┌────────▼────────┐                                    │
│  │   Mobile        │                                    │
│  │  (Client)       │                                    │
│  │                 │                                    │
│  │  1. Discover    │                                    │
│  │     services    │                                    │
│  │                 │                                    │
│  │  2. Connect     │                                    │
│  │     WebSocket   │                                    │
│  │                 │                                    │
│  │  3. Pair with   │                                    │
│  │     6-digit PIN │                                    │
│  └─────────────────┘                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

Both desktop and mobile use **identical SQLite schemas** to ensure sync compatibility.

### Core Tables

#### cards

```sql
CREATE TABLE cards (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  type TEXT,
  notes TEXT DEFAULT '',
  column TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  dueDate INTEGER,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  syncedAt INTEGER DEFAULT 0,      -- Last sync timestamp
  deviceId TEXT                     -- Device that created/modified
);

CREATE INDEX idx_cards_column ON cards(column);
CREATE INDEX idx_cards_area ON cards(area);
CREATE INDEX idx_cards_type ON cards(type);
CREATE INDEX idx_cards_updated ON cards(updatedAt);
CREATE INDEX idx_cards_synced ON cards(syncedAt);
```

**Sync Fields:**
- `updatedAt` - When card was last modified (for conflict resolution)
- `syncedAt` - When card was last synced (0 = needs sync)
- `deviceId` - Which device last modified (for conflict tiebreaker)

#### columns

```sql
CREATE TABLE columns (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  wipLimit INTEGER,
  color TEXT,
  isActive INTEGER DEFAULT 1,      -- Soft delete flag
  updatedAt INTEGER NOT NULL
);

CREATE INDEX idx_columns_position ON columns(position);
```

#### attributes

```sql
CREATE TABLE attributes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,              -- 'area' or 'type'
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT,
  isActive INTEGER DEFAULT 1,      -- Soft delete flag
  updatedAt INTEGER NOT NULL
);

CREATE INDEX idx_attributes_type ON attributes(type);
CREATE INDEX idx_attributes_position ON attributes(position);
```

#### attachments

```sql
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  cardId INTEGER NOT NULL,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  size INTEGER NOT NULL,
  mimeType TEXT NOT NULL,
  hash TEXT NOT NULL,              -- SHA256 for deduplication
  thumbnailHash TEXT,
  createdAt INTEGER NOT NULL,
  syncedAt INTEGER DEFAULT 0,
  FOREIGN KEY (cardId) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE INDEX idx_attachments_card ON attachments(cardId);
CREATE INDEX idx_attachments_hash ON attachments(hash);
```

### Sync-Specific Tables

#### tombstones

Tracks deletions for sync. When an entity is deleted, a tombstone is created.

```sql
CREATE TABLE tombstones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entityType TEXT NOT NULL,        -- 'card', 'attachment', 'column', 'attribute'
  entityId TEXT NOT NULL,          -- ID of deleted entity
  deletedAt INTEGER NOT NULL,      -- When deleted
  deviceId TEXT NOT NULL           -- Device that deleted it
);

CREATE INDEX idx_tombstones_deleted ON tombstones(deletedAt);
CREATE INDEX idx_tombstones_entity ON tombstones(entityType, entityId);
```

**Why Tombstones?**
- Without tombstones, peer doesn't know entity was deleted
- With tombstones, delete operation syncs like any other change
- Tombstones can be cleaned up after successful sync

#### sync_metadata

Stores sync configuration and state.

```sql
CREATE TABLE sync_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Initial metadata
INSERT INTO sync_metadata (key, value) VALUES 
  ('device_id', ''),               -- Generated on first launch
  ('device_name', ''),             -- User-set device name
  ('last_sync_time', '0'),         -- Timestamp of last successful sync
  ('paired_devices', '[]'),        -- JSON array of paired device info
  ('schema_version', '1');         -- For future migrations
```

**Paired Device Format:**
```json
{
  "deviceId": "mobile-abc-123",
  "deviceName": "iPhone 14",
  "deviceType": "ios",
  "publicKey": "base64-encoded-public-key",
  "pairedAt": 1734512345000,
  "lastSeenAt": 1734512345000,
  "lastSyncAt": 1734512345000
}
```

#### sync_log (Optional - for debugging)

```sql
CREATE TABLE sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  direction TEXT NOT NULL,         -- 'send' or 'receive'
  deviceId TEXT NOT NULL,
  changeCount INTEGER NOT NULL,
  conflictCount INTEGER NOT NULL,
  success INTEGER NOT NULL,
  errorMessage TEXT
);

CREATE INDEX idx_sync_log_timestamp ON sync_log(timestamp);
```

---

## 🔄 Sync Protocol

### Protocol Overview

- **Transport:** WebSocket (ws://)
- **Format:** JSON messages
- **Encryption:** End-to-end with libsodium (NaCl)
- **Discovery:** mDNS (_flow-kanban._tcp.local)
- **Conflict Resolution:** Last-Write-Wins (LWW) with timestamps

### Message Types

All messages follow this base structure:

```typescript
interface SyncMessage {
  type: string;           // Message type
  messageId: string;      // Unique ID (UUID)
  timestamp: number;      // Unix timestamp in ms
  deviceId: string;       // Sender's device ID
  payload: any;           // Type-specific payload
}
```

After encryption, messages are wrapped:

```typescript
interface EncryptedMessage {
  nonce: string;          // base64-encoded nonce
  ciphertext: string;     // base64-encrypted payload
  tag: string;            // base64-auth tag
}
```

### 1. PAIR_REQUEST

Sent by mobile to initiate pairing.

```json
{
  "type": "pair_request",
  "messageId": "msg-123",
  "timestamp": 1734512345000,
  "deviceId": "mobile-abc-123",
  "payload": {
    "deviceName": "iPhone 14",
    "deviceType": "ios",
    "pin": "123456",
    "publicKey": "base64-encoded-public-key"
  }
}
```

### 2. PAIR_RESPONSE

Sent by desktop to accept/reject pairing.

```json
{
  "type": "pair_response",
  "messageId": "msg-124",
  "timestamp": 1734512346000,
  "deviceId": "desktop-xyz-789",
  "payload": {
    "status": "accepted",  // or "rejected"
    "deviceName": "MacBook Pro",
    "publicKey": "base64-encoded-public-key",
    "error": null          // Error message if rejected
  }
}
```

### 3. SYNC_REQUEST

Sent by either device to sync changes.

```json
{
  "type": "sync_request",
  "messageId": "msg-125",
  "timestamp": 1734512347000,
  "deviceId": "mobile-abc-123",
  "payload": {
    "lastSyncTime": 1734512000000,  // Last successful sync
    "changes": [
      {
        "entityType": "card",
        "action": "create",          // or "update" or "delete"
        "entity": {
          "id": 12345,
          "title": "New card",
          "area": "team-a",
          "type": "design",
          "notes": "",
          "column": "inbox",
          "position": 0,
          "dueDate": null,
          "createdAt": 1734512345000,
          "updatedAt": 1734512345000,
          "deviceId": "mobile-abc-123"
        }
      },
      {
        "entityType": "card",
        "action": "update",
        "entity": { /* updated card */ }
      },
      {
        "entityType": "card",
        "action": "delete",
        "entityId": 67890,
        "deletedAt": 1734512340000
      }
    ]
  }
}
```

### 4. SYNC_RESPONSE

Sent in response to SYNC_REQUEST.

```json
{
  "type": "sync_response",
  "messageId": "msg-126",
  "timestamp": 1734512348000,
  "deviceId": "desktop-xyz-789",
  "payload": {
    "status": "success",             // or "partial" or "error"
    "receivedChanges": 3,
    "appliedChanges": 3,
    "conflicts": [],                 // Array of conflicts
    "changes": [                     // Changes from server to send back
      {
        "entityType": "card",
        "action": "update",
        "entity": { /* server's version */ }
      }
    ],
    "serverTime": 1734512348000
  }
}
```

### 5. SYNC_CONFLICT

Sent when conflicts are detected.

```json
{
  "type": "sync_conflict",
  "messageId": "msg-127",
  "timestamp": 1734512349000,
  "deviceId": "desktop-xyz-789",
  "payload": {
    "conflicts": [
      {
        "entityType": "card",
        "entityId": 12345,
        "clientVersion": {
          "title": "Design Review",
          "updatedAt": 1734512345000,
          "deviceId": "mobile-abc-123"
        },
        "serverVersion": {
          "title": "UX Review",
          "updatedAt": 1734512346000,
          "deviceId": "desktop-xyz-789"
        },
        "resolution": "server_wins",  // Based on LWW algorithm
        "resolvedEntity": { /* winning version */ }
      }
    ]
  }
}
```

### 6. SYNC_ACK

Acknowledgment that sync completed successfully.

```json
{
  "type": "sync_ack",
  "messageId": "msg-128",
  "timestamp": 1734512350000,
  "deviceId": "mobile-abc-123",
  "payload": {
    "acknowledgedMessageId": "msg-126",
    "status": "complete",
    "newSyncTime": 1734512350000
  }
}
```

### Conflict Resolution Algorithm

**Strategy:** Last-Write-Wins (LWW)

```javascript
function resolveConflict(clientEntity, serverEntity) {
  // Special case: One is deleted
  if (clientEntity.action === 'delete' || serverEntity.action === 'delete') {
    return {
      resolution: 'deleted',
      winner: 'delete',
      entity: null
    };
  }
  
  // Compare timestamps
  if (clientEntity.updatedAt > serverEntity.updatedAt) {
    return {
      resolution: 'client_wins',
      winner: 'client',
      entity: clientEntity
    };
  } else if (serverEntity.updatedAt > clientEntity.updatedAt) {
    return {
      resolution: 'server_wins',
      winner: 'server',
      entity: serverEntity
    };
  } else {
    // Same timestamp (rare) - use device ID as tiebreaker
    const winner = clientEntity.deviceId > serverEntity.deviceId ? 'client' : 'server';
    return {
      resolution: `${winner}_wins_tiebreaker`,
      winner,
      entity: winner === 'client' ? clientEntity : serverEntity
    };
  }
}
```

**Conflict Examples:**

1. **Card updated on both devices**
   - Compare `updatedAt` timestamps
   - Newer timestamp wins

2. **Card deleted on one, updated on other**
   - Delete always wins (explicit user action)

3. **Card moved to different columns**
   - Newer timestamp wins

4. **Same timestamp (rare)**
   - Higher device ID wins (deterministic)

---

## 🔐 Security & Encryption

### Security Principles

1. **End-to-End Encryption** - All sync data encrypted before leaving device
2. **Local Network Only** - mDNS discovery limits to local network
3. **Device Authentication** - 6-digit PIN for initial pairing
4. **Key Exchange** - ECDH (Elliptic Curve Diffie-Hellman)
5. **Perfect Forward Secrecy** - Keys rotated periodically

### Encryption Implementation

Using **libsodium** (NaCl) for cryptographic operations:

```rust
// Desktop (Rust)
use sodiumoxide::crypto::box_;

// Generate key pair for device
let (public_key, secret_key) = box_::gen_keypair();

// Store secret key securely
// Share public key during pairing

// When pairing completes, derive shared secret
let their_public_key = /* from peer */;
let precomputed_key = box_::precompute(&their_public_key, &secret_key);

// Encrypt message
let nonce = box_::gen_nonce();
let plaintext = /* JSON message */;
let ciphertext = box_::seal_precomputed(plaintext, &nonce, &precomputed_key);

// Send: { nonce, ciphertext }
```

```javascript
// Mobile (JavaScript via react-native-sodium)
import Sodium from 'react-native-sodium';

// Generate key pair
const { publicKey, secretKey } = await Sodium.crypto_box_keypair();

// Derive shared secret after pairing
const theirPublicKey = /* from peer */;
const sharedSecret = await Sodium.crypto_box_beforenm(
  theirPublicKey,
  secretKey
);

// Encrypt message
const nonce = await Sodium.randombytes_buf(Sodium.crypto_box_NONCEBYTES);
const plaintext = JSON.stringify(message);
const ciphertext = await Sodium.crypto_box_easy_afternm(
  plaintext,
  nonce,
  sharedSecret
);

// Send: { nonce: base64(nonce), ciphertext: base64(ciphertext) }
```

### Pairing Protocol

```
┌─────────────┐                           ┌─────────────┐
│   Desktop   │                           │   Mobile    │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │  1. User clicks "Enable Sync"          │
       │     Generate 6-digit PIN               │
       │     Display PIN on screen              │
       │     Start WebSocket server             │
       │     Advertise via mDNS                 │
       │                                         │
       │  2. User taps "Pair Device"    ◄───────┤
       │                                         │
       │  3. Discover via mDNS          ◄───────┤
       │     See "MacBook Pro" available        │
       │                                         │
       │  4. User selects desktop       ◄───────┤
       │     User enters PIN                    │
       │                                         │
       │  5. Connect WebSocket          ◄──────►│
       │                                         │
       │  6. Exchange PAIR_REQUEST      ◄───────┤
       │     { pin, publicKey }                 │
       │                                         │
       │  7. Verify PIN                         │
       │     If wrong: Reject                   │
       │     If correct: Continue               │
       │                                         │
       │  8. Send PAIR_RESPONSE         ────────►│
       │     { status: "accepted",              │
       │       publicKey }                      │
       │                                         │
       │  9. Both derive shared secret  ◄──────►│
       │     ECDH key exchange                  │
       │                                         │
       │ 10. Store pairing info         ◄──────►│
       │     Device ID + public key             │
       │     Save to sync_metadata              │
       │                                         │
       │ 11. Pairing complete! ✅       ◄──────►│
       │     Ready for sync                     │
       │                                         │
```

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **Network Sniffing** | End-to-end encryption (libsodium) |
| **MITM Attack** | Key exchange verification, PIN pairing |
| **Unauthorized Pairing** | 6-digit PIN, expires after 5 minutes |
| **Data Theft (Physical)** | iOS/macOS encryption at rest |
| **Sync Tampering** | Message authentication (HMAC) |
| **Replay Attacks** | Timestamp validation, nonce usage |

---

## 🚧 Phase 2: Desktop P2P Server

**Status:** 🔴 Not Started  
**Duration:** 3-4 weeks  
**Target Version:** v0.4.0

### Objective

Enable desktop to act as a P2P sync server that mobile devices can discover and connect to on the local network.

### Prerequisites

- ✅ Phase 0 complete (SQLite migration)
- ✅ Rust backend ready
- ✅ Tauri command infrastructure in place

### Dependencies to Add

Update `packages/desktop/src-tauri/Cargo.toml`:

```toml
[dependencies]
# Existing...
rusqlite = "0.31"
uuid = "1.6"
chrono = "0.4"

# NEW for Phase 2:
tokio = { version = "1.35", features = ["full"] }
tokio-tungstenite = "0.21"
mdns = "3.0"
sodiumoxide = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
futures = "0.3"
base64 = "0.21"
sha2 = "0.10"
```

### Implementation Tasks

#### Week 1: Discovery & Pairing (5 days)

**Task 1.1: Create Sync Module Structure**
```bash
cd packages/desktop/src-tauri
mkdir src/sync
touch src/sync/mod.rs
touch src/sync/server.rs
touch src/sync/discovery.rs
touch src/sync/pairing.rs
touch src/sync/encryption.rs
touch src/sync/types.rs
```

**Task 1.2: Implement mDNS Service Advertisement**

File: `src/sync/discovery.rs`

```rust
use mdns::{Record, RecordKind};
use std::net::IpAddr;
use std::time::Duration;

pub struct DiscoveryService {
    service_name: String,
    port: u16,
}

impl DiscoveryService {
    pub fn new(device_name: &str, port: u16) -> Self {
        Self {
            service_name: device_name.to_string(),
            port,
        }
    }
    
    pub fn advertise(&self, device_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        let service_type = "_flow-kanban._tcp.local";
        
        // Create TXT records with metadata
        let txt_records = vec![
            format!("version=1.0"),
            format!("device_name={}", self.service_name),
            format!("device_id={}", device_id),
        ];
        
        // Register mDNS service
        // Implementation details here...
        
        Ok(())
    }
}
```

**Task 1.3: Implement PIN Generation & Validation**

File: `src/sync/pairing.rs`

```rust
use rand::Rng;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct PairingManager {
    active_pin: Option<(String, u64)>, // (PIN, expiry_timestamp)
}

impl PairingManager {
    pub fn new() -> Self {
        Self { active_pin: None }
    }
    
    pub fn generate_pin(&mut self) -> String {
        let mut rng = rand::thread_rng();
        let pin: String = (0..6)
            .map(|_| rng.gen_range(0..10).to_string())
            .collect();
        
        let expiry = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() + 300; // 5 minutes
        
        self.active_pin = Some((pin.clone(), expiry));
        pin
    }
    
    pub fn validate_pin(&self, pin: &str) -> bool {
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
```

**Task 1.4: Implement Encryption Layer**

File: `src/sync/encryption.rs`

```rust
use sodiumoxide::crypto::box_;
use base64::{Engine as _, engine::general_purpose};

pub struct EncryptionManager {
    public_key: box_::PublicKey,
    secret_key: box_::SecretKey,
}

impl EncryptionManager {
    pub fn new() -> Self {
        sodiumoxide::init().unwrap();
        let (pk, sk) = box_::gen_keypair();
        Self {
            public_key: pk,
            secret_key: sk,
        }
    }
    
    pub fn get_public_key_base64(&self) -> String {
        general_purpose::STANDARD.encode(&self.public_key.0)
    }
    
    pub fn derive_shared_key(&self, peer_public_key_b64: &str) -> Result<box_::PrecomputedKey, String> {
        let peer_pk_bytes = general_purpose::STANDARD
            .decode(peer_public_key_b64)
            .map_err(|e| e.to_string())?;
        
        let peer_pk = box_::PublicKey::from_slice(&peer_pk_bytes)
            .ok_or("Invalid public key")?;
        
        Ok(box_::precompute(&peer_pk, &self.secret_key))
    }
    
    pub fn encrypt(&self, plaintext: &str, shared_key: &box_::PrecomputedKey) -> Result<(String, String), String> {
        let nonce = box_::gen_nonce();
        let ciphertext = box_::seal_precomputed(plaintext.as_bytes(), &nonce, shared_key);
        
        Ok((
            general_purpose::STANDARD.encode(&nonce.0),
            general_purpose::STANDARD.encode(&ciphertext),
        ))
    }
    
    pub fn decrypt(&self, nonce_b64: &str, ciphertext_b64: &str, shared_key: &box_::PrecomputedKey) -> Result<String, String> {
        let nonce_bytes = general_purpose::STANDARD.decode(nonce_b64).map_err(|e| e.to_string())?;
        let ciphertext = general_purpose::STANDARD.decode(ciphertext_b64).map_err(|e| e.to_string())?;
        
        let nonce = box_::Nonce::from_slice(&nonce_bytes).ok_or("Invalid nonce")?;
        
        let plaintext = box_::open_precomputed(&ciphertext, &nonce, shared_key)
            .map_err(|_| "Decryption failed")?;
        
        String::from_utf8(plaintext).map_err(|e| e.to_string())
    }
}
```

**Task 1.5: Create Tauri Commands for Sync**

File: `src/lib.rs` (add to existing commands)

```rust
#[tauri::command]
async fn sync_start_server(app_handle: tauri::AppHandle) -> Result<String, String> {
    // Generate PIN
    // Start WebSocket server
    // Start mDNS advertisement
    // Return PIN to display in UI
    Ok("123456".to_string())
}

#[tauri::command]
async fn sync_stop_server() -> Result<(), String> {
    // Stop WebSocket server
    // Stop mDNS advertisement
    Ok(())
}

#[tauri::command]
async fn sync_get_status() -> Result<serde_json::Value, String> {
    // Return current sync status
    Ok(serde_json::json!({
        "enabled": false,
        "paired_devices": [],
        "last_sync": null
    }))
}
```

#### Week 2: Sync Protocol (5 days)

**Task 2.1: WebSocket Server Implementation**

File: `src/sync/server.rs`

```rust
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures::{StreamExt, SinkExt};

pub struct SyncServer {
    port: u16,
}

impl SyncServer {
    pub fn new(port: u16) -> Self {
        Self { port }
    }
    
    pub async fn start(&self) -> Result<(), Box<dyn std::error::Error>> {
        let addr = format!("0.0.0.0:{}", self.port);
        let listener = TcpListener::bind(&addr).await?;
        
        println!("WebSocket server listening on {}", addr);
        
        while let Ok((stream, _)) = listener.accept().await {
            tokio::spawn(async move {
                if let Err(e) = handle_connection(stream).await {
                    eprintln!("Error handling connection: {}", e);
                }
            });
        }
        
        Ok(())
    }
}

async fn handle_connection(stream: tokio::net::TcpStream) -> Result<(), Box<dyn std::error::Error>> {
    let ws_stream = accept_async(stream).await?;
    let (mut write, mut read) = ws_stream.split();
    
    while let Some(msg) = read.next().await {
        let msg = msg?;
        if msg.is_text() || msg.is_binary() {
            // Process sync message
            // Parse JSON
            // Handle based on message type
            // Send response
            write.send(msg).await?;
        }
    }
    
    Ok(())
}
```

**Task 2.2: Message Type Definitions**

File: `src/sync/types.rs`

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncMessage {
    #[serde(rename = "type")]
    pub msg_type: String,
    pub message_id: String,
    pub timestamp: i64,
    pub device_id: String,
    pub payload: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PairRequest {
    pub device_name: String,
    pub device_type: String,
    pub pin: String,
    pub public_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncRequest {
    pub last_sync_time: i64,
    pub changes: Vec<Change>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Change {
    pub entity_type: String,
    pub action: String, // "create", "update", "delete"
    pub entity: Option<serde_json::Value>,
    pub entity_id: Option<String>,
    pub deleted_at: Option<i64>,
}
```

**Task 2.3: Conflict Resolution Implementation**

```rust
pub fn resolve_conflict(
    client_entity: &serde_json::Value,
    server_entity: &serde_json::Value,
) -> ConflictResolution {
    let client_updated = client_entity["updatedAt"].as_i64().unwrap_or(0);
    let server_updated = server_entity["updatedAt"].as_i64().unwrap_or(0);
    
    if client_updated > server_updated {
        ConflictResolution::ClientWins(client_entity.clone())
    } else if server_updated > client_updated {
        ConflictResolution::ServerWins(server_entity.clone())
    } else {
        // Tiebreaker: device ID
        let client_device = client_entity["deviceId"].as_str().unwrap_or("");
        let server_device = server_entity["deviceId"].as_str().unwrap_or("");
        
        if client_device > server_device {
            ConflictResolution::ClientWinsTiebreaker(client_entity.clone())
        } else {
            ConflictResolution::ServerWinsTiebreaker(server_entity.clone())
        }
    }
}
```

#### Week 3: Desktop UI (5 days)

**Task 3.1: Settings Panel for Sync**

File: `packages/desktop/src/lib/SyncSettings.svelte`

```svelte
<script>
  import { invoke } from '@tauri-apps/api/tauri';
  
  let syncEnabled = false;
  let currentPin = '';
  let pairedDevices = [];
  
  async function startSync() {
    try {
      currentPin = await invoke('sync_start_server');
      syncEnabled = true;
    } catch (error) {
      console.error('Failed to start sync:', error);
    }
  }
  
  async function stopSync() {
    try {
      await invoke('sync_stop_server');
      syncEnabled = false;
      currentPin = '';
    } catch (error) {
      console.error('Failed to stop sync:', error);
    }
  }
</script>

<div class="sync-settings">
  <h2>Sync Settings</h2>
  
  {#if syncEnabled}
    <div class="pin-display">
      <h3>Pairing PIN</h3>
      <div class="pin">{currentPin}</div>
      <p>Enter this PIN on your mobile device to pair</p>
    </div>
    
    <button on:click={stopSync}>Disable Sync</button>
  {:else}
    <button on:click={startSync}>Enable Sync</button>
  {/if}
  
  {#if pairedDevices.length > 0}
    <div class="paired-devices">
      <h3>Paired Devices</h3>
      {#each pairedDevices as device}
        <div class="device-item">
          <span>{device.name}</span>
          <button on:click={() => unpairDevice(device.id)}>Unpair</button>
        </div>
      {/each}
    </div>
  {/if}
</div>
```

#### Week 4: Testing & Integration (5 days)

**Task 4.1: Unit Tests**
- Test PIN generation/validation
- Test encryption/decryption
- Test conflict resolution
- Test message parsing

**Task 4.2: Integration Tests**
- Test WebSocket server startup
- Test mDNS advertisement
- Test pairing flow with mock client
- Test sync message handling

**Task 4.3: Manual Testing**
- Test on macOS
- Test Windows (if applicable)
- Test network discovery
- Test firewall scenarios

### Acceptance Criteria

- [ ] Desktop advertises sync service via mDNS
- [ ] 6-digit PIN generates and validates correctly
- [ ] WebSocket server accepts connections
- [ ] Pairing completes successfully with valid PIN
- [ ] Pairing rejects with invalid PIN
- [ ] Encrypted messages send/receive correctly
- [ ] Sync UI shows current status
- [ ] Paired devices persist in database
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass

### Deliverables

1. Rust sync module (`src/sync/`)
2. Tauri commands for sync operations
3. Desktop sync UI (`SyncSettings.svelte`)
4. Unit & integration tests
5. Documentation updates
6. Phase 2 completion report

---

## 📱 Phase 3: Mobile P2P Client

**Status:** 🔴 Not Started  
**Duration:** 3-4 weeks  
**Target Version:** v1.0.0-beta  
**Prerequisites:** Phase 2 complete

### Objective

Enable mobile app to discover desktop on local network, pair with 6-digit PIN, and sync data bidirectionally.

### Dependencies to Add

Update `packages/mobile/package.json`:

```json
{
  "dependencies": {
    "react-native-zeroconf": "^11.0.1",
    "react-native-sodium": "^0.3.2",
    "@react-native-async-storage/async-storage": "^1.21.0"
  }
}
```

### Implementation Tasks

#### Week 1: Discovery & Pairing UI (5 days)

**Task 1.1: mDNS Discovery Service**

File: `packages/mobile/src/services/discovery.ts`

```typescript
import Zeroconf from 'react-native-zeroconf';

export class DiscoveryService {
  private zeroconf: Zeroconf;
  private onServiceFound: (service: any) => void;
  
  constructor(onServiceFound: (service: any) => void) {
    this.zeroconf = new Zeroconf();
    this.onServiceFound = onServiceFound;
  }
  
  start() {
    this.zeroconf.on('resolved', (service) => {
      if (service.name.includes('flow-kanban')) {
        this.onServiceFound(service);
      }
    });
    
    this.zeroconf.scan('_flow-kanban._tcp', 'local.');
  }
  
  stop() {
    this.zeroconf.stop();
  }
}
```

**Task 1.2: Pairing Flow Screens**

File: `packages/mobile/src/screens/PairingScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { DiscoveryService } from '../services/discovery';

export default function PairingScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(true);
  
  useEffect(() => {
    const discovery = new DiscoveryService((service) => {
      setDevices(prev => [...prev, service]);
    });
    
    discovery.start();
    
    return () => discovery.stop();
  }, []);
  
  const handleDeviceSelect = (device) => {
    navigation.navigate('EnterPin', { device });
  };
  
  return (
    <View>
      <Text>Available Devices</Text>
      {scanning && <Text>Scanning...</Text>}
      <FlatList
        data={devices}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleDeviceSelect(item)}>
            <Text>{item.txt.device_name}</Text>
            <Text>{item.addresses[0]}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

File: `packages/mobile/src/screens/EnterPinScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { pairWithDesktop } from '../services/sync';

export default function EnterPinScreen({ route, navigation }) {
  const { device } = route.params;
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  
  const handlePair = async () => {
    try {
      await pairWithDesktop(device, pin);
      navigation.navigate('PairingSuccess');
    } catch (err) {
      setError('Invalid PIN. Please try again.');
    }
  };
  
  return (
    <View>
      <Text>Enter 6-digit PIN from {device.txt.device_name}</Text>
      <TextInput
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <TouchableOpacity onPress={handlePair} disabled={pin.length !== 6}>
        <Text>Pair</Text>
      </TouchableOpacity>
    </View>
  );
}
```

#### Week 2: Sync Service (5 days)

**Task 2.1: WebSocket Client**

File: `packages/mobile/src/services/syncClient.ts`

```typescript
export class SyncClient {
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  
  async connect(host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://${host}:${port}`);
      
      this.ws.onopen = () => {
        this.connected = true;
        resolve();
      };
      
      this.ws.onerror = (error) => {
        reject(error);
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };
    });
  }
  
  async sendMessage(message: any): Promise<void> {
    if (!this.ws || !this.connected) {
      throw new Error('Not connected');
    }
    
    this.ws.send(JSON.stringify(message));
  }
  
  private handleMessage(message: any) {
    // Handle incoming sync messages
    console.log('Received:', message);
  }
}
```

**Task 2.2: Sync Service Implementation**

File: `packages/mobile/src/services/sync.ts`

```typescript
import { SyncClient } from './syncClient';
import { getAllCards, updateCard } from './database';
import Sodium from 'react-native-sodium';

export class SyncService {
  private client: SyncClient;
  private sharedKey: string | null = null;
  
  constructor() {
    this.client = new SyncClient();
  }
  
  async pairWithDesktop(device: any, pin: string): Promise<void> {
    // Generate key pair
    const { publicKey, secretKey } = await Sodium.crypto_box_keypair();
    
    // Connect to desktop
    await this.client.connect(device.addresses[0], device.port);
    
    // Send pair request
    await this.client.sendMessage({
      type: 'pair_request',
      messageId: generateId(),
      timestamp: Date.now(),
      deviceId: await getDeviceId(),
      payload: {
        deviceName: 'iPhone',
        deviceType: 'ios',
        pin: pin,
        publicKey: await Sodium.to_base64(publicKey),
      },
    });
    
    // Wait for response...
  }
  
  async sync(): Promise<void> {
    // Get changes since last sync
    const lastSyncTime = await getLastSyncTime();
    const changes = await getChangesSince(lastSyncTime);
    
    // Send sync request
    await this.client.sendMessage({
      type: 'sync_request',
      messageId: generateId(),
      timestamp: Date.now(),
      deviceId: await getDeviceId(),
      payload: {
        lastSyncTime,
        changes,
      },
    });
    
    // Handle response...
  }
}
```

#### Week 3: Mobile Sync UI (5 days)

**Task 3.1: Sync Status Screen**

File: `packages/mobile/src/screens/SyncScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { getPairedDevices, getLastSyncTime } from '../services/storage';
import { SyncService } from '../services/sync';

export default function SyncScreen({ navigation }) {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const devices = await getPairedDevices();
    const time = await getLastSyncTime();
    setPairedDevices(devices);
    setLastSync(time);
  };
  
  const handleSync = async () => {
    setSyncing(true);
    try {
      const syncService = new SyncService();
      await syncService.sync();
      await loadData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Sync</Text>
      
      {pairedDevices.length === 0 ? (
        <View>
          <Text>No paired devices</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Pairing')}>
            <Text>Pair Device</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text>Last synced: {lastSync ? formatDate(lastSync) : 'Never'}</Text>
          
          <TouchableOpacity onPress={handleSync} disabled={syncing}>
            <Text>{syncing ? 'Syncing...' : 'Sync Now'}</Text>
          </TouchableOpacity>
          
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Paired Devices</Text>
          <FlatList
            data={pairedDevices}
            keyExtractor={(item) => item.deviceId}
            renderItem={({ item }) => (
              <View style={{ padding: 10 }}>
                <Text>{item.deviceName}</Text>
                <Text>Last seen: {formatDate(item.lastSeenAt)}</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}
```

#### Week 4: End-to-End Testing (5 days)

**Task 4.1: Complete Sync Flow Testing**
- Test device discovery
- Test pairing with correct/incorrect PIN
- Test card create → sync → appear on peer
- Test card update → sync → update on peer
- Test card delete → sync → delete on peer
- Test column/attribute changes

**Task 4.2: Conflict Testing**
- Edit same card on both devices
- Delete card on one, edit on other
- Test timestamp-based resolution

**Task 4.3: Edge Case Testing**
- Network interruption during sync
- Large dataset sync (1000+ cards)
- Rapid changes
- Offline mode
- Battery impact

### Acceptance Criteria

- [ ] Mobile discovers desktop on local network
- [ ] Pairing completes with valid PIN
- [ ] Pairing fails with invalid PIN
- [ ] Card changes sync desktop → mobile
- [ ] Card changes sync mobile → desktop
- [ ] Conflicts resolve automatically (LWW)
- [ ] Sync status shows in UI
- [ ] Manual sync button works
- [ ] Paired devices list accurate
- [ ] No data loss in any scenario
- [ ] Sync completes < 5s for typical dataset

### Deliverables

1. Mobile discovery service
2. WebSocket client implementation
3. Sync service with encryption
4. Pairing flow UI (3 screens)
5. Sync status screen
6. Integration tests
7. Phase 3 completion report

---

## 📎 Phase 4: Attachment Sync

**Status:** 🔴 Not Started  
**Duration:** 2-3 weeks  
**Target Version:** v1.1.0  
**Prerequisites:** Phase 2-3 complete

### Objective

Enable file attachments to sync between desktop and mobile with intelligent transfer based on file size and device constraints.

### Strategy

**Desktop → Mobile:**
- Files < 10MB: Auto-sync
- Files > 10MB: Metadata only, on-demand download

**Mobile → Desktop:**
- All files: Auto-sync (desktop has unlimited space)

**Deduplication:**
- Use SHA256 hash to avoid transferring duplicate files

### Implementation Tasks

#### Week 1: File Transfer Protocol (5 days)

**Task 1.1: Chunked Transfer Implementation**

```rust
// Desktop (Rust)
const CHUNK_SIZE: usize = 64 * 1024; // 64KB

pub async fn send_attachment(
    file_path: &str,
    attachment_id: &str,
    ws: &mut WebSocketStream,
) -> Result<(), Box<dyn std::error::Error>> {
    let file_data = std::fs::read(file_path)?;
    let total_chunks = (file_data.len() + CHUNK_SIZE - 1) / CHUNK_SIZE;
    
    for (i, chunk) in file_data.chunks(CHUNK_SIZE).enumerate() {
        let message = serde_json::json!({
            "type": "attachment_chunk",
            "payload": {
                "attachmentId": attachment_id,
                "chunkIndex": i,
                "totalChunks": total_chunks,
                "data": base64::encode(chunk),
                "hash": sha256::digest(chunk),
            }
        });
        
        ws.send(Message::Text(message.to_string())).await?;
        
        // Wait for acknowledgment
        // ...
    }
    
    Ok(())
}
```

**Task 1.2: Mobile File Reception**

```typescript
// Mobile (TypeScript)
class AttachmentReceiver {
  private chunks: Map<string, Buffer[]> = new Map();
  
  async receiveChunk(message: any): Promise<void> {
    const { attachmentId, chunkIndex, totalChunks, data, hash } = message.payload;
    
    // Verify hash
    const decoded = Buffer.from(data, 'base64');
    const computedHash = await sha256(decoded);
    if (computedHash !== hash) {
      throw new Error('Chunk hash mismatch');
    }
    
    // Store chunk
    if (!this.chunks.has(attachmentId)) {
      this.chunks.set(attachmentId, []);
    }
    const chunks = this.chunks.get(attachmentId)!;
    chunks[chunkIndex] = decoded;
    
    // Check if complete
    if (chunks.filter(c => c).length === totalChunks) {
      await this.saveAttachment(attachmentId, chunks);
      this.chunks.delete(attachmentId);
    }
  }
  
  private async saveAttachment(id: string, chunks: Buffer[]): Promise<void> {
    const fullData = Buffer.concat(chunks);
    const filepath = `${RNFS.DocumentDirectoryPath}/attachments/${id}`;
    await RNFS.writeFile(filepath, fullData.toString('base64'), 'base64');
  }
}
```

#### Week 2: UI & Progress Tracking (5 days)

**Task 2.1: Upload Progress Indicator**
**Task 2.2: Download on Demand**
**Task 2.3: File Picker Integration (Mobile)**

---

## 🧪 Testing Strategy

### Unit Tests

Test individual components in isolation.

**Desktop (Rust):**
```bash
cd packages/desktop/src-tauri
cargo test
```

Tests to write:
- PIN generation/validation
- Encryption/decryption
- Conflict resolution
- Message parsing
- Hash calculation

**Mobile (Jest + React Native Testing Library):**
```bash
cd packages/mobile
npm test
```

Tests to write:
- Sync service logic
- Conflict resolution
- Message formatting
- Device discovery parsing

### Integration Tests

Test complete workflows.

**Sync Flow Tests:**
1. Desktop starts server → Mobile discovers → Success
2. Mobile pairs with correct PIN → Success
3. Mobile pairs with wrong PIN → Failure
4. Card created on desktop → Syncs to mobile
5. Card updated on mobile → Syncs to desktop
6. Conflict (same card edited) → Resolves automatically

**Network Tests:**
1. Sync during network interruption → Retries
2. Large dataset (1000 cards) → Completes < 30s
3. Rapid changes → All changes sync correctly

### Manual Testing Checklist

**Phase 2 (Desktop):**
- [ ] Start sync server → PIN displays
- [ ] Stop sync server → Service stops
- [ ] mDNS service advertises correctly
- [ ] WebSocket accepts connections
- [ ] Pairing with valid PIN succeeds
- [ ] Pairing with invalid PIN fails
- [ ] Settings UI shows status

**Phase 3 (Mobile):**
- [ ] Discover desktop on network
- [ ] Select desktop from list
- [ ] Enter PIN → Pairing succeeds
- [ ] Create card → Syncs to desktop
- [ ] Edit card → Syncs to desktop
- [ ] Delete card → Syncs to desktop
- [ ] Desktop changes → Sync to mobile
- [ ] Conflict → Resolves correctly
- [ ] Sync status accurate

**Phase 4 (Attachments):**
- [ ] Small file (< 10MB) auto-syncs
- [ ] Large file metadata syncs
- [ ] On-demand download works
- [ ] Progress indicators accurate
- [ ] Hash deduplication works

### Performance Benchmarks

Target metrics:

| Metric | Target | Critical |
|--------|--------|----------|
| Discovery time | < 3s | < 10s |
| Pairing time | < 5s | < 15s |
| Sync 100 cards | < 5s | < 15s |
| Sync 1000 cards | < 30s | < 60s |
| Memory usage | < 100MB | < 200MB |
| Battery drain | < 5%/hour | < 10%/hour |

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Desktop not discovered on mobile

**Symptoms:**
- Mobile shows "Scanning..." indefinitely
- No devices appear in list

**Solutions:**
1. Check both devices on same WiFi network
2. Check firewall settings (allow port 9898)
3. Restart mDNS service on desktop
4. Check mDNS service is advertising correctly:
   ```bash
   # macOS
   dns-sd -B _flow-kanban._tcp
   ```

#### Issue: Pairing fails with "Invalid PIN"

**Symptoms:**
- Correct PIN entered but pairing fails
- Error: "Invalid PIN" or "Pairing rejected"

**Solutions:**
1. Check PIN hasn't expired (5 minutes)
2. Regenerate PIN on desktop
3. Check for typos (O vs 0, etc.)
4. Check WebSocket connection established

#### Issue: Sync hangs or fails

**Symptoms:**
- "Syncing..." indicator never completes
- Timeout errors in logs

**Solutions:**
1. Check network connection
2. Check WebSocket connection alive
3. Review sync logs:
   ```sql
   SELECT * FROM sync_log ORDER BY timestamp DESC LIMIT 10;
   ```
4. Try manual sync again
5. Check for conflicts in logs

#### Issue: Data doesn't sync

**Symptoms:**
- Changes on one device don't appear on other
- No sync errors but data missing

**Solutions:**
1. Check `syncedAt` field: Should update after sync
2. Verify device IDs match in paired_devices
3. Check tombstones table for deletions
4. Verify timestamps are reasonable (not future dates)
5. Check encryption keys match

### Debug Mode

Enable detailed logging:

**Desktop (Rust):**
```rust
// Add to main.rs
env_logger::init_from_env(
    env_logger::Env::default()
        .filter_or("RUST_LOG", "debug")
);
```

**Mobile (TypeScript):**
```typescript
// Add to sync service
const DEBUG = __DEV__;

if (DEBUG) {
  console.log('Sync request:', request);
  console.log('Sync response:', response);
}
```

---

## ❓ FAQs

### General Questions

**Q: Why P2P instead of cloud sync?**  
A: Privacy and user control. Users own their data completely, no third-party services involved.

**Q: Does sync work over internet?**  
A: Phase 2-3 only support local network. Phase 5+ may add optional self-hosted server for remote sync.

**Q: What happens if devices have conflicts?**  
A: Last-Write-Wins (LWW) based on timestamps. Newer change always wins.

**Q: Can I sync multiple mobile devices?**  
A: Yes, each device pairs independently with desktop.

### Technical Questions

**Q: Why WebSocket instead of HTTP?**  
A: Bidirectional communication needed for real-time sync. WebSocket maintains persistent connection.

**Q: Why mDNS for discovery?**  
A: Standard protocol for local network discovery. No configuration needed, works automatically.

**Q: Why libsodium for encryption?**  
A: Battle-tested cryptographic library. Industry standard for secure communication.

**Q: Why SQLite instead of another database?**  
A: Lightweight, embedded, works offline. Perfect for local-first apps.

**Q: What about database migration?**  
A: Schema versioning in sync_metadata table. Future migrations planned.

### Development Questions

**Q: Can I test sync without second device?**  
A: Yes, use iOS simulator + desktop for testing.

**Q: How do I debug encryption issues?**  
A: Temporarily disable encryption in development, log plaintext messages.

**Q: Where are sync logs stored?**  
A: Desktop: `~/Library/Application Support/com.flow.kanban/sync.log`  
Mobile: Check React Native logs

**Q: How do I reset pairing?**  
A: Delete paired_devices from sync_metadata table on both devices.

---

## 📚 References

### Documentation

- [MOBILE_SYNC_SPECIFICATION.md](../MOBILE_SYNC_SPECIFICATION.md) - Original detailed spec
- [PHASE_0_PROGRESS.md](../PHASE_0_PROGRESS.md) - Desktop SQLite migration
- [PHASE_1_PROGRESS.md](../PHASE_1_PROGRESS.md) - Mobile app development
- [PHASE_1_CRITICAL_ANALYSIS.md](../PHASE_1_CRITICAL_ANALYSIS.md) - Current state analysis

### Code References

**Desktop:**
- `packages/desktop/src-tauri/src/database/` - Database operations
- `packages/desktop/src-tauri/src/lib.rs` - Tauri commands
- `packages/desktop/src/stores/` - Svelte stores

**Mobile:**
- `packages/mobile/src/services/database.ts` - SQLite wrapper
- `packages/mobile/src/screens/` - React Native screens
- `packages/mobile/src/components/` - UI components

**Shared:**
- `packages/shared/src/models/` - Data models
- `packages/shared/src/utils/` - Utilities
- `packages/shared/src/theme/` - Design system

### External Resources

- [Tauri Documentation](https://tauri.app/)
- [React Native Documentation](https://reactnative.dev/)
- [SQLite Documentation](https://www.sqlite.org/)
- [libsodium Documentation](https://doc.libsodium.org/)
- [mDNS RFC 6762](https://datatracker.ietf.org/doc/html/rfc6762)
- [WebSocket RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455)

---

## 🎯 Quick Links

- **Start Phase 2:** [Desktop P2P Server Implementation](#phase-2-desktop-p2p-server)
- **Check Status:** [Current Status](#current-status)
- **Architecture:** [System Architecture](#architecture)
- **Protocol:** [Sync Protocol](#sync-protocol)
- **Testing:** [Testing Strategy](#testing-strategy)
- **Help:** [Troubleshooting](#troubleshooting)

---

**Last Updated:** December 23, 2024  
**Next Review:** After Phase 2 completion  
**Maintainer:** Flow Development Team

**Ready to start? Jump to [Phase 2: Desktop P2P Server](#phase-2-desktop-p2p-server)!** 🚀
