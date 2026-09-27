-- Session 35: stop users from writing their own billing fields on profiles
--
-- Before this, "Users can update own profile" + Supabase's default table-level
-- UPDATE grant let any logged-in user set subscription_tier, stripe_amount_paid,
-- etc. on their own row from the browser.
--
-- A column-level REVOKE alone does nothing while the table-level UPDATE grant
-- exists, so instead: revoke UPDATE on the whole table, then grant it back only
-- on the columns users legitimately edit (allowlist). Any column added later —
-- billing or otherwise — is NOT user-writable unless it is added here.
-- service_role bypasses grants/RLS, so the Stripe webhook and checkout still work.

-- Billing columns were added by hand in S27; record them so the repo matches prod.
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists subscription_tier text default 'free';
alter table public.profiles add column if not exists subscription_status text;
alter table public.profiles add column if not exists subscription_expires_at timestamptz;

revoke update on public.profiles from anon, authenticated;

grant update (
  username,                  -- settings: display name
  neta_target_level,         -- onboarding
  exam_date,                 -- optional study-velocity input
  practice_questions_today,  -- free-tier practice counter (/api/practice/questions)
  practice_count_date
) on public.profiles to authenticated;

-- Row check: users may only update their own row, and may not move it to another id.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
