"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function SiteNav({
  subscriptionTier = "free",
}: {
  subscriptionTier?: "free" | "pro";
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
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-xs leading-none">N</span>
          </div>
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
          {subscriptionTier === "free" && !isPricing && (
            <Link
              href="/pricing"
              className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors duration-150 px-3 py-1.5 rounded-lg border border-primary/20"
            >
              Upgrade
            </Link>
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
        </div>
      </div>
    </nav>
  );
}
