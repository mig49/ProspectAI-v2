-- Migration: 003_usage
-- Description: Create usage tracking table for plan limits
-- Story: 2.2-paywall-usage-tracking

create table if not exists usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  month text not null,
  searches_count int default 0,
  reports_count int default 0,
  exports_count int default 0,
  created_at timestamptz default now(),
  unique (user_id, month)
);

alter table usage enable row level security;

create policy "Users read own usage"
  on usage for select
  using (auth.uid() = user_id);

create policy "Users update own usage"
  on usage for update
  using (auth.uid() = user_id);

create policy "Users insert own usage"
  on usage for insert
  with check (auth.uid() = user_id);
