import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS, ANNUAL_PRICE_CENTS, addDays } from "@/lib/stripe";
import type { UpgradeType } from "@/lib/stripe";

// Stripe's minimum charge for USD Checkout Sessions
const STRIPE_MIN_CHARGE_CENTS = 50;
// Tax code on the Pass NETA products in Stripe (txcd_10103001)
const STRIPE_TAX_CODE = "txcd_10103001";

interface UpgradeProfile {
  stripe_customer_id: string | null;
  subscription_plan: string | null;
  access_started_at: string | null;
  subscription_expires_at: string | null;
  stripe_amount_paid: number | null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profileRaw } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_plan, access_started_at, subscription_expires_at, stripe_amount_paid")
      .eq("id", user.id)
      .single();
    const profile = profileRaw as unknown as UpgradeProfile | null;

    if (!profile || profile.subscription_plan !== "90_day_pass") {
      return NextResponse.json({ error: "Only 90-Day Pass holders can upgrade to Annual" }, { status: 400 });
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";
    const customer = profile.stripe_customer_id ?? undefined;
    const successUrl = `${origin}/settings?upgraded=true`;
    const cancelUrl = `${origin}/settings`;

    const isExpired =
      !profile.subscription_expires_at || new Date(profile.subscription_expires_at) <= new Date();

    if (isExpired) {
      const upgradeType: UpgradeType = "annual_fresh_after_expired_pass";
      const session = await stripe.checkout.sessions.create({
        customer,
        mode: "subscription",
        line_items: [{ price: PRICE_IDS.annual, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { supabase_user_id: user.id, upgrade_type: upgradeType, plan: "annual" },
        allow_promotion_codes: true,
      });
      return NextResponse.json({ url: session.url });
    }

    if (profile.stripe_amount_paid === null || !profile.access_started_at) {
      return NextResponse.json(
        { error: "We couldn't find your original purchase details. Please contact support to upgrade." },
        { status: 400 },
      );
    }

    const difference = Math.max(ANNUAL_PRICE_CENTS - profile.stripe_amount_paid, 0);
    if (difference < STRIPE_MIN_CHARGE_CENTS) {
      return NextResponse.json(
        { error: "No payment is needed for this upgrade. Please contact support to apply it." },
        { status: 400 },
      );
    }

    // Annual is a yearly subscription. Charge only the difference today (one-time
    // line item, paid on the first invoice) and trial the recurring $299 until
    // original pass start + 365 days, so the first renewal lands on the anniversary.
    // (Stripe rejects proration_behavior "none" alongside one-time prices.)
    const renewsAt = addDays(new Date(profile.access_started_at), 365);
    const upgradeType: UpgradeType = "90_day_to_annual_backdated";
    const session = await stripe.checkout.sessions.create({
      customer,
      mode: "subscription",
      subscription_data: { trial_end: Math.floor(renewsAt.getTime() / 1000) },
      line_items: [
        { price: PRICE_IDS.annual, quantity: 1 },
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: difference,
            product_data: {
              name: "Annual Access — upgrade from 90-Day Pass",
              // Required by Stripe Managed Payments; same code as the Annual product
              tax_code: STRIPE_TAX_CODE,
              description: "90-Day Pass credit applied. Your annual plan renews one year after your original pass start date.",
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabase_user_id: user.id,
        upgrade_type: upgradeType,
        original_access_started_at: profile.access_started_at,
        original_amount_paid: String(profile.stripe_amount_paid),
        plan: "annual",
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[upgrade-to-annual]", err);
    return NextResponse.json({ error: "Upgrade checkout failed" }, { status: 500 });
  }
}
