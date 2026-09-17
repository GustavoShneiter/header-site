-- Execute once in Supabase > SQL Editor. The app and the website use these tables.
create table if not exists public.header_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.header_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.header_tasks(id) on delete cascade,
  is_parent boolean not null default false,
  title text not null check (char_length(title) between 1 and 240),
  weekday smallint not null check (weekday between 0 and 6),
  period text not null check (period in ('morning','afternoon','evening')),
  completed boolean not null default false,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.header_tasks add column if not exists is_parent boolean not null default false;
create index if not exists header_tasks_owner_weekday_idx on public.header_tasks(owner_id, weekday, period, position);
create index if not exists header_tasks_parent_idx on public.header_tasks(parent_id);

alter table public.header_profiles enable row level security;
alter table public.header_tasks enable row level security;
drop policy if exists "profile owner" on public.header_profiles;
drop policy if exists "task owner" on public.header_tasks;
create policy "profile owner" on public.header_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "task owner" on public.header_tasks for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
