create table if not exists public.feedback_events (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('food', 'stall')),
  event_type text not null check (event_type in ('like', 'dislike', 'tag', 'comment')),
  food_id text,
  stall_key text,
  tag text,
  comment text,
  device_id text not null,
  created_at timestamptz not null default now(),

  constraint feedback_target_check check (
    (scope = 'food' and food_id is not null and stall_key is null)
    or
    (scope = 'stall' and stall_key is not null)
  ),

  constraint feedback_comment_length_check check (
    comment is null or char_length(comment) <= 80
  )
);

create index if not exists feedback_events_food_id_idx on public.feedback_events(food_id);
create index if not exists feedback_events_stall_key_idx on public.feedback_events(stall_key);
create index if not exists feedback_events_created_at_idx on public.feedback_events(created_at desc);

create unique index if not exists feedback_events_unique_vote_idx
on public.feedback_events (
  device_id,
  scope,
  coalesce(food_id, ''),
  coalesce(stall_key, ''),
  event_type
)
where event_type in ('like', 'dislike');

alter table public.feedback_events enable row level security;

grant select, insert on public.feedback_events to anon;

drop policy if exists "Anyone can read shared feedback" on public.feedback_events;
create policy "Anyone can read shared feedback"
on public.feedback_events
for select
to anon
using (true);

drop policy if exists "Anyone can insert valid feedback" on public.feedback_events;
create policy "Anyone can insert valid feedback"
on public.feedback_events
for insert
to anon
with check (true);
