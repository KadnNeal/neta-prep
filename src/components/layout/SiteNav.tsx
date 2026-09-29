"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { PlanBadge } from "@/components/layout/PlanBadge";
import { LogoutButton } from "@/components/layout/LogoutButton";
import type { SubscriptionPlan } from "@/lib/stripe";

export function SiteNav({
  plan = null,
  expiresAt = null,
  isLoggedIn = true,
}: {
  /** Active paid plan from the profile (see currentPlan()); null = free */
  plan?: SubscriptionPlan | "unknown" | null;
  expiresAt?: string | null;
  /** False on public pages (e.g. /pricing) viewed while logged out — hides plan badge + Log out */
  isLoggedIn?: boolean;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isPricing = pathname === "/pricing";
  const { isDark, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-150"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            width={22}
            height={22}
            className="shrink-0"
          />
          Pass NETA
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {!isDashboard && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors duration-150 px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              <LayoutDashboard size={14} className="shrink-0" />
              Dashboard
            </Link>
          )}
          {isLoggedIn && (
            <span className="px-1.5">
              <PlanBadge plan={plan} expiresAt={expiresAt} showUpgrade={!isPricing} />
            </span>
          )}
          <Link
            href="/settings"
            aria-label="Settings"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
              pathname === "/settings"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Settings size={15} />
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {isLoggedIn && <LogoutButton />}
        </div>
      </div>
    </nav>
  );
}
