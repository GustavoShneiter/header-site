-- Header Web: run once in Supabase SQL Editor (safe to run again).
-- Adds fields without changing or deleting existing tasks.
begin;
alter table public.header_tasks
  add column if not exists description text not null default '',
  add column if not exists due_time text not null default '',
  add column if not exists kind text not null default 'check' check (kind in ('check','list','note')),
  add column if not exists background text not null default '',
  add column if not exists text_color text not null default '',
  add column if not exists accent text not null default '#8b70db';
alter table public.header_profiles add column if not exists preferences jsonb not null default '{}'::jsonb;

create table if not exists public.header_events(
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check(char_length(title) between 1 and 240),
  date date not null,
  time text not null default '',
  type text not null default 'Compromisso',
  description text not null default '',
  color text not null default '#8b70db',
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.header_habits(
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check(char_length(title) between 1 and 240),
  goal text not null default '',
  days integer[] not null default '{0,1,2,3,4,5,6}',
  completions text[] not null default '{}',
  color text not null default '#8b70db',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.header_challenges(
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check(char_length(title) between 1 and 240),
  situation text not null default '',
  desired text not null default '',
  strategy text not null default '',
  checks jsonb not null default '[]'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists header_events_owner_date on public.header_events(owner_id,date);
create index if not exists header_habits_owner on public.header_habits(owner_id);
create index if not exists header_challenges_owner on public.header_challenges(owner_id);
alter table public.header_events enable row level security;
alter table public.header_habits enable row level security;
alter table public.header_challenges enable row level security;
drop policy if exists "event owner" on public.header_events;
create policy "event owner" on public.header_events for all to authenticated using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
drop policy if exists "habit owner" on public.header_habits;
create policy "habit owner" on public.header_habits for all to authenticated using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
drop policy if exists "challenge owner" on public.header_challenges;
create policy "challenge owner" on public.header_challenges for all to authenticated using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
grant select,insert,update,delete on public.header_events,public.header_habits,public.header_challenges to authenticated;
notify pgrst,'reload schema';
commit;
