---
status: complete
priority: p1
issue_id: 001
tags: [code-review, architecture, documentation, database]
dependencies: []
created: 2026-03-03
completed: 2026-03-03
---

# Documentation-Code Mismatch: Database Layer

## Problem Statement

**Critical documentation drift:** Project documentation claims LocalStorage is the current data persistence mechanism and SQLite database is a "future feature" (planned for v1.0+), but the working directory contains uncommitted code showing `cardStore.js` already uses SQLite via Tauri backend commands.

**Why this matters:**
- Misleads developers about current architecture
- Creates confusion during onboarding
- Documentation doesn't reflect actual implementation
- Risk of accidental data migration issues
- Blocks accurate understanding of data flow

**Impact:** High - Blocks accurate understanding of project architecture, creates technical debt in documentation

## Findings

**Source:** Architecture Strategist review agent

**Evidence from architecture review:**

1. **Documentation Claims (packages/desktop/src-tauri/src/database/README.md):**
   - "Database layer is prepared but not currently used"
   - "LocalStorage is current, SQLite planned for v1.0+"
   - Entire README presents database as future feature

2. **Actual Code (uncommitted changes in cardStore.js):**
   ```javascript
   invoke('db_get_all_cards')
   invoke('db_create_card', {...})
   invoke('db_update_card', {...})
   invoke('db_delete_card', {...})
   ```

3. **Files Affected:**
   - `packages/desktop/src-tauri/src/database/README.md` - Claims database not used
   - `packages/desktop/src/stores/cardStore.js` - Uses SQLite via Tauri commands
   - `docs/internal/ARCHITECTURE.md` - May contain outdated storage claims
   - `README.md` - Lists "LocalStorage (browser-based, persisted)" as current storage

**Related Issues:**
- Uncommitted changes in cardStore.js (see todo #002)
- Empty DATABASE.md file (see todo #004)

## Proposed Solutions

### Option 1: Update Documentation to Match Reality (Recommended)

**Approach:** Accept that SQLite is the current implementation, update all documentation

**Actions:**
1. Update database/README.md:
   - Change status from "future feature" to "current implementation"
   - Document actual SQLite schema and Tauri commands
   - Explain when/how migration from LocalStorage occurred
2. Update ARCHITECTURE.md:
   - List SQLite as current data persistence layer
   - Document Tauri backend database commands
3. Update README.md:
   - Change storage line from "LocalStorage" to "SQLite (via Tauri)"
4. Commit the cardStore.js changes that use database

**Pros:**
- Documentation matches reality
- Clear for new developers
- Honest about current state

**Cons:**
- Need to document migration path (if LocalStorage was ever used)
- May need to update release notes

**Effort:** Medium (2-3 hours to update all docs comprehensively)
**Risk:** Low

### Option 2: Revert Code to Match Documentation

**Approach:** Remove SQLite usage from cardStore.js, revert to LocalStorage

**Actions:**
1. Revert cardStore.js to use browser LocalStorage API
2. Remove or document database layer as truly unused
3. Keep documentation as-is

**Pros:**
- Documentation already correct
- Simpler architecture (no Rust backend for storage)
- No Tauri backend database dependency

**Cons:**
- Loses SQLite benefits (performance, query capabilities, data integrity)
- May break existing user data if SQLite was already deployed
- Work already done on database layer wasted

**Effort:** Medium (2-3 hours to revert and test)
**Risk:** High - May break existing user data, lose SQLite benefits

### Option 3: Hybrid Approach - Document Transition

**Approach:** Document that migration is in progress

**Actions:**
1. Update documentation to reflect "transition phase"
2. Document both LocalStorage (legacy) and SQLite (current)
3. Explain migration strategy
4. Set timeline for completing transition

**Pros:**
- Honest about current state
- Explains why both might exist
- Clear migration path

**Cons:**
- More complex documentation
- May confuse developers about which to use
- Implies ongoing work that may not be planned

**Effort:** Medium (3-4 hours for comprehensive transition docs)
**Risk:** Medium - Complexity may cause confusion

## Recommended Action

**Option 1 (Recommended):** Update Documentation to Match Reality
- Accept that SQLite is the current implementation
- Update all documentation to reflect actual architecture
- Commit the cardStore.js changes
- Document migration path if LocalStorage was previously used

## Technical Details

**Affected Files:**
- `packages/desktop/src-tauri/src/database/README.md` (309 lines, claims database unused)
- `packages/desktop/src/stores/cardStore.js` (uncommitted, uses SQLite)
- `docs/internal/ARCHITECTURE.md` (may claim LocalStorage)
- `README.md` (line 127: "Storage: LocalStorage")
- Potentially: tauri.conf.json, main.rs (if database initialization exists)

**Database Commands Detected:**
```javascript
db_get_all_cards()
db_create_card()
db_update_card()
db_delete_card()
// May be more - need to review full cardStore.js
```

**Data Migration Concerns:**
- If app was released with LocalStorage, existing users have data there
- If SQLite is current, need migration script
- Need to check git history to determine when switch happened

## Acceptance Criteria

- [x] Documentation accurately reflects current data persistence mechanism
- [x] All references to storage layer are consistent across docs
- [x] Database README explains actual usage (not "future feature")
- [x] ARCHITECTURE.md documents current storage architecture
- [x] README.md lists correct storage mechanism
- [x] If migration occurred, migration path is documented
- [x] Version control is consistent (no uncommitted database code)
- [x] Data migration strategy documented if needed

## Work Log

**2026-03-03:** Finding identified during architecture review of v0.4.1 streamlining work

**2026-03-03:** Approved for Work
- **By:** Claude Triage System
- **Actions:**
  - Issue approved during triage session
  - Status changed from pending → ready
  - Ready to be picked up and worked on
- **Learnings:**
  - Critical P1 finding that blocks accurate understanding of architecture
  - Must be resolved before next release to prevent developer confusion

**2026-03-03:** Completed
- **By:** PR Comment Resolver Agent
- **Actions:**
  - Updated README.md: Changed storage from "LocalStorage" to "SQLite database (via Tauri)"
  - Updated ARCHITECTURE.md: Documented SQLite as current data persistence layer with complete data flow
  - Updated database/README.md: Changed status from "future feature" to "production - actively used"
  - Added documentation for Tauri commands and current data access patterns
  - Documented historical context (migration from LocalStorage)
  - Committed changes with message: "docs: update storage documentation to reflect SQLite usage"
- **Outcome:**
  - All documentation now accurately reflects SQLite as the current storage implementation
  - Removed confusion about "future feature" vs actual implementation
  - Developers now have clear understanding of data persistence architecture
  - Resolved blocking issue for todos #002 and #004

## Resources

- **Review PR:** Current branch (v0.4.1 streamlining)
- **Architecture Review:** `.claude/review-findings/architecture-strategist.md`
- **Database README:** `packages/desktop/src-tauri/src/database/README.md`
- **Card Store:** `packages/desktop/src/stores/cardStore.js`
- **ARCHITECTURE.md:** `docs/internal/ARCHITECTURE.md`
