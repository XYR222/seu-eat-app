# My Records Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top-right "我的" button that opens a bottom sheet for recent meal history, favorites, memory management, and reusable food details.

**Architecture:** Keep three bottom tabs unchanged. Store history and favorites in localStorage through a focused `src/lib/my-store.ts` module, manage the sheet in `AppShell`, and reuse `FoodDetailSheet` / `StallDetailSheet` from the sheet.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest.

---

### Task 1: Local Store

**Files:**
- Create: `src/lib/my-store.ts`
- Test: `src/lib/my-store.test.ts`
- Modify: `src/types/index.ts`

- [ ] Add `MealHistoryItem` and `FavoriteFood` types.
- [ ] Add localStorage helpers for `seu-eat-history` and `seu-eat-favorites`.
- [ ] Add helpers to add bounded history records and toggle favorites.

### Task 2: My Sheet UI

**Files:**
- Create: `src/components/my/MyRecordsSheet.tsx`
- Modify: `src/components/AppShell.tsx`

- [ ] Add top-right "我的" button in `AppShell`.
- [ ] Add bottom sheet that shows overview, recent history, favorites, and memory chips.
- [ ] Let food rows open the shared `FoodDetailSheet`.
- [ ] Let memory chips call existing remove/clear memory handlers.

### Task 3: Wire Actions

**Files:**
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/ai/AiRecommendTab.tsx`
- Modify: `src/components/draw/DrawMealTab.tsx`
- Modify: `src/components/food/FoodDetailSheet.tsx`

- [ ] AI "就吃这个" writes history with source `ai`.
- [ ] Draw "就它了" writes history with source `draw`.
- [ ] Food detail supports favorite toggle and manual "记为吃过".
- [ ] Favorites are visible in the My sheet.

### Task 4: Verification

**Files:**
- No new production files unless checks expose issues.

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] Smoke check `http://127.0.0.1:3000/`.
- [ ] Commit with a concise summary.

