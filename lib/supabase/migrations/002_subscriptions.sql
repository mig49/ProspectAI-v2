-- Migration: 002_subscriptions
-- Description: Create subscriptions table for Stripe billing
-- Story: 2.1-stripe-integration

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text check (plan in ('free','pro','scale')) default 'free',
  status text check (status in ('active','canceled','past_due','trialing')) default 'active',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "Users read own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role manages subscriptions"
  on subscriptions for all
  using (auth.role() = 'service_role');
