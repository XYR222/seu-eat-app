# Supabase Shared Feedback Design

## Summary

This branch adds a shared campus feedback layer while keeping the local demo path stable. Only public food and stall feedback is synced to Supabase. Personal memory, favorites, meal history, and recent/avoid foods remain local.

## Architecture

- Frontend keeps optimistic local updates and localStorage fallback.
- Next.js API routes are the Supabase boundary.
- Supabase stores append-only `feedback_events`.
- Startup merges feedback as: initial mock < remote shared < local current device.
- Existing RAG receives the merged feedback state and needs no separate vector database.

## Supabase Scope

Synced:

- Food likes, dislikes, tags, comments.
- Stall likes, dislikes, comments.

Local only:

- Memory.
- Favorites.
- Meal history.
- Anonymous device ID.

## API

- `GET /api/feedback/snapshot` returns `{ foodFeedback, stallFeedback }`.
- `POST /api/feedback/event` accepts a normalized feedback event and writes to `feedback_events`.

Both routes degrade safely when Supabase env vars are missing or Supabase is unavailable.

## Database

Use `supabase/schema.sql` to create the table, indexes, RLS, grants, and policies.

Required server env:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_ANON_KEY` is supported as a fallback for server routes, but service role is preferred on the server. No Supabase key is exposed through `NEXT_PUBLIC_`.

## Verification

- `npm.cmd test`
- `npm.cmd run lint`
- `npm.cmd run build`
- Optional real smoke check when Supabase env exists:
  - `POST /api/feedback/event`
  - `GET /api/feedback/snapshot`
