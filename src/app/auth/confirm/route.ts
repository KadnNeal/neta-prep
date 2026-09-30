import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: EmailOtpType[] = ["invite", "recovery", "email", "signup", "email_change"];

/**
 * Landing route for Supabase email links (beta invites). The email template links
 * here with ?token_hash=…&type=invite&next=/set-password; verifying server-side sets
 * the session cookie, then we continue to `next`. (/auth/callback only handles the
 * OAuth ?code= flow.)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const nextParam = url.searchParams.get("next") ?? "/dashboard";
  // Only same-site relative paths — never an open redirect
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
      console.error("[auth/confirm] verifyOtp failed", error.message);
    } catch (err) {
      console.error("[auth/confirm]", err);
    }
  }

  // Expired, already-used, or malformed link
  return NextResponse.redirect(new URL("/login?error=link_expired", url.origin));
}
