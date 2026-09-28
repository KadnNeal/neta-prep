# Pass NETA: Billing Work Recap (Sessions 34–37)

Written 2026-09-28 from a Claude Code session. Covers the billing and Stripe work
from Session 34 through Session 37, what went wrong along the way, how each problem
was found, and what's still open.

**App context:** Pass NETA (repo `neta-prep`) is a Next.js 14+ App Router app on
Vercel, with Supabase (Postgres, auth, row-level security) and Stripe. There are three
paid plans:

| Plan | Stripe price | Type | Price |
|------|--------------|------|-------|
| Monthly | `price_1TwBWiGO8TgYfwMNwySrPsXi` | subscription | $39/mo |
| 90-Day Pass | `price_1TwBYkGO8TgYfwMNV9fpFBZS` | one-time | $109 |
| Annual | `price_1TwBXJGO8TgYfwMNfnF7f9Kw` | subscription | $299/yr |

Billing state lives on the `profiles` table (there is no separate subscriptions table).

Branches: `staging` deploys to `staging.passneta.co` (behind Vercel Authentication).
`master` is production (`passneta.co`) and has **not** received any of this work yet.

---

## Summary

| Session | Goal | Outcome |
|---------|------|---------|
| 34 | 90-Day Pass → Annual upgrade with credit, plus duplicate-proof webhook handling | Built. Later reworked because Annual turned out to be a subscription price. |
| 35 | Close a hole that let users give themselves paid access | Fixed and verified against the live database. |
| 36 | Fix lint errors; stop free users resetting their daily practice limit | Done, migration applied. |
| 37 | Post-checkout UI bugs, Annual button, duplicate-purchase guard | Done. It also uncovered that **no Stripe webhook had ever worked**, which is now fixed on staging. |

The most important finding came late: **Stripe webhooks had never successfully reached
the app.** Purchases were charged but never turned into access. Four separate problems
had to be fixed for the first webhook to go through (see Session 37).

---

## Session 34: 90-Day Pass → Annual upgrade

**Goal:** a 90-Day Pass holder can upgrade to Annual and pay only the difference, with
the annual period counted from their original pass start date. An expired pass pays
full price.

**Built:**
- New columns on `profiles`: `subscription_plan`, `access_started_at` and
  `stripe_amount_paid` (the actual amount charged, in cents).
- A `processed_stripe_events` table so each Stripe event is only processed once.
- `POST /api/upgrade-to-annual`: works out the difference and creates a Stripe Checkout
  session.
- The webhook records each event by inserting its ID *first*. If that insert conflicts,
  the event was already handled, so there's no gap between checking and inserting. If
  processing fails, the record is removed so Stripe's retry can process it again.
- An "Upgrade to Annual" block on the Settings page.

**Left undone at the end of the session:** the migration hadn't been applied, no PR had
been opened (the draft PR never existed because `gh` isn't installed), and a security
hole was flagged (Session 35).

---

## Session 35: Billing security hole

**Problem:** users could update their own `profiles` row from the browser, *including
billing columns*. From the browser console, anyone logged in could set
`subscription_tier = 'pro'` for free access, or lower `stripe_amount_paid` to make the
Annual upgrade nearly free.

**Correction to the original plan:** the proposed fix was
`REVOKE UPDATE (billing columns) ON profiles FROM authenticated`. On the live database,
the `authenticated` and `anon` roles had **update rights on the whole table** (Supabase's
default). A column-level revoke does nothing while that exists, so the planned fix would
have looked finished while changing nothing.

**What was done instead:**
- Migration `20260927120000_restrict_profile_billing_writes.sql`:
  - removes table-wide update rights from `anon` and `authenticated`;
  - grants update back only on an **allow list** of user-editable columns;
  - the update policy now has `with check (auth.uid() = id)`, so users can't move their
    row to another ID;
  - records the four Session 27 billing columns, which had been added by hand in the
    Supabase dashboard and never written as a migration.
- Code: every billing write goes through `createAdminClient()` (the service role, server
  only): the webhook and checkout's `stripe_customer_id` save.

**Verified live:** inside a transaction that was rolled back, acting as a logged-in user:

| Update | Result |
|--------|--------|
| `username` | ✅ succeeded |
| `subscription_tier = 'pro'` | ❌ permission denied |
| `stripe_amount_paid = 29850` | ❌ permission denied |

**Tooling problems met along the way:**
- The Supabase CLI couldn't run SQL at first (a login-role error). The fix was adding
  `SUPABASE_DB_PASSWORD` to `.env.local`.
- **Don't use `supabase db push`.** The remote migration history stops at `20260418`
  because later migrations were applied by hand, so `db push` would re-run them,
  including a roadmap data migration. Migrations are applied with
  `npx supabase db query --linked -f <file>`.

Sessions 34 and 35 were merged into `staging`. The worktree and branch were then deleted.

---

## Session 36: Lint and practice limit

- **Lint:** escaped 26 quote marks in `src/app/terms/page.tsx`. Lint was also scanning an
  old copy of the repo inside `.claude/worktrees/`, so `.claude/**` is now ignored in
  `eslint.config.mjs`. `npm run lint` now passes.
- **Practice limit:** the free tier's 15-a-day practice counter was still user-editable,
  so a free user could reset their own limit from the console. The counter is now written
  with the service role, and migration `20260927130000_restrict_practice_counter_writes.sql`
  removes those columns from the allow list.
- **Order mattered:** the migration had to wait until the new code was deployed.
  Otherwise the old code's counter updates would fail silently and free users would get
  unlimited practice. It was applied after staging deployed.

Users can now edit only `username`, `neta_target_level` and `exam_date`.

---

## Session 37: Post-checkout bugs, purchase guard, and why webhooks never worked

### Requested fixes

1. **Clean URL after checkout.** New `UpgradeSuccessNotice` component in the
   `(dashboard)` layout. It removes `?upgraded=true`, shows a success message, and reloads
   the page data every 2 seconds (up to 10 times) until the account shows as paid. The
   webhook can arrive after Stripe redirects the user back.
2. **Stale plan on the dashboard and pricing page.** The pages already read the plan fresh
   on every load. The real causes were:
   - webhooks never arriving (see below);
   - the nav sits in a shared layout, which Next.js doesn't re-render on navigation;
   - the pricing page marked *every* paid card "Current Plan" once you had any paid plan.

   Now only your actual plan says "Current Plan", other paid plans link to "Manage billing
   in Settings", and 90-Day holders see "Upgrade for $X more" on the Annual card.
3. **Annual button broken.** The Annual price in Stripe is a **yearly subscription**, but
   Session 34 had switched the app to charge Annual as a one-time payment. Stripe rejected
   it with *"You specified `payment` mode but passed a recurring price."* The button
   ignored the error, so clicking it looked like nothing happened.
   - **Decision:** keep Annual as a recurring $299/yr subscription.
   - The upgrade was reworked: a subscription checkout that charges the difference once
     now, plus a free trial until *original pass start + 365 days*, when the $299 billing
     starts. Stripe won't combine `proration_behavior: 'none'` with one-time charges,
     which is why a trial is used.
4. **Duplicate purchases.** Checkout now reads the profile with the service role. Anyone
   with *active* paid access gets a 400 error (`already_subscribed`, or `use_upgrade` for a
   90-Day holder choosing Annual), and the pricing page sends them to `/settings`. The
   check uses active access rather than `tier !== 'free'`, because expired passes keep
   tier `pro` and would otherwise be locked out of buying again.

### Other bugs found along the way

- **Stripe Managed Payments** is on for the account, so every inline product needs a
  `tax_code`. The Session 34 difference charge would have failed without it. It now uses
  `txcd_10103001`, the same code as the existing products.
- **Tax is added on top of the price** ($109 became $118.05). The webhook now saves the
  amount *before tax* as `stripe_amount_paid`, so the upgrade credit isn't inflated.
- The webhook now saves the Stripe customer ID, so later cancellations can find the user.

### Why no Stripe webhook had ever worked: four separate problems

`processed_stripe_events` was empty, and a test user who had bought the 90-Day Pass
**twice** was still `free`. Each fix exposed the next problem:

| # | Problem | How it was found | Fix |
|---|---------|------------------|-----|
| 1 | **No webhook endpoint registered** in Stripe test mode | Stripe API listed no endpoints | Registered `we_1UKm2NGO8TgYfwMNUCvvph06` for staging |
| 2 | **Staging is behind Vercel Authentication**, so Stripe got a 302 to a login page | curl POST returned "Protected by Vercel Authentication" | Turned on Vercel "Protection Bypass for Automation"; its secret is in the Stripe endpoint URL |
| 3 | **App middleware sent every logged-out request to `/`**, including the session-less Stripe webhook (since Session 33) | Response became a 307 to `/` | Middleware now skips all `/api/*` routes; each route already checks auth itself |
| 4 | **Invisible BOM character** (U+FEFF) at the start of the Preview `SUPABASE_SERVICE_ROLE_KEY`, probably from piping it through PowerShell in Session 31 | Vercel logs: *"Cannot convert argument to a ByteString… character at index 0 has a value of 65279"* | Key re-pasted in the Vercel dashboard. The Preview `STRIPE_SECRET_KEY` was also a live key rather than a test key, and was fixed too |

**Final end-to-end check:** the old test purchase was re-sent to the endpoint twice.
Result: **processed exactly once** (the duplicate was skipped), and the profile became
`pro` / `active` / `90_day_pass`, expiring 2026-12-27, with `stripe_amount_paid = 10900`.

### Deployment lesson

A manual "Redeploy" in the Vercel dashboard does **not** move the `staging.passneta.co`
alias to the new deployment. Pushing to `staging` does, and an empty commit is enough.

---

## Decisions made

- Annual stays a **recurring subscription**, not a one-time charge.
- The 90-Day → Annual upgrade credits the pre-tax amount paid and pushes the first $299
  renewal to the pass anniversary using a trial.
- Users can edit only an allow list of profile columns. Any new user-editable column must
  be added to the grant.
- Every billing and counter write goes through the service role.
- API routes are exempt from the middleware's page redirects.
- Stripe reaches the protected staging site through Vercel's automation bypass.

## Still open

- [ ] **Manual test-card checks on staging** (card 4242 4242 4242 4242): clean URL after
      checkout, pricing page shows the right current plan, Upgrade button disappears, a
      second purchase is blocked, and Annual works both new and as a 90-Day upgrade.
- [ ] **Production isn't ready:**
  - [ ] `master` needs Sessions 34–37 merged in.
  - [ ] Production needs its own Stripe webhook endpoint and Production `STRIPE_WEBHOOK_SECRET`.
  - [ ] Production env vars probably have the same invisible-character problem.
  - [ ] Production needs one-time/live prices set up correctly.
  - [ ] Production's checkout and practice counter are currently broken by the new
        database permissions, which is acceptable only because there are no paying users.
- [ ] **Access start date:** the webhook starts access when it processes the event, not
      when the customer paid, so a delayed webhook gives the customer extra days. The fix
      is one line: use the event's timestamp.
- [ ] **Duplicate test charge:** the test user's second 90-Day purchase (9/27) was never
      re-sent. Refund it in the Stripe test dashboard.
- [ ] **Hand-edited profile:** one profile has `subscription_tier = 'annual'`, which the
      app never writes. It still counts as paid.

## Commits on `staging` (in order)

| Commit | Description |
|--------|-------------|
| `d068072` | Session 34: upgrade flow + webhook idempotency |
| `578add0` | `CLAUDE.md` for Sessions 33/34 |
| `9a63506` | Session 35: billing writes locked down |
| `4a428d4` | `CLAUDE.md`: Sessions 34/35 done |
| `fdc68b0` | Merge Sessions 34 + 35 into staging |
| `634e61e` | Session 36: lint + server-owned practice counter |
| `6e5e63e` | Session 37: post-checkout UI, purchase guard, Annual fix |
| `9884fa9` | Empty commit: redeploy for the new webhook secret |
| `cc5ab09` | Middleware skips `/api/*` (the webhook fix) |
| `e5eda70` | Empty commit: redeploy with fixed env vars |
| `97fac9e` | `CLAUDE.md`: deploy and env var gotchas |

## Database migrations applied to the live database

| Migration | Purpose |
|-----------|---------|
| `20260927_annual_upgrade_and_webhook_idempotency.sql` | Session 34 |
| `20260927120000_restrict_profile_billing_writes.sql` | Session 35 |
| `20260927130000_restrict_practice_counter_writes.sql` | Session 36 |

All three were applied with `supabase db query -f`, not `db push`.
