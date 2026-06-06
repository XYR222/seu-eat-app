# Feedback RAG Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let user-created food and stall feedback influence AI recommendation retrieval, evidence, and ranking.

**Architecture:** Keep feedback in the client as localStorage-backed state, pass a bounded snapshot to `/api/recommend`, merge it with static demo feedback on the server, and use the merged feedback during RAG scoring. Do not add a database or make localStorage available to server code.

**Tech Stack:** Next.js Route Handlers, React, TypeScript, Vitest.

---

### Task 1: Extend Recommendation Request Shape

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/ai/AiRecommendTab.tsx`

- [ ] Add optional `feedback?: FoodFeedback[]` and `stallFeedback?: StallFeedback[]` to `RecommendRequest`.
- [ ] Pass `feedback` and `stallFeedback` from `AppShell` into `AiRecommendTab`.
- [ ] Include both snapshots in the `/api/recommend` request body.

### Task 2: Merge Request Feedback Into RAG

**Files:**
- Modify: `src/lib/recommend.ts`
- Modify: `src/lib/rag.ts`
- Test: `src/lib/recommend.test.ts`

- [ ] Add a failing test showing request feedback comments appear in candidate evidence or RAG text.
- [ ] Add a failing test showing request feedback can increase a candidate score.
- [ ] Implement a merge helper that overlays request feedback on static feedback by `foodId`.
- [ ] Add optional stall feedback to retrieval input.
- [ ] For each candidate, include matching stall comments and likes/dislikes in the document and evidence.

### Task 3: Verify Full Flow

**Files:**
- No new production files unless verification exposes issues.

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] Smoke check `http://127.0.0.1:3000/`.
- [ ] Commit the branch.

