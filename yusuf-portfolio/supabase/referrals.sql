-- Referral program — run in Supabase SQL Editor or `supabase db query -f ... --linked`

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_name text not null,
  referrer_email text not null,
  referred_name text not null,
  referred_email text not null,
  message text,
  status text not null default 'pending',
  reward_amount text not null default '10% discount',
  created_at timestamptz default now()
);

comment on column public.referrals.status is 'pending | converted | rewarded';

create index if not exists referrals_created_at_idx on public.referrals (created_at desc);

alter table public.referrals enable row level security;

drop policy if exists "referrals_insert_anon" on public.referrals;
create policy "referrals_insert_anon"
  on public.referrals for insert
  to anon, authenticated
  with check (true);
