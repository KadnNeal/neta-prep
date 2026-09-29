import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Only NETA Level 2 is open for selection right now (3 and 4 are "coming soon")
const BodySchema = z.object({ level: z.literal(2) });

/**
 * Saves the user's target NETA level. Upserts with the service role so it also
 * works when the signup trigger didn't create a profiles row — a plain user
 * UPDATE on a missing row silently changes nothing and loops onboarding.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const { error } = await createAdminClient()
      .from("profiles")
      .upsert({ id: user.id, neta_target_level: parsed.data.level }, { onConflict: "id" });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding/level]", err);
    return NextResponse.json({ error: "Couldn't save your level. Please try again." }, { status: 500 });
  }
}
