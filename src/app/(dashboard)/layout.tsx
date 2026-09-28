import { SiteNav } from "@/components/layout/SiteNav";
import { Suspense } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { UpgradeSuccessNotice } from "@/components/billing/UpgradeSuccessNotice";
import { createClient } from "@/lib/supabase/server";
import { currentPlan } from "@/lib/stripe";
import type { ProfileSubscription, SubscriptionPlan } from "@/lib/stripe";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let plan: SubscriptionPlan | "unknown" | null = null;
  let expiresAt: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id, subscription_plan")
        .eq("id", user.id)
        .single();
      const p = profile as unknown as (ProfileSubscription & { subscription_plan: string | null }) | null;
      if (p) {
        plan = currentPlan(p);
        expiresAt = p.subscription_expires_at;
      }
    }
  } catch {
    // Auth error — default to free
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav plan={plan} expiresAt={expiresAt} />
      <Suspense fallback={null}>
        <UpgradeSuccessNotice isPro={plan !== null} />
      </Suspense>
      <div className="flex-1">{children}</div>
      <AppFooter />
    </div>
  );
}
