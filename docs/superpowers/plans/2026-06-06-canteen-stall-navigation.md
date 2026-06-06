# Canteen Stall Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a click-through browse flow in the Explore tab: canteen cards -> stall cards -> food cards, while preserving search, filters, and existing detail sheets.

**Architecture:** Derive canteen and stall navigation data from the existing `Food` records. Keep grouping logic in `src/lib/canteen-navigation.ts`; keep UI state and rendering in `src/components/explore/ExploreTab.tsx`.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest.

---

### Task 1: Navigation Data Helpers

**Files:**
- Create: `src/lib/canteen-navigation.ts`
- Test: `src/lib/canteen-navigation.test.ts`

- [ ] **Step 1: Write failing tests**

Create tests for:
- extracting canteen summaries with food and stall counts
- extracting stalls for one canteen
- extracting foods for one stall

- [ ] **Step 2: Run targeted test to verify failure**

Run: `npm.cmd test -- src/lib/canteen-navigation.test.ts`

Expected: fail because `src/lib/canteen-navigation.ts` does not exist yet.

- [ ] **Step 3: Implement helpers**

Add:
- `getCanteenSummaries(foods)`
- `getStallsForCanteen(foods, canteen)`
- `getFoodsForStall(foods, canteen, stall)`

Use stable sorting by existing input order and avoid hard-coded canteen names.

- [ ] **Step 4: Run targeted test**

Run: `npm.cmd test -- src/lib/canteen-navigation.test.ts`

Expected: pass.

### Task 2: Explore Tab Browse Flow

**Files:**
- Modify: `src/components/explore/ExploreTab.tsx`

- [ ] **Step 1: Add navigation state**

Add:
- `selectedCanteen`
- `selectedBrowseStall`

Reset `selectedBrowseStall` when changing canteens.

- [ ] **Step 2: Render canteen cards**

Add a "按食堂逛" section below filter chips. Each canteen card shows:
- canteen icon/initial
- canteen name
- food count
- stall count

- [ ] **Step 3: Render stall list when canteen selected**

When a canteen is selected, show:
- back button to all canteens
- selected canteen title
- stall cards with food count and top tags

- [ ] **Step 4: Render stall food list when stall selected**

When a stall is selected, show:
- back button to selected canteen
- selected stall title
- window reputation button using existing `StallDetailSheet`
- food cards from that stall

- [ ] **Step 5: Preserve existing behavior**

Search and tag filtering continue to work. Existing `FoodDetailSheet` and `StallDetailSheet` remain shared.

### Task 3: Verification

**Files:**
- No production file changes unless verification exposes issues.

- [ ] **Step 1: Run all tests**

Run: `npm.cmd test`

- [ ] **Step 2: Run lint**

Run: `npm.cmd run lint`

- [ ] **Step 3: Run build**

Run: `npm.cmd run build`

- [ ] **Step 4: Check git diff**

Run: `git status --short`

