# Future Feature Specifications

⚠️ **These are design documents for features that are NOT yet implemented.**

This directory contains detailed specifications for planned features that will be developed in future releases (v1.0.0+).

---

## 📅 Implementation Timeline

### Phase 2: Mobile & Sync (v1.1.0+)

**Status:** Design phase

**Specifications:**
- [Mobile Sync Specification](MOBILE_SYNC_SPECIFICATION.md) - 2200+ line spec for mobile-desktop sync
- [P2P Sync Architecture](p2p-sync/) - Peer-to-peer synchronization design

**Prerequisites:**
- Desktop app reaches v1.0.0
- Core features stabilized
- Data layer architecture finalized
- Export/import functionality complete

---

## ⚠️ Important Notes

### These Are Design Documents Only

- **No implementation exists**
- Specs may change during development
- Technical constraints may alter designs
- Timeline is tentative

### Current Development Focus

The project is currently focused on:
- **Desktop app stability** (v0.2.x → v1.0.0)
- **Core features** (see [IMPROVEMENTS.md](../internal/IMPROVEMENTS.md))
- **Bug fixes and UX polish**

Mobile and sync features are **future work**.

---

## 🔍 What's Here

### Mobile Sync Specification
Comprehensive design for mobile-desktop data synchronization including:
- Conflict resolution strategies
- Offline-first architecture
- Real-time sync protocols
- Data model considerations

### P2P Sync System
Detailed BLI (Bite-Sized Task) breakdown for peer-to-peer synchronization:
- mDNS service discovery
- WebSocket server implementation
- Encryption and PIN pairing
- Conflict resolution
- UI components

---

## 📖 For Developers

### If You Want to Contribute

1. **Focus on Desktop First** - Help stabilize v0.2.x → v1.0.0
2. **Review Current Backlog** - See [IMPROVEMENTS.md](../internal/IMPROVEMENTS.md)
3. **Understand the Vision** - Read these specs to understand future direction
4. **Wait for Kickoff** - Don't implement these features yet

### When Development Starts

These specs will be:
- Reviewed and updated based on learnings
- Broken down into smaller tasks
- Prioritized and scheduled
- Moved to active development docs

---

## 🗺️ Context

### Why Are These Specs Here?

- **Vision Planning** - Thinking ahead helps current architecture decisions
- **Documentation** - Captures ideas while they're fresh
- **Collaboration** - Provides context for contributors
- **Reference** - Historical record of design thinking

### Why Not Implement Now?

- **YAGNI** - You Aren't Gonna Need It (yet)
- **Stability First** - Desktop needs to be rock-solid
- **Learn First** - Current implementation informs future design
- **Resource Focus** - Better to finish current features well

---

## 📚 Related Documentation

**Current Work:**
- [IMPROVEMENTS.md](../internal/IMPROVEMENTS.md) - Active backlog
- [ARCHITECTURE.md](../internal/ARCHITECTURE.md) - Current architecture
- [DEVELOPMENT.md](../internal/DEVELOPMENT.md) - Development guide

**User Documentation:**
- [Main README](../../README.md) - Current features and roadmap
- [Installation Guide](../external/INSTALLATION_GUIDE.md)

---

**Last Updated:** March 2026
**Status:** These features are in the design/planning phase, not implementation.
