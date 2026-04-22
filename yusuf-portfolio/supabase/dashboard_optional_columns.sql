-- Dashboard + analytics support (idempotent). Run in Supabase SQL Editor or via MCP/CLI.
-- Safe to re-run. Wraps alters in existence checks so it works partial / fresh DBs.

-- ── analytics_events (portfolio tracking + dashboard charts)
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  created_at timestamptz not null default now(),
  properties jsonb default '{}'::jsonb
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_created_idx on public.analytics_events (event_name, created_at desc);

-- ── contact_messages (used by /api/contact and dashboard; legacy name was `contacts`)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.contact_messages add column if not exists read boolean not null default false;
alter table public.contact_messages add column if not exists replied boolean not null default false;

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_insert_anon" on public.contact_messages;
create policy "contact_messages_insert_anon"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- One-time backfill: legacy `public.contacts` → `contact_messages` (only if `contacts` exists and inbox is empty).
do $migrate$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'contacts'
  ) and not exists (select 1 from public.contact_messages limit 1) then
    insert into public.contact_messages (name, email, message, read, created_at)
    select name, email, message, coalesce(read, false), created_at from public.contacts;
  end if;
end;
$migrate$;

-- hire_requests.status (only if table exists — otherwise apply supabase/schema.sql first)
do $hire$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'hire_requests'
  ) then
    alter table public.hire_requests add column if not exists status text not null default 'new';
    alter table public.hire_requests add column if not exists replied boolean not null default false;
    comment on column public.hire_requests.status is 'new | reviewing | accepted | declined';
  end if;
end;
$hire$;

-- page_sections.custom_title (only if table exists)
do $sections$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'page_sections'
  ) then
    alter table public.page_sections add column if not exists custom_title text;
  end if;
end;
$sections$;
