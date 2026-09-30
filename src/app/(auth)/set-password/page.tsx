"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PASSWORD_RULES, getPasswordErrors } from "@/lib/password";

/**
 * Invited beta testers land here (via /auth/confirm, already signed in) to choose
 * a password before continuing to onboarding.
 */
export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordErrors = getPasswordErrors(password);
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const canSubmit = passwordErrors.length === 0 && confirmPassword === password && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      // Full navigation so middleware routes new users to level selection
      window.location.href = "/onboarding/select-level";
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        /session|auth/i.test(message)
          ? "Your invite link has expired. Ask for a new invite, then open the newest email."
          : "Couldn't save your password. Please try again.",
      );
      setSaving(false);
    }
  }

  const inputClass = (state: "neutral" | "ok" | "bad") =>
    `w-full px-3.5 py-2.5 bg-muted border rounded-lg text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-1 transition-all duration-150 ${
      state === "bad"
        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
        : state === "ok"
          ? "border-green-500/60 focus:border-green-500 focus:ring-green-500/30"
          : "border-border focus:border-primary focus:ring-primary"
    }`;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
          Welcome to the Pass NETA beta
        </h1>
        <p className="text-muted-foreground text-sm">Choose a password to finish setting up your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass(password.length === 0 ? "neutral" : passwordErrors.length ? "bad" : "ok")}
          />
          {password.length > 0 && (
            <ul className="space-y-1 pt-0.5">
              {PASSWORD_RULES.map((rule) => {
                const failing = passwordErrors.includes(rule);
                return (
                  <li key={rule} className="flex items-center gap-1.5">
                    {failing ? (
                      <XCircle size={11} className="text-red-400 shrink-0" />
                    ) : (
                      <CheckCircle2 size={11} className="text-green-400 shrink-0" />
                    )}
                    <span className={`text-xs ${failing ? "text-red-400" : "text-green-400"}`}>{rule}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass(confirmPassword.length === 0 ? "neutral" : mismatch ? "bad" : "ok")}
          />
          {mismatch && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <XCircle size={11} className="shrink-0" />
              Passwords don&apos;t match
            </p>
          )}
        </div>

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full min-h-[44px] py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        >
          {saving ? "Saving…" : "Set password and continue"}
        </button>
      </form>
    </div>
  );
}
