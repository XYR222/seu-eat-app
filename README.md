# 东南今天吃点啥

Mobile-first campus meal decision app for the hackathon demo. It keeps the core food data, memory, draw-card flow, and recommendation fallback local so the demo can run without external AI services.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Optional Supabase Auth

Auth is enabled when these public environment variables are present:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

When they are configured, `/` is protected by Supabase cookie-based auth and unauthenticated users are redirected to `/login`. The callback route is `/auth/callback`.

Server-only shared feedback can still use:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` through `NEXT_PUBLIC_`.

## Checks

```bash
npm run lint
npm run test
npm run build
```
