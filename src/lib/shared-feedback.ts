import { normalizeComment } from "@/lib/feedback-store";
import type { FoodFeedback, StallFeedback } from "@/types";

export type FeedbackScope = "food" | "stall";
export type FeedbackEventType = "like" | "dislike" | "tag" | "comment";

export type FeedbackEventRequest = {
  scope?: string;
  eventType?: string;
  foodId?: string;
  stallKey?: string;
  tag?: string;
  comment?: string;
  deviceId?: string;
};

export type FeedbackEventInsert = {
  scope: FeedbackScope;
  event_type: FeedbackEventType;
  food_id: string | null;
  stall_key: string | null;
  tag: string | null;
  comment: string | null;
  device_id: string;
};

export type FeedbackEventRow = FeedbackEventInsert & {
  id: string;
  created_at: string;
};

export type FeedbackSnapshotResponse = {
  foodFeedback: FoodFeedback[];
  stallFeedback: StallFeedback[];
};

function assertScope(scope: unknown): asserts scope is FeedbackScope {
  if (scope !== "food" && scope !== "stall") throw new Error("scope is invalid");
}

function assertEventType(eventType: unknown): asserts eventType is FeedbackEventType {
  if (eventType !== "like" && eventType !== "dislike" && eventType !== "tag" && eventType !== "comment") throw new Error("eventType is invalid");
}

export function normalizeFeedbackEventRequest(input: FeedbackEventRequest): FeedbackEventInsert {
  assertScope(input.scope);
  assertEventType(input.eventType);
  const deviceId = input.deviceId?.trim();
  if (!deviceId) throw new Error("deviceId is required");

  const foodId = input.foodId?.trim();
  const stallKey = input.stallKey?.trim();
  const tag = input.tag?.trim();
  const comment = input.comment ? normalizeComment(input.comment) : "";

  if (input.scope === "food" && !foodId) throw new Error("foodId is required");
  if (input.scope === "stall" && !stallKey) throw new Error("stallKey is required");
  if (input.eventType === "tag" && !tag) throw new Error("tag is required");
  if (input.eventType === "comment" && !comment) throw new Error("comment is required");

  return {
    scope: input.scope,
    event_type: input.eventType,
    food_id: input.scope === "food" ? foodId ?? null : null,
    stall_key: input.scope === "stall" ? stallKey ?? null : null,
    tag: input.eventType === "tag" ? tag ?? null : null,
    comment: input.eventType === "comment" ? comment : null,
    device_id: deviceId,
  };
}

function emptyFoodFeedback(foodId: string): FoodFeedback {
  return { foodId, likes: 0, dislikes: 0, tagVotes: {}, comments: [] };
}

function emptyStallFeedback(stallKey: string): StallFeedback {
  const [canteen = stallKey, stall = stallKey] = stallKey.split("::");
  return { stallKey, canteen, stall, likes: 0, dislikes: 0, comments: [] };
}

export function aggregateFeedbackEvents(rows: FeedbackEventRow[]): FeedbackSnapshotResponse {
  const foodById = new Map<string, FoodFeedback>();
  const stallByKey = new Map<string, StallFeedback>();

  const sorted = [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  for (const row of sorted) {
    if (row.scope === "food" && row.food_id) {
      const item = foodById.get(row.food_id) ?? emptyFoodFeedback(row.food_id);
      if (row.event_type === "like") item.likes += 1;
      if (row.event_type === "dislike") item.dislikes += 1;
      if (row.event_type === "tag" && row.tag) item.tagVotes[row.tag] = (item.tagVotes[row.tag] ?? 0) + 1;
      if (row.event_type === "comment" && row.comment) item.comments = [row.comment, ...item.comments].slice(0, 12);
      foodById.set(row.food_id, item);
    }

    if (row.scope === "stall" && row.stall_key) {
      const item = stallByKey.get(row.stall_key) ?? emptyStallFeedback(row.stall_key);
      if (row.event_type === "like") item.likes += 1;
      if (row.event_type === "dislike") item.dislikes += 1;
      if (row.event_type === "comment" && row.comment) item.comments = [row.comment, ...item.comments].slice(0, 12);
      stallByKey.set(row.stall_key, item);
    }
  }

  return {
    foodFeedback: [...foodById.values()],
    stallFeedback: [...stallByKey.values()],
  };
}
