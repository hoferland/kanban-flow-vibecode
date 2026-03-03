# Flow Mobile & Sync Implementation Specification

**Version:** 1.0  
**Date:** December 18, 2024  
**Status:** Planning Complete, Ready for Implementation  
**Target Release:** iOS v1.0.0 (Mobile MVP)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Database Schema & Migration](#database-schema--migration)
5. [Sync Protocol Specification](#sync-protocol-specification)
6. [Mobile UI Specifications](#mobile-ui-specifications)
7. [Implementation Phases](#implementation-phases)
8. [Testing Strategy](#testing-strategy)
9. [Security & Privacy](#security--privacy)
10. [Risk Assessment](#risk-assessment)
11. [Success Metrics](#success-metrics)
12. [Decision Log](#decision-log)

---

## Executive Summary

### Project Overview

Flow is expanding from a desktop-only Kanban application to include an iOS mobile app with optional peer-to-peer data synchronization. This maintains Flow's core philosophy: **local-first, privacy-focused, and no third-party dependencies**.

### Key Objectives

- ✅ Create iOS mobile app with feature parity to desktop
- ✅ Implement P2P sync (same local network) without external servers
- ✅ Maintain offline-first functionality on both platforms
- ✅ Preserve Japandi aesthetic and user experience
- ✅ Prepare architecture for future Android support
- ✅ Enable future self-hosted sync server option

### Success Criteria

1. **Functionality:** All core desktop features available on mobile
2. **Sync:** Reliable P2P sync with conflict resolution
3. **Privacy:** Zero external data sharing, end-to-end encryption
4. **UX:** Feels native on iOS while maintaining Flow's identity
5. **Performance:** App launches < 2s, sync completes < 5s for typical dataset
6. **Reliability:** No data loss, graceful handling of edge cases

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Flow Ecosystem                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │  Desktop App    │              │   Mobile App    │      │
│  │  (Tauri/Svelte) │◄────P2P─────►│ (React Native)  │      │
│  └────────┬────────┘   Encrypted  └────────┬────────┘      │
│           │            WebSocket            │              │
│           │                                 │              │
│  ┌────────▼────────┐              ┌────────▼────────┐      │
│  │  SQLite DB      │              │   SQLite DB     │      │
│  │  (Desktop)      │              │   (Mobile)      │      │
│  └─────────────────┘              └─────────────────┘      │
│           │                                 │              │
│  ┌────────▼────────┐              ┌────────▼────────┐      │
│  │  File Storage   │              │  File Storage   │      │
│  │  (Attachments)  │              │  (Attachments)  │      │
│  └─────────────────┘              └─────────────────┘      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Shared Business Logic Layer                │  │
│  │  (packages/shared - JavaScript)                      │  │
│  │  - Models: Card, Attachment, Column                  │  │
│  │  - Sync: Protocol, Conflict Resolution, Encryption   │  │
│  │  - Utils: Date, Validation, Parsing                  │  │
│  │  - Theme: Japandi Design Tokens                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Future: Self-Hosted Sync Server              │  │
│  │  (Optional - Rust/Go WebSocket Server)               │  │
│  │  - Enables remote sync when not on same network      │  │
│  │  - User controls and hosts their own server          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
USER ACTION (Create/Update/Delete Card)
    ↓
UI COMPONENT (React Native / Svelte)
    ↓
SHARED BUSINESS LOGIC (packages/shared/)
    ├─> Validation
    ├─> Model Creation
    └─> Timestamp Management
    ↓
STORAGE LAYER (SQLite)
    ├─> Write to database
    ├─> Update indexes
    └─> Mark as needs sync
    ↓
SYNC LAYER (when connection available)
    ├─> Detect changes since last sync
    ├─> Encrypt payload
    └─> Send to paired device
    ↓
NETWORK LAYER (P2P)
    ├─> mDNS Discovery
    ├─> WebSocket Connection
    └─> Encrypted Transport
    ↓
PEER DEVICE
    ├─> Decrypt payload
    ├─> Resolve conflicts
    ├─> Write to local database
    └─> Acknowledge sync
```

---

## Technology Stack

### Desktop (Existing + Enhancements)

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Framework** | Tauri | 2.x | Native shell for web apps |
| **UI** | Svelte | 4.x | Reactive UI framework |
| **Build** | Vite | 5.x | Fast build tool |
| **Database** | SQLite | Latest | **NEW:** Migrating from localStorage |
| **Backend** | Rust | Latest | Native operations |
| **Sync** | Custom | - | **NEW:** Rust-based P2P server |
| **Encryption** | libsodium | Latest | **NEW:** End-to-end encryption |
| **Discovery** | mDNS | Latest | **NEW:** Local network discovery |

### Mobile (New)

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Framework** | React Native | 0.73+ | Cross-platform mobile |
| **Language** | TypeScript | 5.x | Type safety |
| **Navigation** | React Navigation | 6.x | Native navigation patterns |
| **Database** | SQLite | Latest | Via react-native-sqlite-storage |
| **Sync** | Custom | - | JavaScript P2P client |
| **Encryption** | react-native-sodium | Latest | libsodium bindings |
| **Discovery** | react-native-zeroconf | Latest | Bonjour/mDNS |
| **Storage** | AsyncStorage | Latest | App preferences |
| **Network** | NetInfo | Latest | Network state detection |

### Shared (Enhanced)

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Language** | JavaScript | ES2022 | ES Modules |
| **Models** | Classes | - | Card, Attachment, etc. |
| **Sync** | Custom | - | **NEW:** Protocol implementation |
| **Utils** | Pure JS | - | Date, validation, parsing |
| **Theme** | JS Objects | - | **NEW:** Design tokens |

---

## Database Schema & Migration

### SQLite Schema (Desktop & Mobile)

```sql
-- ============================================================================
-- CARDS TABLE
-- ============================================================================
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
  syncedAt INTEGER DEFAULT 0,
  deviceId TEXT
);

CREATE INDEX idx_cards_column ON cards(column);
CREATE INDEX idx_cards_area ON cards(area);
CREATE INDEX idx_cards_type ON cards(type);
CREATE INDEX idx_cards_updated ON cards(updatedAt);
CREATE INDEX idx_cards_synced ON cards(syncedAt);

-- ============================================================================
-- ATTACHMENTS TABLE
-- ============================================================================
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  cardId INTEGER NOT NULL,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  size INTEGER NOT NULL,
  mimeType TEXT NOT NULL,
  hash TEXT NOT NULL,
  thumbnailHash TEXT,
  createdAt INTEGER NOT NULL,
  syncedAt INTEGER DEFAULT 0,
  FOREIGN KEY (cardId) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE INDEX idx_attachments_card ON attachments(cardId);
CREATE INDEX idx_attachments_hash ON attachments(hash);

-- ============================================================================
-- COLUMNS TABLE
-- ============================================================================
CREATE TABLE columns (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  wipLimit INTEGER,
  color TEXT,
  isActive INTEGER DEFAULT 1,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX idx_columns_position ON columns(position);

-- ============================================================================
-- ATTRIBUTES TABLE (Areas & Types)
-- ============================================================================
CREATE TABLE attributes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'area' or 'type'
  label TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT,
  isActive INTEGER DEFAULT 1,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX idx_attributes_type ON attributes(type);
CREATE INDEX idx_attributes_position ON attributes(position);

-- ============================================================================
-- TOMBSTONES TABLE (Track Deletions for Sync)
-- ============================================================================
CREATE TABLE tombstones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entityType TEXT NOT NULL, -- 'card', 'attachment', 'column', 'attribute'
  entityId TEXT NOT NULL,
  deletedAt INTEGER NOT NULL,
  deviceId TEXT NOT NULL
);

CREATE INDEX idx_tombstones_deleted ON tombstones(deletedAt);
CREATE INDEX idx_tombstones_entity ON tombstones(entityType, entityId);

-- ============================================================================
-- SYNC_METADATA TABLE
-- ============================================================================
CREATE TABLE sync_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Initial metadata
INSERT INTO sync_metadata (key, value) VALUES 
  ('device_id', ''), -- Generated on first launch
  ('device_name', ''), -- User-set device name
  ('last_sync_time', '0'),
  ('paired_devices', '[]'), -- JSON array of paired device IDs
  ('schema_version', '1');

-- ============================================================================
-- SYNC_LOG TABLE (Optional: For Debugging)
-- ============================================================================
CREATE TABLE sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  direction TEXT NOT NULL, -- 'send' or 'receive'
  deviceId TEXT NOT NULL,
  changeCount INTEGER NOT NULL,
  conflictCount INTEGER NOT NULL,
  success INTEGER NOT NULL,
  errorMessage TEXT
);

CREATE INDEX idx_sync_log_timestamp ON sync_log(timestamp);
```

### Migration Strategy: localStorage → SQLite

#### Migration Plan (Desktop v0.3.0)

**Phase 1: Pre-Migration Backup**
```javascript
// Tauri command: create_backup
// 1. Read all localStorage data
// 2. Save to JSON file in app data dir
// 3. Return backup file path
```

**Phase 2: Database Creation**
```rust
// Rust: create_database()
// 1. Check if SQLite database exists
// 2. If not, create with schema above
// 3. Return success/failure
```

**Phase 3: Data Migration**
```javascript
// Tauri command: migrate_localstorage_to_sqlite
async function migrateData() {
  // 1. Check migration flag
  if (alreadyMigrated()) return;
  
  // 2. Read localStorage
  const cards = JSON.parse(localStorage.getItem('kanbanCards') || '[]');
  const columns = JSON.parse(localStorage.getItem('kanbanColumns') || '[]');
  const areas = JSON.parse(localStorage.getItem('areas') || '[]');
  const types = JSON.parse(localStorage.getItem('types') || '[]');
  
  // 3. Generate device ID
  const deviceId = generateDeviceId();
  
  // 4. Insert into SQLite
  await db.transaction(tx => {
    // Insert cards
    cards.forEach(card => {
      tx.executeSql(
        'INSERT INTO cards VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [card.id, card.title, card.area, card.type, card.notes,
         card.column, card.position, card.dueDate,
         card.createdAt || Date.now(), card.updatedAt || Date.now(),
         0, deviceId]
      );
    });
    
    // Insert columns, areas, types...
  });
  
  // 5. Verify data integrity
  const cardCount = await db.query('SELECT COUNT(*) FROM cards');
  if (cardCount !== cards.length) {
    throw new Error('Migration verification failed');
  }
  
  // 6. Set migration flag
  await db.query(
    'INSERT INTO sync_metadata VALUES (?, ?)',
    ['migrated_from_localstorage', 'true']
  );
  
  // 7. Keep localStorage for one more version (rollback safety)
  // Delete in v0.4.0
}
```

**Phase 4: Migration UI**
```svelte
<!-- MigrationModal.svelte -->
<script>
  let status = 'preparing'; // preparing, migrating, success, error
  let progress = 0;
  let errorMessage = '';
  
  onMount(async () => {
    try {
      status = 'migrating';
      await invoke('migrate_localstorage_to_sqlite', {
        onProgress: (p) => progress = p
      });
      status = 'success';
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      status = 'error';
      errorMessage = err.message;
    }
  });
</script>

{#if status === 'migrating'}
  <div class="migration-modal">
    <h2>Upgrading Flow to v0.3.0</h2>
    <p>Migrating your data to improved storage...</p>
    <progress value={progress} max="100"></progress>
    <p>This will only happen once.</p>
  </div>
{:else if status === 'success'}
  <div class="migration-modal">
    <h2>✅ Migration Complete!</h2>
    <p>Flow is ready. Restarting...</p>
  </div>
{:else if status === 'error'}
  <div class="migration-modal">
    <h2>❌ Migration Failed</h2>
    <p>{errorMessage}</p>
    <p>Your data is safe. Please contact support.</p>
    <button on:click={retryMigration}>Retry</button>
  </div>
{/if}
```

#### Rollback Strategy

```javascript
// If migration fails:
// 1. Database is NOT deleted (keep failed attempt for debugging)
// 2. localStorage is still intact
// 3. App falls back to localStorage mode
// 4. User can retry migration or export data

// Rollback command
async function rollbackMigration() {
  // 1. Delete SQLite database
  await invoke('delete_database');
  
  // 2. Clear migration flag
  localStorage.removeItem('migration_attempted');
  
  // 3. Restart app in localStorage mode
  window.location.reload();
}
```

---

## Sync Protocol Specification

### Protocol Overview

**Type:** Custom JSON-over-WebSocket  
**Transport:** Local network (mDNS discovery)  
**Encryption:** End-to-end (libsodium)  
**Conflict Resolution:** Last-Write-Wins (LWW) with timestamps  

### Discovery & Pairing

#### Step 1: mDNS Service Advertisement

**Desktop (Server):**
```rust
// Start mDNS service
let service = ServiceBuilder::new("_flow-kanban._tcp", 9898)
    .with_txt_record("version", "1.0")
    .with_txt_record("device_name", device_name)
    .with_txt_record("device_id", device_id)
    .build()
    .unwrap();

mdns.register(service)?;
```

**Mobile (Client):**
```javascript
// Discover services
import Zeroconf from 'react-native-zeroconf';

const zeroconf = new Zeroconf();
zeroconf.scan('_flow-kanban._tcp', 'local.');

zeroconf.on('resolved', (service) => {
  console.log('Found Flow desktop:', service.name);
  // Show in UI for user to select
});
```

#### Step 2: Pairing Flow

```
┌─────────────┐                           ┌─────────────┐
│   Desktop   │                           │   Mobile    │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │  1. User: "Enable Sync"                │
       │     Generate 6-digit PIN               │
       │     Display PIN on screen              │
       │                                         │
       │  2. User: Tap "Pair Device"    ◄───────┤
       │                                         │
       │  3. Discover via mDNS          ◄───────┤
       │                                         │
       │  4. Show available devices     ◄───────┤
       │     User selects Desktop               │
       │                                         │
       │  5. Prompt for PIN             ◄───────┤
       │     User enters PIN                    │
       │                                         │
       │  6. Connect WebSocket          ◄──────►│
       │                                         │
       │  7. Exchange pairing request   ◄──────►│
       │     { type: 'pair', pin: '123456' }    │
       │                                         │
       │  8. Verify PIN                         │
       │     If correct: Exchange keys          │
       │     If wrong: Reject                   │
       │                                         │
       │  9. Generate key pairs         ◄──────►│
       │     (ECDH - X25519)                    │
       │                                         │
       │ 10. Exchange public keys       ◄──────►│
       │     Derive shared secret               │
       │                                         │
       │ 11. Store pairing               ◄──────►│
       │     Save device ID + public key        │
       │                                         │
       │ 12. Pairing complete! ✅       ◄──────►│
       │     Ready for sync                     │
       │                                         │
```

#### Step 3: Pairing Data Structure

```javascript
// Stored in sync_metadata table
const pairedDevice = {
  deviceId: 'mobile-abc-123',
  deviceName: 'iPhone 14',
  deviceType: 'ios',
  publicKey: 'base64-encoded-public-key',
  pairedAt: 1734512345000,
  lastSeenAt: 1734512345000,
  lastSyncAt: 1734512345000
};

// Save as JSON in sync_metadata
await db.query(
  'INSERT OR REPLACE INTO sync_metadata VALUES (?, ?)',
  ['paired_device_mobile-abc-123', JSON.stringify(pairedDevice)]
);
```

### Sync Protocol Messages

#### Message Format

```typescript
// Base message structure
interface SyncMessage {
  type: string;
  messageId: string;
  timestamp: number;
  deviceId: string;
  payload: any;
}

// All messages are encrypted:
const encryptedMessage = {
  nonce: 'base64-nonce',
  ciphertext: 'base64-encrypted-payload',
  tag: 'base64-auth-tag'
};
```

#### Message Types

**1. SYNC_REQUEST**
```json
{
  "type": "sync_request",
  "messageId": "msg-123",
  "timestamp": 1734512345000,
  "deviceId": "mobile-abc-123",
  "payload": {
    "lastSyncTime": 1734512000000,
    "changes": [
      {
        "entityType": "card",
        "action": "create",
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

**2. SYNC_RESPONSE**
```json
{
  "type": "sync_response",
  "messageId": "msg-124",
  "timestamp": 1734512346000,
  "deviceId": "desktop-xyz-789",
  "payload": {
    "status": "success",
    "receivedChanges": 3,
    "appliedChanges": 3,
    "conflicts": [],
    "changes": [
      {
        "entityType": "card",
        "action": "update",
        "entity": { /* server's newer card */ }
      }
    ],
    "serverTime": 1734512346000
  }
}
```

**3. SYNC_CONFLICT**
```json
{
  "type": "sync_conflict",
  "messageId": "msg-125",
  "timestamp": 1734512347000,
  "deviceId": "desktop-xyz-789",
  "payload": {
    "conflicts": [
      {
        "entityType": "card",
        "entityId": 12345,
        "clientVersion": {
          "title": "Design Review",
          "updatedAt": 1734512345000
        },
        "serverVersion": {
          "title": "UX Review",
          "updatedAt": 1734512346000
        },
        "resolution": "server_wins",
        "resolvedEntity": { /* server version */ }
      }
    ]
  }
}
```

**4. SYNC_ACK**
```json
{
  "type": "sync_ack",
  "messageId": "msg-126",
  "timestamp": 1734512348000,
  "deviceId": "mobile-abc-123",
  "payload": {
    "acknowledgedMessageId": "msg-124",
    "status": "complete",
    "newSyncTime": 1734512348000
  }
}
```

### Conflict Resolution Algorithm

```javascript
// Last-Write-Wins (LWW) Implementation
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
    // Exact same timestamp (rare) - use device ID as tiebreaker
    const winner = clientEntity.deviceId > serverEntity.deviceId ? 'client' : 'server';
    return {
      resolution: `${winner}_wins_tiebreaker`,
      winner,
      entity: winner === 'client' ? clientEntity : serverEntity
    };
  }
}

// Conflict examples:
// 1. Card updated on both devices
//    → Newer timestamp wins
// 2. Card deleted on one, updated on other
//    → Delete always wins (explicit user action)
// 3. Card moved to different columns
//    → Newer timestamp wins
// 4. Same timestamp (rare)
//    → Higher device ID wins (deterministic)
```

### Encryption Layer

```javascript
// Using libsodium (desktop: Rust, mobile: react-native-sodium)

// Key Exchange (ECDH)
const keyPair = sodium.crypto_box_keypair();
// Share public key, keep secret key private

// Derive shared secret
const sharedSecret = sodium.crypto_box_beforenm(
  theirPublicKey,
  mySecretKey
);

// Encrypt message
function encryptMessage(message, sharedSecret) {
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const plaintext = JSON.stringify(message);
  
  const ciphertext = sodium.crypto_box_easy_afternm(
    plaintext,
    nonce,
    sharedSecret
  );
  
  return {
    nonce: sodium.to_base64(nonce),
    ciphertext: sodium.to_base64(ciphertext)
  };
}

// Decrypt message
function decryptMessage(encrypted, sharedSecret) {
  const nonce = sodium.from_base64(encrypted.nonce);
  const ciphertext = sodium.from_base64(encrypted.ciphertext);
  
  const plaintext = sodium.crypto_box_open_easy_afternm(
    ciphertext,
    nonce,
    sharedSecret
  );
  
  return JSON.parse(plaintext);
}
```

### Attachment Sync

```javascript
// Attachment sync flow
async function syncAttachments(cardId, attachments) {
  for (const attachment of attachments) {
    // Check if attachment exists on peer
    const existsOnPeer = await checkAttachmentExists(attachment.hash);
    
    if (!existsOnPeer) {
      // Mobile → Desktop: Always sync (desktop has unlimited space)
      // Desktop → Mobile: Check size limit
      if (isMobile && attachment.size > 10 * 1024 * 1024) {
        // Store metadata only, mark as "desktop-only"
        await storeAttachmentMetadata(attachment, {
          availableOn: ['desktop'],
          needsDownload: true
        });
      } else {
        // Transfer file in chunks
        await transferAttachment(attachment);
      }
    }
  }
}

// Chunked file transfer
async function transferAttachment(attachment) {
  const chunkSize = 64 * 1024; // 64KB chunks
  const fileData = await readFile(attachment.filepath);
  const totalChunks = Math.ceil(fileData.length / chunkSize);
  
  for (let i = 0; i < totalChunks; i++) {
    const chunk = fileData.slice(i * chunkSize, (i + 1) * chunkSize);
    
    await sendMessage({
      type: 'attachment_chunk',
      payload: {
        attachmentId: attachment.id,
        chunkIndex: i,
        totalChunks,
        data: base64Encode(chunk),
        hash: sha256(chunk)
      }
    });
    
    // Wait for acknowledgment
    await waitForAck();
  }
}
```

---

## Mobile UI Specifications

### Design System: Japandi Mobile

#### Color Palette

```javascript
// packages/shared/src/theme/colors.js
export const colors = {
  // Backgrounds
  bg: {
    primary: '#fafaf9',      // Warm white
    secondary: '#f5f5f4',    // Light stone
    tertiary: '#e7e5e4',     // Soft taupe
    elevated: '#ffffff',     // Pure white for cards
  },
  
  // Text
  text: {
    primary: '#1c1917',      // Deep charcoal
    secondary: '#57534e',    // Medium gray
    tertiary: '#a8a29e',     // Light gray
    disabled: '#d6d3d1',     // Very light gray
  },
  
  // Accents
  accent: '#78716c',         // Warm gray
  border: '#e7e5e4',         // Subtle border
  shadow: 'rgba(0,0,0,0.08)', // Soft shadow
  overlay: 'rgba(0,0,0,0.5)', // Modal overlay
  
  // Columns (same as desktop)
  columns: {
    inbox: '#e7e5e4',
    next: '#d6d3d1',
    inProgress: '#a8a29e',
    done: '#78716c',
  },
  
  // Status colors
  success: '#6b8e23',        // Olive green
  warning: '#d4a574',        // Warm tan
  error: '#b05454',          // Muted red
  info: '#7e8d99',           // Blue-gray
};
```

#### Typography

```javascript
// packages/shared/src/theme/typography.js
export const typography = {
  // Use iOS system font (SF Pro)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Sizes (optimized for mobile readability)
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  
  // Weights
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing (minimal in Japandi)
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
  
  // Styles
  h1: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 1.4,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.4,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 1.3,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0,
  },
};
```

#### Spacing

```javascript
// packages/shared/src/theme/spacing.js
// 8pt grid system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Component-specific spacing
export const componentSpacing = {
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 12,
  },
  button: {
    paddingX: 24,
    paddingY: 12,
    borderRadius: 24, // Pill shape
  },
  input: {
    paddingX: 16,
    paddingY: 12,
    borderRadius: 8,
  },
  modal: {
    padding: 24,
    borderRadius: 16,
  },
};
```

#### Shadows

```javascript
// packages/shared/src/theme/shadows.js
export const shadows = {
  // Soft, diffused shadows (Japandi aesthetic)
  none: 'none',
  
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

### Screen Layouts

#### 1. Board Screen (Main)

```
┌────────────────────────────────────┐
│ ☰  Flow                     🔄 ⚙️  │ Header (56pt)
├────────────────────────────────────┤
│ [Team A] [Team B] [All] [×]       │ Filter chips (44pt)
├────────────────────────────────────┤
│                                    │
│  ← [In Progress] →                 │ Column carousel
│  ═════════════════                 │ (swipeable, snap)
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Design system updates        │ │
│  │ ┌──────┐ ┌──────┐           │ │ Card (auto height)
│  │ │Team A│ │Design│           │ │ - 16pt padding
│  │ └──────┘ └──────┘           │ │ - 12pt border radius
│  │ 📎 2 · 📅 Dec 25            │ │ - Soft shadow
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ User testing for checkout    │ │
│  │ ┌──────┐                     │ │
│  │ │Team B│                     │ │
│  │ └──────┘                     │ │
│  └──────────────────────────────┘ │
│                                    │
│                                    │
│              [ + New Card ]        │ Floating button
│                                    │
└────────────────────────────────────┘
```

**Portrait Mode (< 768pt width):**
- Single column visible
- Swipe left/right to navigate columns
- Pull-to-refresh gesture
- Infinite scroll for cards

**Landscape/iPad Mode (≥ 768pt width):**
- Multiple columns visible
- Drag & drop between columns
- More desktop-like experience

#### 2. Card Detail Modal

```
┌────────────────────────────────────┐
│ ← Card Details              [···]  │ Header with back & menu
├────────────────────────────────────┤
│                                    │
│ Title                              │
│ ┌────────────────────────────────┐│
│ │ Design system updates          ││ Text input (auto-grow)
│ └────────────────────────────────┘│
│                                    │
│ Area                               │
│ ┌────────────────────────────────┐│
│ │ Team A                      ▼ ││ Dropdown
│ └────────────────────────────────┘│
│                                    │
│ Type                               │
│ ┌────────────────────────────────┐│
│ │ Design                      ▼ ││
│ └────────────────────────────────┘│
│                                    │
│ Column                             │
│ ┌────────────────────────────────┐│
│ │ In Progress                 ▼ ││
│ └────────────────────────────────┘│
│                                    │
│ Due Date                           │
│ ┌────────────────────────────────┐│
│ │ Dec 25, 2024                📅││ Date picker
│ └────────────────────────────────┘│
│                                    │
│ Notes                              │
│ ┌────────────────────────────────┐│
│ │                                ││
│ │                                ││ Multi-line text
│ │                                ││
│ └────────────────────────────────┘│
│                                    │
│ Attachments                        │
│ ┌───────┐ ┌───────┐              │
│ │ 📄 Doc│ │ 🖼️ Img│              │ Attachment tiles
│ │ 2.5MB │ │ 1.2MB │              │
│ └───────┘ └───────┘              │
│          [ + Add ]                │
│                                    │
│                                    │
│         [ Save ]  [ Delete ]       │ Action buttons
│                                    │
└────────────────────────────────────┘
```

**Interactions:**
- Swipe down to dismiss
- Tap outside to close
- Auto-save on field change (after 500ms debounce)
- Haptic feedback on save

#### 3. Sync Screen

```
┌────────────────────────────────────┐
│ ← Sync                             │
├────────────────────────────────────┤
│                                    │
│ 🔄 Sync Status                     │
│                                    │
│ ┌────────────────────────────────┐│
│ │ ✓ Synced with Desktop          ││
│ │   Last synced: 2 minutes ago   ││ Status card
│ │   127 cards · 45 attachments   ││
│ └────────────────────────────────┘│
│                                    │
│         [ Sync Now ]               │ Primary button
│                                    │
│ Paired Devices                     │
│                                    │
│ ┌────────────────────────────────┐│
│ │ 💻 My MacBook Pro              ││
│ │    Last seen: Active now       ││ Device card
│ │    Paired: Dec 15, 2024        ││
│ │                      [ Unpair ]││
│ └────────────────────────────────┘│
│                                    │
│         [ + Pair New Device ]      │
│                                    │
│ Settings                           │
│                                    │
│ □ Auto-sync on launch              │
│ □ Background sync                  │ Checkboxes
│ ☑ Sync on WiFi only                │
│                                    │
└────────────────────────────────────┘
```

#### 4. Pairing Flow

```
Step 1: Scan for devices
┌────────────────────────────────────┐
│ ← Pair Device                      │
├────────────────────────────────────┤
│                                    │
│      🔍 Scanning for devices...    │
│                                    │
│ ┌────────────────────────────────┐│
│ │ 💻 My MacBook Pro              ││
│ │    192.168.1.10                ││ Found device
│ │                      [ Pair ]   ││
│ └────────────────────────────────┘│
│                                    │
│ Make sure both devices are on the  │
│ same WiFi network.                 │
│                                    │
│         [ Rescan ]                 │
│                                    │
└────────────────────────────────────┘

Step 2: Enter PIN
┌────────────────────────────────────┐
│ ← Pairing with MacBook Pro         │
├────────────────────────────────────┤
│                                    │
│ Enter the 6-digit code shown on    │
│ your desktop:                      │
│                                    │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 ││ PIN input
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│                                    │
│                                    │
│         [ ← ] [ Cancel ] [ ✓ ]    │ Keypad
│         [ 1 ] [  2  ] [ 3 ]       │
│         [ 4 ] [  5  ] [ 6 ]       │
│         [ 7 ] [  8  ] [ 9 ]       │
│         [   ] [  0  ] [ ⌫ ]       │
│                                    │
└────────────────────────────────────┘

Step 3: Success
┌────────────────────────────────────┐
│                                    │
│                                    │
│          ✅                        │
│                                    │
│      Pairing Successful!           │
│                                    │
│ Your iPhone is now paired with     │
│ MacBook Pro.                       │
│                                    │
│ Data will sync automatically when  │
│ both devices are on the same       │
│ network.                           │
│                                    │
│                                    │
│         [ Done ]                   │
│                                    │
└────────────────────────────────────┘
```

### Component Library

#### Card Component

```typescript
// packages/mobile/src/components/Card.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows } from '@shared/theme';

interface CardProps {
  card: {
    id: number;
    title: string;
    area: string;
    type?: string;
    dueDate?: number;
    attachments: any[];
  };
  onPress: () => void;
  onLongPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ card, onPress, onLongPress }) => {
  const hasAttachments = card.attachments.length > 0;
  const hasDueDate = card.dueDate !== null;
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Text style={styles.title} numberOfLines={2}>
        {card.title}
      </Text>
      
      <View style={styles.pills}>
        <Pill label={card.area} />
        {card.type && <Pill label={card.type} />}
      </View>
      
      {(hasAttachments || hasDueDate) && (
        <View style={styles.metadata}>
          {hasAttachments && (
            <Text style={styles.metadataText}>
              📎 {card.attachments.length}
            </Text>
          )}
          {hasDueDate && (
            <Text style={styles.metadataText}>
              📅 {formatDate(card.dueDate)}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.elevated,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  title: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metadataText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
```

#### Column Component

```typescript
// packages/mobile/src/components/Column.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@shared/theme';
import { Card } from './Card';

interface ColumnProps {
  column: {
    id: string;
    label: string;
    color: string;
    wipLimit?: number;
  };
  cards: any[];
  onCardPress: (cardId: number) => void;
}

export const Column: React.FC<ColumnProps> = ({ column, cards, onCardPress }) => {
  const isOverLimit = column.wipLimit && cards.length > column.wipLimit;
  
  return (
    <View style={[styles.container, { backgroundColor: column.color }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{column.label}</Text>
        <Text style={[styles.count, isOverLimit && styles.countWarning]}>
          {cards.length}
          {column.wipLimit && ` / ${column.wipLimit}`}
        </Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
      >
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onPress={() => onCardPress(card.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  count: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  countWarning: {
    color: colors.warning,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  cardList: {
    paddingBottom: spacing.lg,
  },
});
```

### Animations & Interactions

```typescript
// Card drag animation
import { Animated, PanResponder } from 'react-native';

const CardDraggable: React.FC = ({ card }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Scale up animation
        Animated.spring(scale, {
          toValue: 1.05,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        // Scale down animation
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }).start();
        
        // Snap to position or return
        if (isValidDropZone(gesture)) {
          handleDrop(card, gesture);
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        transform: [
          { translateX: pan.x },
          { translateY: pan.y },
          { scale },
        ],
      }}
    >
      <Card card={card} />
    </Animated.View>
  );
};

// Fade in animation
const FadeIn: React.FC = ({ children, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={{ opacity }}>
      {children}
    </Animated.View>
  );
};
```

---

## Implementation Phases

### Phase 0: Desktop SQLite Migration (v0.3.0)
**Duration:** 2-3 weeks  
**Goal:** Migrate desktop from localStorage to SQLite

#### Tasks

- [ ] **Database Setup**
  - [ ] Add Tauri SQL plugin to dependencies
  - [ ] Create database schema file
  - [ ] Implement database initialization
  - [ ] Add migration system framework

- [ ] **Migration Implementation**
  - [ ] Create backup command (localStorage → JSON file)
  - [ ] Implement migration command (localStorage → SQLite)
  - [ ] Add data verification
  - [ ] Implement rollback mechanism
  - [ ] Create migration UI modal

- [ ] **Desktop App Updates**
  - [ ] Refactor cardStore to use SQLite
  - [ ] Update columnStore for SQLite
  - [ ] Update attributeStore for SQLite
  - [ ] Add device ID generation
  - [ ] Implement tombstone tracking

- [ ] **Testing**
  - [ ] Test migration with small dataset
  - [ ] Test migration with large dataset (1000+ cards)
  - [ ] Test migration failure scenarios
  - [ ] Test rollback functionality
  - [ ] Performance testing (query speed)

- [ ] **Documentation**
  - [ ] Update development guide
  - [ ] Create migration troubleshooting guide
  - [ ] Document database schema

#### Acceptance Criteria

- ✅ 100% data integrity (no cards lost)
- ✅ Migration completes in < 30s for 1000 cards
- ✅ Rollback works if migration fails
- ✅ App performance same or better than localStorage
- ✅ All existing features work identically

---

### Phase 1: Mobile App Foundation (v1.0.0-alpha)
**Duration:** 4-6 weeks  
**Goal:** Create iOS app with local functionality

#### Tasks

- [ ] **Project Setup**
  - [ ] Initialize React Native project
  - [ ] Configure TypeScript
  - [ ] Set up React Navigation
  - [ ] Configure iOS build settings
  - [ ] Add required dependencies
  - [ ] Set up development environment

- [ ] **Shared Package Enhancement**
  - [ ] Extract theme to shared package
  - [ ] Ensure models work in React Native
  - [ ] Test utilities in React Native context
  - [ ] Create platform-agnostic interfaces

- [ ] **Database Layer**
  - [ ] Integrate react-native-sqlite-storage
  - [ ] Implement database service
  - [ ] Create same schema as desktop
  - [ ] Add migration system (for future)
  - [ ] Implement CRUD operations

- [ ] **Core UI Components**
  - [ ] Card component
  - [ ] Column component
  - [ ] Button component
  - [ ] Input component
  - [ ] Modal component
  - [ ] Header component
  - [ ] Loading states
  - [ ] Empty states

- [ ] **Main Screens**
  - [ ] Board screen (column carousel)
  - [ ] Card detail modal
  - [ ] Settings screen
  - [ ] Filter UI

- [ ] **Business Logic**
  - [ ] Card CRUD operations
  - [ ] Column management
  - [ ] Area/Type filtering
  - [ ] Card positioning
  - [ ] Date handling

- [ ] **Polish**
  - [ ] Drag & drop cards
  - [ ] Pull-to-refresh
  - [ ] Haptic feedback
  - [ ] Animations
  - [ ] Keyboard handling
  - [ ] Accessibility labels

- [ ] **Testing**
  - [ ] Unit tests for business logic
  - [ ] Component tests
  - [ ] Integration tests
  - [ ] Manual testing on device

#### Acceptance Criteria

- ✅ All desktop features work on mobile
- ✅ Offline-first (no network needed)
- ✅ Japandi aesthetic maintained
- ✅ Smooth 60fps animations
- ✅ Works on iPhone 12 and newer
- ✅ No crashes or data loss

---

### Phase 2: Desktop P2P Infrastructure (v0.4.0)
**Duration:** 3-4 weeks  
**Goal:** Enable desktop as sync server

#### Tasks

- [ ] **Rust Sync Layer**
  - [ ] Add mDNS dependency (mdns crate)
  - [ ] Implement service discovery
  - [ ] Create WebSocket server
  - [ ] Add encryption layer (libsodium)
  - [ ] Implement pairing protocol
  - [ ] Create sync message handlers

- [ ] **Sync Commands**
  - [ ] start_sync_server command
  - [ ] stop_sync_server command
  - [ ] pair_device command
  - [ ] unpair_device command
  - [ ] process_sync_request command
  - [ ] get_sync_status command

- [ ] **Desktop UI**
  - [ ] Sync settings panel
  - [ ] Pairing UI (show PIN)
  - [ ] Paired devices list
  - [ ] Sync status indicator
  - [ ] Manual sync button
  - [ ] Sync log viewer (debug)

- [ ] **Database Updates**
  - [ ] Add sync_metadata table
  - [ ] Add tombstones table
  - [ ] Add sync_log table
  - [ ] Update queries for sync

- [ ] **Testing**
  - [ ] Unit tests for sync protocol
  - [ ] Integration tests
  - [ ] Network failure scenarios
  - [ ] Security testing

#### Acceptance Criteria

- ✅ Desktop advertises service on local network
- ✅ Pairing works with 6-digit PIN
- ✅ Encrypted communication verified
- ✅ Can handle multiple sync sessions
- ✅ Graceful handling of network issues

---

### Phase 3: Mobile P2P Integration (v1.0.0-beta)
**Duration:** 3-4 weeks  
**Goal:** Enable mobile to sync with desktop

#### Tasks

- [ ] **P2P Client**
  - [ ] Integrate react-native-zeroconf
  - [ ] Implement device discovery
  - [ ] Create WebSocket client
  - [ ] Add encryption (react-native-sodium)
  - [ ] Implement pairing flow
  - [ ] Handle connection lifecycle

- [ ] **Sync Service**
  - [ ] Create sync service module
  - [ ] Implement sync protocol
  - [ ] Add conflict resolution
  - [ ] Handle tombstones
  - [ ] Implement retry logic
  - [ ] Add sync queue

- [ ] **Mobile UI**
  - [ ] Sync screen
  - [ ] Pairing flow screens
  - [ ] Device selection
  - [ ] PIN entry
  - [ ] Sync progress indicator
  - [ ] Conflict resolution UI (if needed)
  - [ ] Settings (auto-sync, etc.)

- [ ] **State Management**
  - [ ] Sync state management
  - [ ] Connection state tracking
  - [ ] Optimistic UI updates
  - [ ] Rollback on conflict

- [ ] **Testing**
  - [ ] End-to-end sync tests
  - [ ] Conflict scenarios
  - [ ] Large dataset sync
  - [ ] Network interruption tests
  - [ ] Battery impact testing

#### Acceptance Criteria

- ✅ Discovers desktop on local network
- ✅ Pairing completes successfully
- ✅ Sync works bidirectionally
- ✅ Conflicts resolved automatically
- ✅ No data loss in any scenario
- ✅ Sync completes in < 5s for typical dataset

---

### Phase 4: Attachment Sync (v1.1.0)
**Duration:** 2-3 weeks  
**Goal:** Sync file attachments between devices

#### Tasks

- [ ] **Attachment Storage**
  - [ ] Implement file storage on mobile
  - [ ] Add size limit enforcement (10MB)
  - [ ] Create thumbnail generation
  - [ ] Implement hash-based deduplication

- [ ] **Sync Protocol Extension**
  - [ ] Add attachment metadata sync
  - [ ] Implement chunked file transfer
  - [ ] Add progress tracking
  - [ ] Handle transfer interruption
  - [ ] Implement on-demand download

- [ ] **UI Updates**
  - [ ] Attachment list in card detail
  - [ ] Upload progress indicator
  - [ ] Download progress indicator
  - [ ] "View on Desktop" placeholders
  - [ ] Attachment preview

- [ ] **Testing**
  - [ ] Small file sync
  - [ ] Large file sync (near limit)
  - [ ] Multiple attachments
  - [ ] Network interruption during transfer
  - [ ] Storage full scenarios

#### Acceptance Criteria

- ✅ Small attachments sync automatically
- ✅ Large attachments (>10MB) show placeholder
- ✅ On-demand download works
- ✅ Progress indicators accurate
- ✅ No duplicate storage (deduplication works)

---

### Phase 5: Polish & Testing (v1.0.0)
**Duration:** 2-3 weeks  
**Goal:** Production-ready release

#### Tasks

- [ ] **UX Polish**
  - [ ] Smooth all animations
  - [ ] Add loading states everywhere
  - [ ] Improve error messages
  - [ ] Add empty states
  - [ ] Optimize performance
  - [ ] Add haptic feedback

- [ ] **Error Handling**
  - [ ] Network errors
  - [ ] Sync conflicts
  - [ ] Storage full
  - [ ] Database errors
  - [ ] Crash recovery

- [ ] **Documentation**
  - [ ] User guide
  - [ ] Pairing instructions
  - [ ] Troubleshooting guide
  - [ ] FAQ
  - [ ] Privacy policy update

- [ ] **Testing**
  - [ ] Full regression testing
  - [ ] Performance testing
  - [ ] Battery life testing
  - [ ] Beta testing (TestFlight)
  - [ ] Security audit

- [ ] **App Store Preparation**
  - [ ] Screenshots
  - [ ] App Store description
  - [ ] Privacy details
  - [ ] App Store Connect setup

#### Acceptance Criteria

- ✅ No known critical bugs
- ✅ Performance metrics met
- ✅ Beta testers satisfied
- ✅ App Store submission approved
- ✅ Documentation complete

---

## Testing Strategy

### Unit Tests

```typescript
// Example: Conflict resolution tests
describe('ConflictResolver', () => {
  test('newer timestamp wins', () => {
    const client = {
      id: 1,
      title: 'Client Title',
      updatedAt: 1000,
    };
    const server = {
      id: 1,
      title: 'Server Title',
      updatedAt: 2000,
    };
    
    const result = resolveConflict(client, server);
    
    expect(result.winner).toBe('server');
    expect(result.entity.title).toBe('Server Title');
  });
  
  test('delete always wins', () => {
    const client = {
      id: 1,
      action: 'delete',
      deletedAt: 1000,
    };
    const server = {
      id: 1,
      title: 'Updated Title',
      updatedAt: 2000,
    };
    
    const result = resolveConflict(client, server);
    
    expect(result.winner).toBe('delete');
    expect(result.entity).toBeNull();
  });
  
  test('same timestamp uses device ID tiebreaker', () => {
    const client = {
      id: 1,
      title: 'Client Title',
      updatedAt: 1000,
      deviceId: 'device-b',
    };
    const server = {
      id: 1,
      title: 'Server Title',
      updatedAt: 1000,
      deviceId: 'device-a',
    };
    
    const result = resolveConflict(client, server);
    
    expect(result.winner).toBe('client');
    expect(result.resolution).toContain('tiebreaker');
  });
});
```

### Integration Tests

```typescript
// Example: End-to-end sync test
describe('Sync Integration', () => {
  let desktopDb: Database;
  let mobileDb: Database;
  let syncServer: SyncServer;
  
  beforeEach(async () => {
    desktopDb = await createTestDatabase();
    mobileDb = await createTestDatabase();
    syncServer = await startSyncServer();
  });
  
  test('sync new card from mobile to desktop', async () => {
    // 1. Create card on mobile
    const card = await mobileDb.createCard({
      title: 'Test Card',
      area: 'team-a',
      column: 'inbox',
    });
    
    // 2. Trigger sync
    await syncService.sync();
    
    // 3. Verify card exists on desktop
    const desktopCard = await desktopDb.getCard(card.id);
    expect(desktopCard).toBeDefined();
    expect(desktopCard.title).toBe('Test Card');
  });
  
  test('handle conflict - server wins', async () => {
    // 1. Create card on both devices
    const desktopCard = await desktopDb.createCard({
      id: 1,
      title: 'Desktop Version',
      updatedAt: 2000,
    });
    const mobileCard = await mobileDb.createCard({
      id: 1,
      title: 'Mobile Version',
      updatedAt: 1000,
    });
    
    // 2. Trigger sync
    await syncService.sync();
    
    // 3. Verify server version won
    const finalMobileCard = await mobileDb.getCard(1);
    expect(finalMobileCard.title).toBe('Desktop Version');
  });
});
```

### Performance Benchmarks

```typescript
// Target metrics
const PERFORMANCE_TARGETS = {
  // App launch
  coldStart: 2000, // ms
  warmStart: 500,  // ms
  
  // Database operations
  queryCards: 50,       // ms for 1000 cards
  insertCard: 10,       // ms
  updateCard: 10,       // ms
  deleteCard: 10,       // ms
  
  // Sync operations
  discoveryTime: 3000,  // ms to find devices
  pairingTime: 5000,    // ms to complete pairing
  syncTime: 5000,       // ms to sync 100 changes
  
  // UI responsiveness
  frameRate: 60,        // fps
  inputLatency: 100,    // ms
  
  // Network
  messageRoundTrip: 100, // ms on local network
};

// Performance tests
describe('Performance', () => {
  test('query performance meets target', async () => {
    // Create 1000 cards
    await createManyCards(1000);
    
    // Measure query time
    const start = Date.now();
    const cards = await db.query('SELECT * FROM cards WHERE column = ?', ['inbox']);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(PERFORMANCE_TARGETS.queryCards);
  });
  
  test('sync performance meets target', async () => {
    // Create 100 changes
    const changes = await createManyChanges(100);
    
    // Measure sync time
    const start = Date.now();
    await syncService.sync();
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(PERFORMANCE_TARGETS.syncTime);
  });
});
```

---

## Security & Privacy

### Security Principles

1. **End-to-End Encryption**
   - All sync data encrypted before leaving device
   - Server (desktop) never sees plaintext
   - libsodium for cryptographic primitives

2. **Local-First**
   - All data stored locally
   - No cloud services
   - No external dependencies

3. **Network Security**
   - Local network only (mDNS)
   - TLS for future self-hosted server
   - No internet traffic (except for updates)

4. **Access Control**
   - PIN-based pairing
   - Device trust management
   - Unpair any time

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **Network Sniffing** | End-to-end encryption with libsodium |
| **MITM Attack** | Key exchange verification, PIN pairing |
| **Unauthorized Pairing** | 6-digit PIN, expires after 5 minutes |
| **Data Theft (Physical)** | iOS encryption at rest, app sandboxing |
| **Sync Tampering** | Message authentication (HMAC) |
| **Replay Attacks** | Timestamp validation, nonce usage |

### Privacy Guarantees

- ✅ No telemetry or analytics
- ✅ No user accounts
- ✅ No cloud storage
- ✅ No third-party services
- ✅ No data sharing
- ✅ Open source (auditable)

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Data loss during migration** | Medium | Critical | Automatic backup, verification, rollback |
| **Sync conflicts unresolvable** | Low | High | LWW algorithm, manual override option |
| **Poor mobile performance** | Low | Medium | React Native optimization, profiling |
| **Network unreliability** | Medium | Medium | Retry logic, queue system, offline mode |
| **Encryption overhead** | Low | Low | libsodium is optimized, minimal impact |
| **Battery drain** | Medium | Medium | Conservative sync frequency, optimize |

### Project Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Scope creep** | High | Medium | Strict phase boundaries, defer features |
| **Timeline delays** | Medium | Low | Phases are independent, can ship incrementally |
| **React Native issues** | Low | High | Stable version, community support, fallback plan |
| **App Store rejection** | Low | High | Follow guidelines, privacy-first helps |
| **User adoption low** | Medium | Medium | Beta testing, gather feedback, iterate |

---

## Success Metrics

### Technical KPIs

- **Performance:**
  - App launch < 2s (cold start)
  - Database queries < 50ms (1000 cards)
  - Sync completes < 5s (100 changes)
  - 60fps animations

- **Reliability:**
  - 0 data loss incidents
  - < 0.1% crash rate
  - 99% sync success rate
  - < 5s recovery from network failure

- **Security:**
  - 0 security vulnerabilities
  - 100% encrypted communication
  - Passed security audit

### User KPIs

- **Adoption:**
  - 50% of desktop users try mobile (first 3 months)
  - 80% retention after 7 days
  - 4.5+ stars on App Store

- **Usage:**
  - Average 3 syncs per day
  - Average 5 cards created per week
  - 70% of users pair devices

- **Satisfaction:**
  - NPS > 50
  - < 5% negative reviews
  - Beta tester approval

---

## Decision Log

### Architectural Decisions

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2024-12-18 | Use React Native for mobile | Code reuse, cross-platform, shared business logic | Swift Native (no code reuse), Capacitor (performance concerns) |
| 2024-12-18 | SQLite for storage | Sync support, performance, proven technology | Keep localStorage (limited sync), Realm (complexity) |
| 2024-12-18 | P2P sync (no server) | Privacy-first, no third-party, user control | Cloud sync (third-party), iCloud (Apple only) |
| 2024-12-18 | Last-Write-Wins conflict resolution | Simple, works for personal use, deterministic | CRDTs (complexity), Manual resolution (UX friction) |
| 2024-12-18 | 6-digit PIN pairing | Simple UX, sufficient security for local network | QR code (camera permissions), Password (UX friction) |
| 2024-12-18 | 10MB mobile attachment limit | Storage constraints, typical use cases | No limit (storage issues), 5MB (too restrictive) |
| 2024-12-18 | Custom Japandi UI (not native) | Brand consistency, unique identity | iOS native (generic look) |
| 2024-12-18 | Conservative sync (manual-first) | Battery life, user control, privacy mindset | Real-time (battery drain), Background only (confusing) |

### Technical Choices

| Component | Choice | Reason |
|-----------|--------|--------|
| **Encryption** | libsodium | Battle-tested, fast, available on all platforms |
| **Discovery** | mDNS/Bonjour | Standard for local network, no setup needed |
| **Protocol** | JSON over WebSocket | Human-readable, debuggable, flexible |
| **Database** | SQLite | Industry standard, great mobile support |
| **Navigation** | React Navigation | De facto standard, well-maintained |
| **State** | React hooks + Context | Simple, no extra dependencies |

---

## Next Steps

### Immediate Actions (Next Week)

1. **Review this specification**
   - Confirm all architectural decisions
   - Identify any missing requirements
   - Approve before implementation

2. **Set up development environment**
   - Clone repo
   - Install dependencies
   - Test builds

3. **Begin Phase 0 (SQLite Migration)**
   - Create feature branch
   - Set up database schema
   - Implement migration logic

### Questions to Answer

- [ ] Is SQLite migration for desktop confirmed for v0.3.0?
- [ ] Are we starting with Phase 0 or waiting?
- [ ] Do we need design mockups before mobile development?
- [ ] What's the beta testing plan (number of users, timeline)?
- [ ] Should we set up a project board for tracking?

---

## Appendix

### Glossary

- **LWW**: Last-Write-Wins - conflict resolution strategy
- **P2P**: Peer-to-Peer - direct device-to-device communication
- **mDNS**: Multicast DNS - local network service discovery
- **ECDH**: Elliptic Curve Diffie-Hellman - key exchange algorithm
- **Tombstone**: Marker for deleted entities (for sync)
- **WIP Limit**: Work In Progress limit - max cards in a column

### References

- [Tauri Documentation](https://tauri.app/)
- [React Native Documentation](https://reactnative.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [libsodium Documentation](https://doc.libsodium.org/)
- [mDNS RFC 6762](https://datatracker.ietf.org/doc/html/rfc6762)

---

**Document Status:** ✅ Complete and Ready for Implementation  
**Last Updated:** December 18, 2024  
**Next Review:** After Phase 0 completion
