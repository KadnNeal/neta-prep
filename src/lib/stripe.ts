import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export const PRICE_IDS = {
  monthly: "price_1TwBWiGO8TgYfwMNwySrPsXi",
  annual:  "price_1TwBXJGO8TgYfwMNfnF7f9Kw",
  pass90:  "price_1TwBYkGO8TgYfwMNV9fpFBZS",
} as const;

// One-time payments (not subscriptions)
export const ONE_TIME_PRICES = new Set<string>([PRICE_IDS.pass90, PRICE_IDS.annual]);
export const VALID_PRICE_IDS = new Set<string>(Object.values(PRICE_IDS));

export type SubscriptionPlan = "monthly" | "90_day_pass" | "annual";

export const PLAN_BY_PRICE: Record<string, SubscriptionPlan> = {
  [PRICE_IDS.monthly]: "monthly",
  [PRICE_IDS.pass90]: "90_day_pass",
  [PRICE_IDS.annual]: "annual",
};

/** Access length for one-time plans; null = recurring (no fixed expiry). */
export const PLAN_ACCESS_DAYS: Record<SubscriptionPlan, number | null> = {
  monthly: null,
  "90_day_pass": 90,
  annual: 365,
};

export const ANNUAL_PRICE_CENTS = 29900;

export type UpgradeType = "90_day_to_annual_backdated" | "annual_fresh_after_expired_pass";

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * DAY_MS);
}

export interface ProfileSubscription {
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_expires_at: string | null;
  stripe_customer_id: string | null;
}

/** Returns true when the profile has a valid active paid subscription. */
export function isActivePro(p: ProfileSubscription): boolean {
  if (!p.subscription_tier || p.subscription_tier === "free") return false;
  if (p.subscription_expires_at && new Date(p.subscription_expires_at) < new Date()) return false;
  if (p.subscription_status && !["active", "trialing"].includes(p.subscription_status)) return false;
  return true;
}
