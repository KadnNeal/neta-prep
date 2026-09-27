"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

const REFRESH_INTERVAL_MS = 2000;
const MAX_REFRESHES = 10;

/**
 * Shown after Stripe redirects back with ?upgraded=true. Strips the param from
 * the URL, then — because the webhook can land a moment after the redirect —
 * re-renders the server tree (layout nav included) until the profile reads pro.
 */
export function UpgradeSuccessNotice({ isPro }: { isPro: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible] = useState(() => searchParams.get("upgraded") === "true");
  const [refreshes, setRefreshes] = useState(0);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") router.replace(pathname);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (!visible || isPro || refreshes >= MAX_REFRESHES) return;
    const id = setTimeout(() => {
      router.refresh();
      setRefreshes((n) => n + 1);
    }, REFRESH_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [visible, isPro, refreshes, router]);

  if (!visible) return null;

  const pending = !isPro && refreshes < MAX_REFRESHES;

  return (
    <div className="max-w-5xl mx-auto px-6 pt-6">
      <div
        role="status"
        className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4"
      >
        {pending ? (
          <Loader2 size={18} className="text-green-500 animate-spin shrink-0" />
        ) : (
          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
        )}
        <p className="text-sm text-foreground">
          {isPro
            ? "Payment received — your full access is active."
            : pending
              ? "Payment received — activating your access…"
              : "Payment received. Your access is still activating — refresh in a minute, or contact support if it doesn't appear."}
        </p>
      </div>
    </div>
  );
}
