import { createClient } from "@/lib/supabase/server";
import { isActivePro } from "@/lib/stripe";
import type { ProfileSubscription } from "@/lib/stripe";
import { SiteNav } from "@/components/layout/SiteNav";
import { PricingClient } from "@/components/pricing/PricingClient";

export default async function PricingPage() {
  let subscriptionTier: "free" | "pro" = "free";
  let isLoggedIn = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id")
        .eq("id", user.id)
        .single();
      if (profile && isActivePro(profile as unknown as ProfileSubscription)) {
        subscriptionTier = "pro";
      }
    }
  } catch {
    // Not logged in or error — treat as free
  }

  return (
    <>
      <SiteNav subscriptionTier={subscriptionTier} />
      <PricingClient isLoggedIn={isLoggedIn} subscriptionTier={subscriptionTier} />
    </>
  );
}
