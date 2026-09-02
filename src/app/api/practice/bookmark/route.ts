import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { questionId } = (await request.json()) as { questionId: string };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { data: existing } = await db
      .from("bookmarked_questions")
      .select("id")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .single();

    if (existing) {
      await db
        .from("bookmarked_questions")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", questionId);
      return NextResponse.json({ bookmarked: false });
    }

    await db
      .from("bookmarked_questions")
      .insert({ user_id: user.id, question_id: questionId });
    return NextResponse.json({ bookmarked: true });
  } catch (err) {
    console.error("practice/bookmark error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
