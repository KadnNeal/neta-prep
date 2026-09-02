"use client";

import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Moon, Sun, XCircle } from "lucide-react";

// ── Shared section wrapper ─────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function StatusMessage({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm px-3.5 py-2.5 rounded-lg border ${
        type === "success"
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={14} className="shrink-0" />
      ) : (
        <XCircle size={14} className="shrink-0" />
      )}
      {message}
    </div>
  );
}

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete={autoComplete}
        className={`w-full px-3.5 py-2.5 border rounded-lg text-foreground text-sm focus:outline-none transition-all duration-150 ${
          readOnly
            ? "bg-muted/50 border-border text-muted-foreground cursor-default"
            : "bg-muted border-border focus:border-primary focus:ring-1 focus:ring-primary"
        }`}
      />
    </div>
  );
}

function getPasswordErrors(pw: string): string[] {
  const errs: string[] = [];
  if (pw.length < 8) errs.push("At least 8 characters");
  if (!/[A-Z]/.test(pw)) errs.push("One uppercase letter");
  if (!/[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(pw))
    errs.push("One special character");
  return errs;
}

// ── Profile section ────────────────────────────────────────────────────────────

function ProfileSection({
  userId,
  initialUsername,
  email,
  isOAuthUser,
}: {
  userId: string;
  initialUsername: string;
  email: string;
  isOAuthUser: boolean;
}) {
  const [username, setUsername] = useState(initialUsername);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ username: username.trim() || null })
        .eq("id", userId);

      if (error) throw error;
      setStatus({ type: "success", message: "Display name updated." });
    } catch {
      setStatus({ type: "error", message: "Failed to save. Try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Profile">
      <InputField
        id="display-name"
        label="Display name"
        value={username}
        onChange={setUsername}
        placeholder="Your name"
        autoComplete="name"
      />
      <InputField
        id="email"
        label={`Email${isOAuthUser ? " (managed by Google)" : ""}`}
        value={email}
        readOnly
      />
      {status && <StatusMessage type={status.type} message={status.message} />}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-150"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </Section>
  );
}

// ── Change Password section ───────────────────────────────────────────────────

function ChangePasswordSection({ email }: { email: string }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwErrors, setPwErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleNewPwChange(v: string) {
    setNewPw(v);
    setPwErrors(getPasswordErrors(v));
  }

  const canSave =
    currentPw.length > 0 &&
    pwErrors.length === 0 &&
    newPw.length >= 8 &&
    confirmPw === newPw;

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const supabase = createClient();

      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPw,
      });
      if (signInError) {
        setStatus({ type: "error", message: "Current password is incorrect." });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;

      setStatus({ type: "success", message: "Password updated successfully." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwErrors([]);
    } catch {
      setStatus({ type: "error", message: "Failed to update password. Try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Change Password">
      <InputField
        id="current-password"
        label="Current password"
        type="password"
        value={currentPw}
        onChange={setCurrentPw}
        placeholder="••••••••"
        autoComplete="current-password"
      />
      <div className="space-y-1.5">
        <label htmlFor="new-password" className="block text-sm font-medium text-foreground">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={newPw}
          onChange={(e) => handleNewPwChange(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          className={`w-full px-3.5 py-2.5 bg-muted border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 transition-all duration-150 ${
            newPw.length > 0 && pwErrors.length > 0
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
              : newPw.length > 0 && pwErrors.length === 0
              ? "border-green-500/60 focus:border-green-500 focus:ring-green-500/30"
              : "border-border focus:border-primary focus:ring-primary"
          }`}
        />
        {newPw.length > 0 && (
          <ul className="space-y-1 pt-0.5">
            {(["At least 8 characters", "One uppercase letter", "One special character"] as const).map((rule) => {
              const failing = pwErrors.includes(rule);
              return (
                <li key={rule} className="flex items-center gap-1.5">
                  {failing ? (
                    <XCircle size={11} className="text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle2 size={11} className="text-green-400 shrink-0" />
                  )}
                  <span className={`text-xs ${failing ? "text-red-400" : "text-green-400"}`}>
                    {rule}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm-new-password" className="block text-sm font-medium text-foreground">
          Confirm new password
        </label>
        <input
          id="confirm-new-password"
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          className={`w-full px-3.5 py-2.5 bg-muted border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 transition-all duration-150 ${
            confirmPw.length > 0 && confirmPw !== newPw
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
              : confirmPw.length > 0 && confirmPw === newPw
              ? "border-green-500/60 focus:border-green-500 focus:ring-green-500/30"
              : "border-border focus:border-primary focus:ring-primary"
          }`}
        />
        {confirmPw.length > 0 && confirmPw !== newPw && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <XCircle size={11} className="shrink-0" />
            Passwords don&apos;t match
          </p>
        )}
      </div>
      {status && <StatusMessage type={status.type} message={status.message} />}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !canSave}
          className="bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        >
          {saving ? "Updating…" : "Update Password"}
        </button>
      </div>
    </Section>
  );
}

// ── Change Email section ───────────────────────────────────────────────────────

function ChangeEmailSection({ currentEmail }: { currentEmail: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const canSave = newEmail.length > 0 && currentPw.length > 0 && newEmail !== currentEmail;

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPw,
      });
      if (signInError) {
        setStatus({ type: "error", message: "Current password is incorrect." });
        return;
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      setStatus({
        type: "success",
        message: "Confirmation sent to your new email address. Check your inbox.",
      });
      setNewEmail("");
      setCurrentPw("");
    } catch {
      setStatus({ type: "error", message: "Failed to update email. Try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Change Email">
      <InputField
        id="new-email"
        label="New email address"
        type="email"
        value={newEmail}
        onChange={setNewEmail}
        placeholder="newemail@example.com"
        autoComplete="email"
      />
      <InputField
        id="email-current-password"
        label="Current password (to confirm)"
        type="password"
        value={currentPw}
        onChange={setCurrentPw}
        placeholder="••••••••"
        autoComplete="current-password"
      />
      {status && <StatusMessage type={status.type} message={status.message} />}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !canSave}
          className="bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        >
          {saving ? "Sending confirmation…" : "Update Email"}
        </button>
      </div>
    </Section>
  );
}

// ── Appearance section ─────────────────────────────────────────────────────────

function AppearanceSection() {
  const { isDark, toggle } = useTheme();

  return (
    <Section title="Appearance">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Theme</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isDark ? "Dark mode" : "Light mode"}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
            isDark ? "bg-primary" : "bg-muted border border-border"
          }`}
          role="switch"
          aria-checked={isDark}
        >
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${
              isDark ? "translate-x-5" : "translate-x-0.5"
            }`}
          >
            {isDark ? (
              <Moon size={10} className="text-zinc-700" />
            ) : (
              <Sun size={10} className="text-zinc-500" />
            )}
          </span>
        </button>
      </div>
    </Section>
  );
}

// ── Subscription section ───────────────────────────────────────────────────────

function SubscriptionSection({
  subscriptionTier,
  subscriptionStatus,
  subscriptionExpiresAt,
  hasStripeCustomer,
}: {
  subscriptionTier: "free" | "pro";
  subscriptionStatus: string | null;
  subscriptionExpiresAt: string | null;
  hasStripeCustomer: boolean;
}) {
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  async function handleManageBilling() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(data.error ?? "Could not open billing portal.");
        setPortalLoading(false);
      }
    } catch {
      setPortalError("Could not open billing portal.");
      setPortalLoading(false);
    }
  }

  const isPro = subscriptionTier === "pro";

  const tierLabel = isPro ? "Pro" : "Free";
  const statusBadge = subscriptionStatus === "past_due" ? "Past Due" : isPro ? "Active" : "Free";
  const badgeColor =
    subscriptionStatus === "past_due"
      ? "bg-red-500/10 border-red-500/20 text-red-400"
      : isPro
      ? "bg-green-500/10 border-green-500/20 text-green-500"
      : "bg-muted border-border text-muted-foreground";

  const expiryLine = (() => {
    if (!isPro) return null;
    if (subscriptionExpiresAt) {
      const d = new Date(subscriptionExpiresAt);
      return `Access expires ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return "Renews automatically";
  })();

  return (
    <Section title="Subscription">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{tierLabel} Plan</p>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${badgeColor}`}>
              {statusBadge}
            </span>
          </div>
          {expiryLine && (
            <p className="text-xs text-muted-foreground">{expiryLine}</p>
          )}
          {!isPro && (
            <p className="text-xs text-muted-foreground">
              Upgrade to unlock AI explanations, exam simulator, and all roadmap modules.
            </p>
          )}
          {subscriptionStatus === "past_due" && (
            <p className="text-xs text-red-400">
              Payment failed — update your payment method to restore access.
            </p>
          )}
        </div>
        <div className="shrink-0">
          {isPro && hasStripeCustomer ? (
            <button
              type="button"
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="bg-card border border-border text-foreground font-medium text-sm px-4 py-2 rounded-lg hover:border-primary/40 disabled:opacity-50 transition-all duration-150"
            >
              {portalLoading ? "Loading…" : "Manage Billing"}
            </button>
          ) : (
            <a
              href="/pricing"
              className="inline-block bg-primary text-primary-foreground font-medium text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-150"
            >
              Upgrade
            </a>
          )}
        </div>
      </div>
      {portalError && <StatusMessage type="error" message={portalError} />}
    </Section>
  );
}

// ── Danger Zone section ────────────────────────────────────────────────────────

function DangerZoneSection() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed");

      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  }

  return (
    <div className="bg-card border border-red-500/20 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-red-500/20">
        <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider">
          Danger Zone
        </h2>
      </div>
      <div className="px-6 py-5 space-y-4">
        {!showConfirm ? (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="shrink-0 bg-red-500/10 border border-red-500/30 text-red-400 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all duration-150"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm font-semibold mb-1">
                This will permanently delete:
              </p>
              <ul className="text-red-400/80 text-xs space-y-0.5">
                <li>· Your account and profile</li>
                <li>· All study progress and SM-2 data</li>
                <li>· All exam simulation results</li>
                <li>· All roadmap progress</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all duration-150 font-mono"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText("");
                  setError(null);
                }}
                className="flex-1 bg-card border border-border text-foreground font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-muted transition-all duration-150"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || deleting}
                className="flex-1 bg-red-500 text-white font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
              >
                {deleting ? "Deleting…" : "Delete My Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

interface Props {
  userId: string;
  email: string;
  username: string;
  isOAuthUser: boolean;
  subscriptionTier: "free" | "pro";
  subscriptionStatus: string | null;
  subscriptionExpiresAt: string | null;
  hasStripeCustomer: boolean;
}

export function SettingsClient({
  userId,
  email,
  username,
  isOAuthUser,
  subscriptionTier,
  subscriptionStatus,
  subscriptionExpiresAt,
  hasStripeCustomer,
}: Props) {
  return (
    <div className="space-y-5">
      <ProfileSection
        userId={userId}
        initialUsername={username}
        email={email}
        isOAuthUser={isOAuthUser}
      />
      {!isOAuthUser && <ChangePasswordSection email={email} />}
      {!isOAuthUser && <ChangeEmailSection currentEmail={email} />}
      <AppearanceSection />
      <SubscriptionSection
        subscriptionTier={subscriptionTier}
        subscriptionStatus={subscriptionStatus}
        subscriptionExpiresAt={subscriptionExpiresAt}
        hasStripeCustomer={hasStripeCustomer}
      />
      <DangerZoneSection />
    </div>
  );
}
