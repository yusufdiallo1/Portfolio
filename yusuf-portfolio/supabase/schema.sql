-- Portfolio database schema (Supabase / Postgres)
-- Run in SQL editor or via: supabase db push / psql

-- ── Admin credentials (single row — you, Yusuf)
create table if not exists public.admin_credentials (
  id uuid primary key default gen_random_uuid(),
  admin_id text unique not null,
  password_hash text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  image_url text,
  tags text[],
  featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ── Pricing plans
create table if not exists public.pricing (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text not null,
  billing_period text default 'project',
  description text,
  features text[],
  highlighted boolean default false,
  sort_order int default 0
);

-- ── Testimonials
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  author_avatar text,
  content text not null,
  rating int default 5,
  approved boolean default false,
  created_at timestamptz default now()
);

-- ── Contact messages
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ── Hire requests
create table if not exists public.hire_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  project_type text,
  budget text,
  timeline text,
  description text not null,
  tech_stack text[],
  status text default 'new',
  created_at timestamptz default now()
);

-- ── Page sections (dynamic visibility + order)
create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  visible boolean default true,
  sort_order int default 0,
  custom_title text
);

-- ── Analytics events
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  metadata jsonb,
  ip_hash text,
  created_at timestamptz default now()
);

-- ── updated_at (admin_credentials)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists admin_credentials_set_updated_at on public.admin_credentials;
create trigger admin_credentials_set_updated_at
  before update on public.admin_credentials
  for each row
  execute procedure public.set_updated_at();

-- ── Row Level Security
alter table public.admin_credentials enable row level security;
alter table public.projects enable row level security;
alter table public.pricing enable row level security;
alter table public.testimonials enable row level security;
alter table public.page_sections enable row level security;
alter table public.contacts enable row level security;
alter table public.hire_requests enable row level security;
alter table public.analytics enable row level security;

-- admin_credentials: no policies — anon/authenticated cannot access. Service role bypasses RLS.

drop policy if exists "projects_select_public" on public.projects;
drop policy if exists "pricing_select_public" on public.pricing;
drop policy if exists "page_sections_select_public" on public.page_sections;
drop policy if exists "testimonials_select_public" on public.testimonials;
drop policy if exists "contacts_insert_anon" on public.contacts;
drop policy if exists "hire_requests_insert_anon" on public.hire_requests;
drop policy if exists "analytics_insert_anon" on public.analytics;

-- projects, pricing, page_sections: public read
create policy "projects_select_public"
  on public.projects for select
  to anon, authenticated
  using (true);

create policy "pricing_select_public"
  on public.pricing for select
  to anon, authenticated
  using (true);

create policy "page_sections_select_public"
  on public.page_sections for select
  to anon, authenticated
  using (true);

-- testimonials: public read (approved only)
create policy "testimonials_select_public"
  on public.testimonials for select
  to anon, authenticated
  using (approved = true);

-- contacts: insert only for anon (no select for anon)
create policy "contacts_insert_anon"
  on public.contacts for insert
  to anon, authenticated
  with check (true);

-- hire_requests: insert only for anon (no select for anon)
create policy "hire_requests_insert_anon"
  on public.hire_requests for insert
  to anon, authenticated
  with check (true);

-- analytics: insert only for anon (no select for anon)
create policy "analytics_insert_anon"
  on public.analytics for insert
  to anon, authenticated
  with check (true);

-- ── Seed: page_sections
insert into public.page_sections (section_key, sort_order) values
  ('hero', 0),
  ('about', 1),
  ('skills', 2),
  ('projects', 3),
  ('pricing', 4),
  ('hire', 5),
  ('faq', 6),
  ('testimonials', 7)
on conflict (section_key) do nothing;

-- ── Seed: pricing (idempotent by name)
insert into public.pricing (name, price, billing_period, description, features, highlighted, sort_order)
select 'Starter', '$499', 'project', 'Landing Page or Simple App',
  array['1 page / single feature', 'Fully responsive', '3-day delivery', '1 revision round', 'Deployed to Vercel']::text[],
  false, 0
where not exists (select 1 from public.pricing where name = 'Starter');

insert into public.pricing (name, price, billing_period, description, features, highlighted, sort_order)
select 'Pro', '$1,299', 'project', 'Full Web Application',
  array['Up to 5 pages', 'Supabase database + auth', 'API integrations', 'Custom dashboard', '7-day delivery', '3 revision rounds']::text[],
  true, 1
where not exists (select 1 from public.pricing where name = 'Pro');

insert into public.pricing (name, price, billing_period, description, features, highlighted, sort_order)
select 'Elite', '$2,499', 'project', 'Full Stack SaaS Platform',
  array['Complete platform build', 'AI feature integration', 'Payments (Stripe)', 'Analytics dashboard', '14-day delivery', 'Unlimited revisions']::text[],
  false, 2
where not exists (select 1 from public.pricing where name = 'Elite');
