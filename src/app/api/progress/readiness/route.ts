import { getReadinessData } from "@/lib/readiness";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getReadinessData();
    if (!data) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
