import { aggregateFeedbackEvents, type FeedbackEventRow } from "@/lib/shared-feedback";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ foodFeedback: [], stallFeedback: [] });
  }

  const { data, error } = await supabase.from("feedback_events").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) {
    return NextResponse.json({ foodFeedback: [], stallFeedback: [], error: "shared feedback unavailable" }, { status: 503 });
  }

  return NextResponse.json(aggregateFeedbackEvents((data ?? []) as FeedbackEventRow[]));
}
