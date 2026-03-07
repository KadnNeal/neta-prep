"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.session) {
        setMessage(
          "Account created! Check your email to confirm before signing in."
        );
        return;
      }

      router.push("/drill");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-4">
          <span className="text-primary font-bold text-lg">N</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          NETA Prep
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Create your account
        </p>
      </div>

      {/* Form card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
        {message ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <span className="text-green-400 text-lg">✓</span>
            </div>
            <p className="text-foreground text-sm font-medium">{message}</p>
            <Link
              href="/login"
              className="block text-primary hover:opacity-80 text-sm font-medium transition-all duration-150"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150"
              />
              <p className="text-muted-foreground text-xs">
                Minimum 6 characters
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}
      </div>

      {!message && (
        <p className="text-center text-muted-foreground text-sm mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:opacity-80 font-medium transition-all duration-150"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
