-- Session 34: 90-Day Pass → Annual upgrade + Stripe webhook idempotency
--
-- Billing state lives on `profiles` (there is no separate subscriptions table).
-- The existing `subscription_expires_at` column is the access expiry for
-- one-time plans, so no separate access_expires_at column is added.

alter table profiles add column if not exists subscription_plan text
  check (subscription_plan in ('monthly', '90_day_pass', 'annual'));
alter table profiles add column if not exists access_started_at timestamptz;
-- Actual amount charged in cents (Checkout Session amount_total), not list price
alter table profiles add column if not exists stripe_amount_paid integer;

-- Backfill: before this migration only the 90-Day Pass set an expiry date.
-- stripe_amount_paid is left null (actual amount unknown); those users must
-- have it filled in manually before they can use the upgrade flow.
update profiles
set subscription_plan = '90_day_pass',
    access_started_at = subscription_expires_at - interval '90 days'
where subscription_tier = 'pro'
  and subscription_expires_at is not null
  and subscription_plan is null;

-- Webhook idempotency: the webhook inserts event_id before processing;
-- a primary-key conflict means the event was already handled.
create table if not exists processed_stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

-- Service-role only (webhook). RLS on with no policies blocks anon/authenticated.
alter table processed_stripe_events enable row level security;
