import { createClient } from "@/lib/supabase/server";
import { currentPlan } from "@/lib/stripe";
import type { ProfileSubscription, SubscriptionPlan } from "@/lib/stripe";
import { SiteNav } from "@/components/layout/SiteNav";
import { PricingClient } from "@/components/pricing/PricingClient";

export default async function PricingPage() {
  let plan: SubscriptionPlan | "unknown" | null = null;
  let amountPaidCents: number | null = null;
  let expiresAt: string | null = null;
  let isLoggedIn = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id, subscription_plan, stripe_amount_paid")
        .eq("id", user.id)
        .single();
      const p = profile as unknown as
        | (ProfileSubscription & { subscription_plan: string | null; stripe_amount_paid: number | null })
        | null;
      if (p) {
        plan = currentPlan(p);
        amountPaidCents = p.stripe_amount_paid;
        expiresAt = p.subscription_expires_at;
      }
    }
  } catch {
    // Not logged in or error — treat as free
  }

  return (
    <>
      <SiteNav plan={plan} expiresAt={expiresAt} isLoggedIn={isLoggedIn} />
      <PricingClient isLoggedIn={isLoggedIn} currentPlan={plan} amountPaidCents={amountPaidCents} />
    </>
  );
}
