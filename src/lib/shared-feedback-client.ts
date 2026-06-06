import type { FeedbackEventRequest, FeedbackSnapshotResponse } from "@/lib/shared-feedback";

export async function fetchSharedFeedbackSnapshot(): Promise<FeedbackSnapshotResponse> {
  try {
    const response = await fetch("/api/feedback/snapshot", { method: "GET" });
    if (!response.ok) return { foodFeedback: [], stallFeedback: [] };
    const data = (await response.json()) as Partial<FeedbackSnapshotResponse>;
    return {
      foodFeedback: Array.isArray(data.foodFeedback) ? data.foodFeedback : [],
      stallFeedback: Array.isArray(data.stallFeedback) ? data.stallFeedback : [],
    };
  } catch {
    return { foodFeedback: [], stallFeedback: [] };
  }
}

export async function postSharedFeedbackEvent(event: FeedbackEventRequest) {
  try {
    const response = await fetch("/api/feedback/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    return response.ok;
  } catch {
    return false;
  }
}
