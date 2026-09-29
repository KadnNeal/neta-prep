"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleLogout() {
    setPending(true);
    setFailed(false);
    try {
      // This device only — other signed-in devices stay signed in
      const { error } = await createClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      // Full navigation (not router.push) so no signed-in page stays in the client cache
      window.location.href = "/";
    } catch (err) {
      console.error("[logout]", err);
      setFailed(true);
      setPending(false);
    }
  }

  const label = failed ? "Log out failed — try again" : "Log out";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      aria-label={label}
      title={label}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-50 ${
        failed
          ? "text-red-400 bg-red-500/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <LogOut size={15} />
    </button>
  );
}
