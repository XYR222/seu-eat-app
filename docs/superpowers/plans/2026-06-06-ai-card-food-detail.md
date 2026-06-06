# AI Card Food Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let AI recommendation cards open the same food detail and stall reputation sheets used by Explore and Draw.

**Architecture:** Add selected food/stall state to `AiRecommendTab`, reuse `FoodDetailSheet` and `StallDetailSheet`, and make `RecommendationCard` clickable without breaking its action buttons.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest.

---

### Task 1: Recommendation Card Click Contract

**Files:**
- Modify: `src/components/ai/RecommendationCard.tsx`

- [ ] Add `onOpenDetail: (foodId: string) => void`.
- [ ] Call it from the card container.
- [ ] Stop propagation inside existing action buttons and chips.

### Task 2: AI Tab Shared Detail Sheets

**Files:**
- Modify: `src/components/ai/AiRecommendTab.tsx`
- Modify: `src/components/AppShell.tsx`

- [ ] Pass `setFeedback` and `setStallFeedback` into `AiRecommendTab`.
- [ ] Add selected food/stall state in `AiRecommendTab`.
- [ ] Reuse `applyFoodDetailFeedback` and `applyStallDetailFeedback`.
- [ ] Render `FoodDetailSheet` and `StallDetailSheet`.

### Task 3: Verification

**Files:**
- No new production files unless checks expose issues.

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] Smoke check `http://127.0.0.1:3000/`.
- [ ] Commit the branch.

