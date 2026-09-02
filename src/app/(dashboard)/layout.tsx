import { SiteNav } from "@/components/layout/SiteNav";
import { createClient } from "@/lib/supabase/server";
import { isActivePro } from "@/lib/stripe";
import type { ProfileSubscription } from "@/lib/stripe";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let subscriptionTier: "free" | "pro" = "free";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
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
    // Auth error — default to free
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav subscriptionTier={subscriptionTier} />
      {children}
    </div>
  );
}
