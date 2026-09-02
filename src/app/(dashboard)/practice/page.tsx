import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isActivePro } from "@/lib/stripe";
import type { ProfileSubscription } from "@/lib/stripe";
import { PracticeClient } from "@/components/practice/PracticeClient";

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const subscriptionTier: "free" | "pro" =
    profileRaw && isActivePro(profileRaw as unknown as ProfileSubscription) ? "pro" : "free";

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <PracticeClient subscriptionTier={subscriptionTier} />
      </div>
    </main>
  );
}
