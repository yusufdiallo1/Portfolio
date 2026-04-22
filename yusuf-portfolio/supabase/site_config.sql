-- Site-wide CMS key/value (availability banner, Calendly, etc.)
create table if not exists public.site_config (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  updated_at timestamptz default now()
);

create index if not exists site_config_key_idx on public.site_config (key);

alter table public.site_config enable row level security;

drop policy if exists "site_config_select_public" on public.site_config;
create policy "site_config_select_public"
  on public.site_config for select
  to anon, authenticated
  using (true);

-- No insert/update/delete for anon — dashboard uses service role.

insert into public.site_config (key, value) values
  ('availability_visible', 'true'),
  ('availability_status', 'available'),
  ('availability_message', 'Available for projects · Next slot: May 2026'),
  ('calendly_url', 'https://calendly.com/yusufcreates')
on conflict (key) do nothing;
