import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { stripe, ONE_TIME_PRICES, VALID_PRICE_IDS, PLAN_BY_PRICE, PRICE_IDS, currentPlan } from "@/lib/stripe";
import type { ProfileSubscription } from "@/lib/stripe";

interface CheckoutBody {
  priceId: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { priceId } = (await request.json()) as CheckoutBody;
    if (!VALID_PRICE_IDS.has(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Read billing state with the service role so the guard never sees a stale or
    // client-influenced value.
    const admin = createAdminClient();
    const { data: profileRaw, error: profileError } = await admin
      .from("profiles")
      .select("subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id, subscription_plan")
      .eq("id", user.id)
      .single();
    if (profileError) throw profileError;
    const profile = profileRaw as unknown as ProfileSubscription & { subscription_plan: string | null };

    // Duplicate-purchase guard: anyone with active paid access manages it in Settings.
    // 90-Day Pass → Annual goes through /api/upgrade-to-annual so the pass is credited.
    const plan = currentPlan(profile);
    if (plan) {
      const isPassUpgrade = plan === "90_day_pass" && priceId === PRICE_IDS.annual;
      return NextResponse.json(
        {
          error: isPassUpgrade
            ? "Upgrade from Settings so your 90-Day Pass is credited"
            : "Already subscribed — manage your billing in Settings",
          code: isPassUpgrade ? "use_upgrade" : "already_subscribed",
        },
        { status: 400 },
      );
    }

    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      // stripe_customer_id is a billing column — users can't write it, so use the service role
      const { error: saveError } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId } as object)
        .eq("id", user.id);
      if (saveError) throw saveError;
    }

    const mode = ONE_TIME_PRICES.has(priceId) ? "payment" : "subscription";
    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/pricing`,
      metadata: { supabase_user_id: user.id, plan: PLAN_BY_PRICE[priceId] },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
