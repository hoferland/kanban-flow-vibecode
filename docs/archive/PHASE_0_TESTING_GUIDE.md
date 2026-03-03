# Phase 0 Testing Guide: Desktop SQLite Migration

**Version:** 1.0  
**Date:** December 18, 2024  
**Purpose:** Comprehensive testing guide for Phase 0 completion

---

## 🎯 Testing Overview

This guide provides step-by-step instructions for testing the complete SQLite migration. All tests should be performed before releasing v0.3.0.

**Estimated Testing Time:** 2-3 hours

---

## 🔧 Pre-Testing Setup

### 1. Build the App

```bash
cd packages/desktop
npm run tauri dev
```

### 2. Locate Database File

The SQLite database will be created at:
- **macOS:** `~/Library/Application Support/com.flow.kanban/flow.db`

To inspect the database during testing:
```bash
# Open database in SQLite CLI
sqlite3 ~/Library/Application\ Support/com.flow.kanban/flow.db

# Common commands:
.tables                    # List all tables
.schema cards             # Show card table schema
SELECT * FROM sync_metadata;  # View metadata
SELECT * FROM cards;      # View all cards
.quit                     # Exit
```

### 3. Clean Start (Optional)

For a fresh test, delete the database:
```bash
rm ~/Library/Application\ Support/com.flow.kanban/flow.db
```

---

## 📋 Test Suite

### Test 1: Initial App Launch & Default Data

**Objective:** Verify database initialization and default data creation

**Steps:**
1. Delete existing database (if any)
2. Launch the app
3. Observe the board

**Expected Results:**
- ✅ App launches without errors
- ✅ Default columns appear: Inbox, Next, In Progress, Done
- ✅ Default areas available in filters
- ✅ Default types available in filters
- ✅ No console errors

**Verify in Database:**
```sql
SELECT * FROM columns WHERE isActive = 1;
-- Should show 4 columns with positions 0,1,2,3

SELECT * FROM attributes WHERE type = 'area';
-- Should show default areas

SELECT * FROM sync_metadata WHERE key = 'device_id';
-- Should show a generated device ID starting with 'desktop-'
```

**Result:** ☐ Pass ☐ Fail

---

### Test 2: Card CRUD Operations

#### Test 2.1: Create Card

**Steps:**
1. Click "+ New Card" button
2. Enter title: "Test Card 1"
3. Select area: "SD Team"
4. Select type: "Design"
5. Click "Create"

**Expected Results:**
- ✅ Card appears in Inbox column
- ✅ Card shows correct title, area badge, and type badge
- ✅ Card has proper styling (Japandi aesthetic)

**Verify in Database:**
```sql
SELECT id, title, area, type, column, position FROM cards WHERE title = 'Test Card 1';
-- Should show the card with correct data
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 2.2: Update Card

**Steps:**
1. Click on "Test Card 1"
2. Update title to "Updated Test Card"
3. Change type to "Discovery"
4. Add notes: "These are test notes"
5. Set due date to tomorrow
6. Click "Save"

**Expected Results:**
- ✅ Modal closes
- ✅ Card shows updated title
- ✅ Type badge updated to "Discovery"
- ✅ Due date indicator appears

**Verify in Database:**
```sql
SELECT title, type, notes, dueDate FROM cards WHERE id = [card_id];
-- Should show updated values
-- updatedAt timestamp should be greater than createdAt
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 2.3: Move Card Between Columns

**Steps:**
1. Drag "Updated Test Card" from Inbox to "In Progress"
2. Observe the card movement
3. Refresh the app (cmd/ctrl + R)

**Expected Results:**
- ✅ Card moves smoothly to target column
- ✅ Position updates correctly
- ✅ After refresh, card stays in "In Progress"

**Verify in Database:**
```sql
SELECT column, position FROM cards WHERE title LIKE 'Updated%';
-- column should be 'in-progress'
-- position should be 0 (first card in column)
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 2.4: Delete Card

**Steps:**
1. Click on a card
2. Click "Delete" button
3. Confirm deletion

**Expected Results:**
- ✅ Card disappears from board
- ✅ No errors in console
- ✅ Tombstone created for sync

**Verify in Database:**
```sql
SELECT * FROM cards WHERE title LIKE 'Updated%';
-- Should return no rows (card deleted)

SELECT * FROM tombstones WHERE entityType = 'card';
-- Should show a tombstone entry with the card's ID
```

**Result:** ☐ Pass ☐ Fail

---

### Test 3: Multiple Cards & Positioning

#### Test 3.1: Create Multiple Cards

**Steps:**
1. Create 5 cards in Inbox column:
   - "Card A" (SD Team, Design)
   - "Card B" (TM Team, Discovery)
   - "Card C" (Cross-team, Support)
   - "Card D" (SD Team, Design)
   - "Card E" (Other, Discovery)

**Expected Results:**
- ✅ All cards appear in Inbox
- ✅ Cards are in creation order
- ✅ Positions are sequential (0,1,2,3,4)

**Verify in Database:**
```sql
SELECT title, position FROM cards WHERE column = 'inbox' ORDER BY position;
-- Should show 5 cards with positions 0-4
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 3.2: Reorder Cards Within Column

**Steps:**
1. Drag "Card E" to position 0 (top of Inbox)
2. Drag "Card A" to position 4 (bottom of Inbox)
3. Observe the reordering

**Expected Results:**
- ✅ Cards rearrange correctly
- ✅ All positions update properly
- ✅ No cards overlap positions

**Verify in Database:**
```sql
SELECT title, position FROM cards WHERE column = 'inbox' ORDER BY position;
-- Positions should be 0,1,2,3,4 with correct card order
```

**Result:** ☐ Pass ☐ Fail

---

### Test 4: Column Management

#### Test 4.1: View Column Configuration

**Steps:**
1. Click settings icon (top right)
2. Navigate to "Column Configuration" tab
3. Observe current columns

**Expected Results:**
- ✅ All 4 default columns listed
- ✅ Columns show in correct order
- ✅ Each column has name and max cards field
- ✅ Drag handles visible

**Result:** ☐ Pass ☐ Fail

---

#### Test 4.2: Add New Column

**Steps:**
1. In Column Configuration, click "Add Column"
2. Enter name: "Review"
3. Set max cards: 5
4. Click outside or save
5. Close settings modal

**Expected Results:**
- ✅ "Review" column appears in the list
- ✅ New column appears on the board
- ✅ Column is positioned at the end

**Verify in Database:**
```sql
SELECT id, label, position, wipLimit FROM columns WHERE label = 'Review';
-- Should show the new column with position 4
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 4.3: Reorder Columns

**Steps:**
1. Open Column Configuration
2. Drag "Review" column to position 2 (between Next and In Progress)
3. Close settings
4. Observe board

**Expected Results:**
- ✅ Columns rearrange on the board
- ✅ New order persists after refresh
- ✅ All cards stay in their respective columns

**Verify in Database:**
```sql
SELECT label, position FROM columns WHERE isActive = 1 ORDER BY position;
-- Positions should be sequential and match visual order
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 4.4: Update Column Label

**Steps:**
1. Open Column Configuration
2. Change "Review" to "Code Review"
3. Close settings

**Expected Results:**
- ✅ Column label updates on board
- ✅ Cards remain in column
- ✅ Change persists after refresh

**Verify in Database:**
```sql
SELECT label FROM columns WHERE position = 2;
-- Should show 'Code Review'
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 4.5: Delete Column

**Steps:**
1. Create a test card in "Code Review" column
2. Open Column Configuration
3. Delete "Code Review" column
4. Observe what happens to the card

**Expected Results:**
- ✅ Column removed from board
- ✅ Remaining columns re-index positions
- ✅ Card handling is graceful (should move to first column)

**Verify in Database:**
```sql
SELECT isActive FROM columns WHERE label = 'Code Review';
-- Should show isActive = 0 (soft delete)

SELECT position FROM columns WHERE isActive = 1 ORDER BY position;
-- Positions should be sequential 0,1,2,3
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 4.6: Reset Columns to Defaults

**Steps:**
1. Open Column Configuration
2. Click "Reset to Defaults"
3. Confirm reset
4. Observe board

**Expected Results:**
- ✅ Board shows 4 default columns
- ✅ Custom columns are removed
- ✅ Cards remain on board (in appropriate columns)

**Result:** ☐ Pass ☐ Fail

---

### Test 5: Area Management

#### Test 5.1: View Areas

**Steps:**
1. Open Settings → Attribute Configuration
2. View areas list

**Expected Results:**
- ✅ Shows default areas: SD Team, TM Team, Cross-team, Other
- ✅ Areas show in correct order
- ✅ Each has edit and delete options

**Result:** ☐ Pass ☐ Fail

---

#### Test 5.2: Add New Area

**Steps:**
1. In Attribute Configuration, add new area: "Design Team"
2. Save settings
3. Create a new card and check area dropdown

**Expected Results:**
- ✅ "Design Team" appears in list
- ✅ Area available in card creation
- ✅ Area available in filters

**Verify in Database:**
```sql
SELECT id, label, position FROM attributes WHERE type = 'area' AND label = 'Design Team';
-- Should show the new area
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 5.3: Reorder Areas

**Steps:**
1. Open Attribute Configuration
2. Drag "Design Team" to position 1
3. Save and observe

**Expected Results:**
- ✅ Area order changes in settings
- ✅ Order reflects in dropdowns
- ✅ Persists after app restart

**Verify in Database:**
```sql
SELECT label, position FROM attributes WHERE type = 'area' ORDER BY position;
-- Should show areas in new order with sequential positions
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 5.4: Update Area Label

**Steps:**
1. Change "Design Team" to "UX Team"
2. Save
3. Check existing cards with that area

**Expected Results:**
- ✅ Label updates throughout app
- ✅ Cards show new label
- ✅ Filters show new label

**Result:** ☐ Pass ☐ Fail

---

#### Test 5.5: Delete Area

**Steps:**
1. Delete "UX Team" area
2. Save
3. Try to create a card (observe available areas)

**Expected Results:**
- ✅ Area removed from dropdowns
- ✅ Existing cards with that area still display it
- ✅ Cannot assign new cards to deleted area

**Verify in Database:**
```sql
SELECT isActive FROM attributes WHERE label = 'UX Team';
-- Should show isActive = 0
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 5.6: Reset Areas to Defaults

**Steps:**
1. Reset areas to defaults
2. Verify default areas restored

**Expected Results:**
- ✅ 4 default areas restored
- ✅ Custom areas removed

**Result:** ☐ Pass ☐ Fail

---

### Test 6: Type Management

Repeat Tests 5.1-5.6 for Types:
- Default types: Discovery, Design, Support
- Test add/reorder/update/delete/reset

**Results:**
- Test 6.1 (View): ☐ Pass ☐ Fail
- Test 6.2 (Add): ☐ Pass ☐ Fail
- Test 6.3 (Reorder): ☐ Pass ☐ Fail
- Test 6.4 (Update): ☐ Pass ☐ Fail
- Test 6.5 (Delete): ☐ Pass ☐ Fail
- Test 6.6 (Reset): ☐ Pass ☐ Fail

---

### Test 7: Persistence & Data Integrity

#### Test 7.1: App Restart

**Steps:**
1. Create several cards with various data
2. Completely quit the app
3. Relaunch the app

**Expected Results:**
- ✅ All cards present
- ✅ All data intact (titles, areas, types, positions)
- ✅ Column configuration preserved
- ✅ Area/Type configuration preserved

**Result:** ☐ Pass ☐ Fail

---

#### Test 7.2: Multiple Restarts

**Steps:**
1. Restart app 5 times in a row
2. Check data each time

**Expected Results:**
- ✅ Data remains consistent
- ✅ Device ID stays the same
- ✅ No data corruption

**Verify in Database:**
```sql
SELECT value FROM sync_metadata WHERE key = 'device_id';
-- Should be identical across all restarts
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 7.3: Large Dataset

**Steps:**
1. Create 50 cards with varying properties
2. Move cards between columns
3. Restart app
4. Verify all data present

**Expected Results:**
- ✅ All 50 cards present
- ✅ Performance acceptable
- ✅ No crashes or errors

**Result:** ☐ Pass ☐ Fail

---

### Test 8: Edge Cases

#### Test 8.1: Rapid Card Creation

**Steps:**
1. Quickly create 10 cards in succession
2. Check for duplicate IDs

**Expected Results:**
- ✅ All cards have unique IDs
- ✅ No conflicts or errors
- ✅ All positions correct

**Verify in Database:**
```sql
SELECT id, COUNT(*) FROM cards GROUP BY id HAVING COUNT(*) > 1;
-- Should return no rows (no duplicates)
```

**Result:** ☐ Pass ☐ Fail

---

#### Test 8.2: Empty Database Start

**Steps:**
1. Delete database file
2. Launch app
3. Verify defaults created

**Expected Results:**
- ✅ App initializes correctly
- ✅ Default columns created
- ✅ Default areas/types created
- ✅ Device ID generated

**Result:** ☐ Pass ☐ Fail

---

#### Test 8.3: Invalid Data Handling

**Steps:**
1. Try to create card with very long title (1000+ characters)
2. Try to set invalid due date
3. Try to delete non-existent card

**Expected Results:**
- ✅ App handles gracefully
- ✅ Appropriate error messages (if any)
- ✅ No crashes

**Result:** ☐ Pass ☐ Fail

---

## 📊 Test Results Summary

### Overall Results

| Category | Tests | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Initial Setup | 1 | __ | __ | __%  |
| Card CRUD | 4 | __ | __ | __% |
| Multiple Cards | 2 | __ | __ | __% |
| Column Management | 6 | __ | __ | __% |
| Area Management | 6 | __ | __ | __% |
| Type Management | 6 | __ | __ | __% |
| Persistence | 3 | __ | __ | __% |
| Edge Cases | 3 | __ | __ | __% |
| **TOTAL** | **31** | **__** | **__** | **__%** |

### Critical Issues Found

List any critical issues that block release:

1. 
2. 
3. 

### Non-Critical Issues Found

List minor issues that can be addressed later:

1. 
2. 
3. 

---

## ✅ Sign-Off

### Tested By

- **Name:** _______________
- **Date:** _______________
- **Environment:** macOS / Windows / Linux
- **App Version:** v0.3.0 (debug/release)

### Approval

- ☐ All critical tests passed
- ☐ Database integrity verified
- ☐ Performance acceptable
- ☐ Ready for v0.3.0 release

**Signature:** _______________  
**Date:** _______________

---

## 📝 Notes

Additional observations or comments:

_______________________________________________
_______________________________________________
_______________________________________________

---

**Testing Complete!** 🎉

Once all tests pass, Phase 0 is officially complete and ready for production release as v0.3.0.
