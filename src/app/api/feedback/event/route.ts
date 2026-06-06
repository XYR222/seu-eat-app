import { normalizeFeedbackEventRequest } from "@/lib/shared-feedback";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let event;
  try {
    event = normalizeFeedbackEventRequest(await request.json());
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "invalid request" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "shared feedback unavailable" }, { status: 503 });
  }

  const { error } = await supabase.from("feedback_events").insert(event);
  if (error && error.code !== "23505") {
    return NextResponse.json({ ok: false, error: "shared feedback write failed" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
