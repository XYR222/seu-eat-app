import { describe, expect, test } from "vitest";
import { aggregateFeedbackEvents, normalizeFeedbackEventRequest } from "./shared-feedback";
import type { FeedbackEventRow } from "./shared-feedback";

const rows: FeedbackEventRow[] = [
  { id: "1", scope: "food", event_type: "like", food_id: "food_001", stall_key: null, tag: null, comment: null, device_id: "a", created_at: "2026-06-06T10:00:00.000Z" },
  { id: "2", scope: "food", event_type: "dislike", food_id: "food_001", stall_key: null, tag: null, comment: null, device_id: "b", created_at: "2026-06-06T10:01:00.000Z" },
  { id: "3", scope: "food", event_type: "tag", food_id: "food_001", stall_key: null, tag: "出餐快", comment: null, device_id: "a", created_at: "2026-06-06T10:02:00.000Z" },
  { id: "4", scope: "food", event_type: "comment", food_id: "food_001", stall_key: null, tag: null, comment: "窗口很快", device_id: "a", created_at: "2026-06-06T10:03:00.000Z" },
  { id: "5", scope: "stall", event_type: "like", food_id: null, stall_key: "桃园::盖饭", tag: null, comment: null, device_id: "a", created_at: "2026-06-06T10:04:00.000Z" },
  { id: "6", scope: "stall", event_type: "comment", food_id: null, stall_key: "桃园::盖饭", tag: null, comment: "整体稳定", device_id: "a", created_at: "2026-06-06T10:05:00.000Z" },
];

describe("shared feedback aggregation", () => {
  test("aggregates food and stall feedback events", () => {
    const snapshot = aggregateFeedbackEvents(rows);

    expect(snapshot.foodFeedback).toEqual([
      { foodId: "food_001", likes: 1, dislikes: 1, tagVotes: { 出餐快: 1 }, comments: ["窗口很快"] },
    ]);
    expect(snapshot.stallFeedback).toEqual([
      { stallKey: "桃园::盖饭", canteen: "桃园", stall: "盖饭", likes: 1, dislikes: 0, comments: ["整体稳定"] },
    ]);
  });

  test("normalizes valid comment requests", () => {
    expect(
      normalizeFeedbackEventRequest({
        scope: "food",
        eventType: "comment",
        foodId: "food_001",
        comment: ` ${"好".repeat(100)} `,
        deviceId: "device-1",
      }),
    ).toMatchObject({
      scope: "food",
      event_type: "comment",
      food_id: "food_001",
      comment: "好".repeat(80),
      device_id: "device-1",
    });
  });

  test("rejects invalid requests", () => {
    expect(() => normalizeFeedbackEventRequest({ scope: "food", eventType: "comment", deviceId: "x" })).toThrow("foodId is required");
    expect(() => normalizeFeedbackEventRequest({ scope: "stall", eventType: "like", deviceId: "x" })).toThrow("stallKey is required");
    expect(() => normalizeFeedbackEventRequest({ scope: "food", eventType: "tag", foodId: "food_001", deviceId: "x" })).toThrow("tag is required");
    expect(() => normalizeFeedbackEventRequest({ scope: "food", eventType: "like", foodId: "food_001" })).toThrow("deviceId is required");
  });
});
