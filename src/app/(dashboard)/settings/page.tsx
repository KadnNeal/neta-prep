import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { isActivePro } from "@/lib/stripe";
import type { ProfileSubscription } from "@/lib/stripe";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("username, subscription_tier, subscription_status, subscription_expires_at, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as unknown as {
    username: string | null;
    subscription_tier: string | null;
    subscription_status: string | null;
    subscription_expires_at: string | null;
    stripe_customer_id: string | null;
  } | null;

  const isOAuthUser = (user.app_metadata?.provider ?? "email") !== "email";
  const isPro = profile ? isActivePro(profile as ProfileSubscription) : false;

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Manage your account and preferences
          </p>
        </div>

        <SettingsClient
          userId={user.id}
          email={user.email ?? ""}
          username={profile?.username ?? ""}
          isOAuthUser={isOAuthUser}
          subscriptionTier={isPro ? "pro" : "free"}
          subscriptionStatus={profile?.subscription_status ?? null}
          subscriptionExpiresAt={profile?.subscription_expires_at ?? null}
          hasStripeCustomer={!!profile?.stripe_customer_id}
        />
      </div>
    </main>
  );
}
