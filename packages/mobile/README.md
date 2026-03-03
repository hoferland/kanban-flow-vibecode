# Flow Kanban Mobile

⚠️ **STATUS: NOT IMPLEMENTED - PLANNED FOR FUTURE RELEASE**

This package is a placeholder for the future React Native mobile application.

## Current Status

- **Phase:** Planning / Scaffolding Only
- **Implementation:** Planned for v1.1.0+
- **Last Updated:** March 2026

## What's Here

This directory contains basic React Native scaffolding but **NO Flow Kanban implementation**.

**What exists:**
- ✅ Boilerplate React Native project structure
- ✅ Theme system (to be synced with shared package)
- ❌ No Flow screens implemented
- ❌ No data synchronization
- ❌ No kanban functionality
- ❌ No connection to desktop app

## When Will Mobile Be Available?

Mobile development is planned after the desktop app reaches v1.0.0 with:

**Prerequisites:**
- ✅ Stable core desktop features
- ✅ Export/import functionality
- ✅ Sync architecture designed
- ✅ Data layer ready for mobile integration

**Estimated Timeline:** v1.1.0+ (see main project roadmap)

## Roadmap

See the main project documentation for mobile plans:
- [Project Roadmap](../../README.md#-roadmap)
- [Improvements Backlog](../../docs/internal/IMPROVEMENTS.md)
- [Mobile Sync Specification](../../docs/internal/MOBILE_SYNC_SPECIFICATION.md) (future design doc)

## For Developers

If you're interested in contributing to mobile development:

1. **Wait for Desktop Stability** - Focus is currently on desktop app (v0.2.x → v1.0)
2. **Review Future Specs** - See `docs/internal/MOBILE_SYNC_SPECIFICATION.md`
3. **Follow Updates** - Watch for mobile development kickoff announcement
4. **Don't Start Yet** - Mobile architecture decisions are pending

## Testing This Package

**⚠️ DO NOT expect this package to work.**

If you must run it (for scaffolding reference only):

```bash
cd packages/mobile

# Install dependencies
npm install

# Run on iOS
npm run ios

# Run on Android
npm run android
```

You will see a React Native demo app, NOT Flow Kanban.

---

**Important:** This is scaffolding only. All Flow Kanban functionality exists in `packages/desktop/`.
