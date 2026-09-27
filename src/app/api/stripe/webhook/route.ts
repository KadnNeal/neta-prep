import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe, addDays, PLAN_ACCESS_DAYS } from "@/lib/stripe";
import type { SubscriptionPlan, UpgradeType } from "@/lib/stripe";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

// Billing columns on profiles are not writable by the authenticated role
// (see 20260927120000_restrict_profile_billing_writes.sql) — service role only.
function adminClient() {
  return createAdminClient();
}

async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const supabase = adminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id" as "id", customerId)
    .single();
  return (data as unknown as { id: string } | null)?.id ?? null;
}

async function updateProfile(userId: string, fields: Record<string, unknown>) {
  const supabase = adminClient();
  const { error } = await supabase.from("profiles").update(fields as object).eq("id", userId);
  if (error) throw error;
}

/**
 * Atomically claims an event by inserting its id (primary key). Returns false
 * if another delivery already claimed it — no separate check-then-insert race.
 */
async function claimEvent(eventId: string): Promise<boolean> {
  const supabase = adminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("processed_stripe_events")
    .insert({ event_id: eventId });
  if (!error) return true;
  if ((error as { code?: string }).code === "23505") return false; // unique_violation
  throw error;
}

/** Releases a claim after a processing failure so Stripe's retry can reprocess it. */
async function releaseEvent(eventId: string) {
  const supabase = adminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("processed_stripe_events")
    .delete()
    .eq("event_id", eventId);
  if (error) console.error("[stripe/webhook] failed to release event claim", eventId, error);
}

function isPlan(value: string | undefined): value is SubscriptionPlan {
  return !!value && value in PLAN_ACCESS_DAYS;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  if (!userId) return;

  const upgradeType = session.metadata?.upgrade_type as UpgradeType | undefined;
  // Amount actually paid for the product: after discounts, excluding tax (Stripe
  // Managed Payments adds tax on top), so upgrade credit matches the list price basis.
  const amountPaid = (session.amount_total ?? 0) - (session.total_details?.amount_tax ?? 0);
  const now = new Date();
  // Save the customer Stripe used (Checkout creates one if the session had none) so
  // customer.subscription.deleted can find this user later.
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const customerField = customerId ? { stripe_customer_id: customerId } : {};

  if (upgradeType === "90_day_to_annual_backdated") {
    const originalStartedAt = session.metadata?.original_access_started_at;
    if (!originalStartedAt) throw new Error("Missing original_access_started_at on backdated upgrade");
    const originalAmountPaid = Number(session.metadata?.original_amount_paid ?? 0);

    // access_started_at is left untouched — the subscription's first renewal is anchored
    // to original pass start + 365 days. Annual is recurring, so no fixed expiry.
    await updateProfile(userId, {
      ...customerField,
      subscription_tier: "pro",
      subscription_status: "active",
      subscription_plan: "annual",
      subscription_expires_at: null,
      stripe_amount_paid: originalAmountPaid + amountPaid,
    });
    return;
  }

  if (upgradeType === "annual_fresh_after_expired_pass") {
    await updateProfile(userId, {
      ...customerField,
      subscription_tier: "pro",
      subscription_status: "active",
      subscription_plan: "annual",
      access_started_at: now.toISOString(),
      subscription_expires_at: null,
      stripe_amount_paid: amountPaid,
    });
    return;
  }

  // Standard purchase. Sessions created before `plan` metadata existed fall back to mode.
  const metaPlan = session.metadata?.plan;
  const plan: SubscriptionPlan = isPlan(metaPlan)
    ? metaPlan
    : session.mode === "payment" ? "90_day_pass" : "monthly";
  const accessDays = PLAN_ACCESS_DAYS[plan];

  await updateProfile(userId, {
    ...customerField,
    subscription_tier: "pro",
    subscription_status: "active",
    subscription_plan: plan,
    access_started_at: now.toISOString(),
    subscription_expires_at: accessDays ? addDays(now, accessDays).toISOString() : null,
    stripe_amount_paid: amountPaid,
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const claimed = await claimEvent(event.id);
    if (!claimed) return NextResponse.json({ received: true, duplicate: true });
  } catch (err) {
    console.error("[stripe/webhook] failed to claim event", event.id, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const userId = await getUserIdByCustomer(customerId);
        if (!userId) break;

        await updateProfile(userId, {
          subscription_tier: "free",
          subscription_status: "cancelled",
          subscription_expires_at: null,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        const userId = await getUserIdByCustomer(customerId);
        if (!userId) break;

        await updateProfile(userId, { subscription_status: "past_due" });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] handler error", event.type, err);
    await releaseEvent(event.id);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
