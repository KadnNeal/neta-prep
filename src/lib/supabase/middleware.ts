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

  // Redirect unauthenticated users to /login, except for auth-related pages
  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth");
  const isOnboardingPage = pathname.startsWith("/onboarding");
  const isSettingsPage = pathname.startsWith("/settings");

  if (!user && !isAuthPage && !isOnboardingPage && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // For authenticated users on protected pages, enforce level selection.
  // No user may access any feature until profiles.neta_target_level is set.
  if (user && !isAuthPage && !isOnboardingPage && !isSettingsPage && pathname !== "/") {
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
