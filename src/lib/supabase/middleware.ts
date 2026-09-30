import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refresh the session — must call getUser() not getSession() for security.
  // See: https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // API routes authenticate themselves (401 JSON / Stripe signature) — never
  // redirect them to HTML pages. The Stripe webhook has no user session at all.
  if (pathname.startsWith("/api/")) return supabaseResponse;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth");
  const isOnboardingPage = pathname.startsWith("/onboarding");
  const isSettingsPage = pathname.startsWith("/settings");
  // Invited beta testers set a password here before choosing a level (requires a session)
  const isSetPasswordPage = pathname.startsWith("/set-password");
  // Public routes — never require auth
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/pricing" ||
    pathname === "/terms" ||
    isAuthPage ||
    isOnboardingPage;

  // Redirect unauthenticated users to landing page for any protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from landing page to dashboard
  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // For authenticated users on protected pages, enforce level selection.
  // No user may access any feature until profiles.neta_target_level is set.
  if (user && !isAuthPage && !isOnboardingPage && !isSettingsPage && !isSetPasswordPage && pathname !== "/") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("neta_target_level")
        .eq("id", user.id)
        .single();

      if (!profile?.neta_target_level) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding/select-level";
        return NextResponse.redirect(url);
      }
    } catch {
      // Non-critical — proceed normally on DB error
    }
  }

  return supabaseResponse;
}
