import { describe, expect, it } from "vitest";
import { mergeMemoryPatch } from "@/lib/memory";
import type { UserMemory } from "@/types";

describe("mergeMemoryPatch", () => {
  it("deduplicates tags, limits recent foods, and updates timestamp", () => {
    const base: UserMemory = {
      budgetMax: 18,
      preferTags: ["清淡"],
      avoidTags: ["偏辣"],
      recentFoods: ["food_001", "food_002", "food_003", "food_004", "food_005"],
      avoidFoods: [],
      preferredCanteens: ["桃园食堂"],
      sessionContext: [],
      updatedAt: "2026-06-06T00:00:00.000Z",
    };

    const merged = mergeMemoryPatch(base, {
      budgetMax: 15,
      preferTags: ["清淡", "高蛋白"],
      avoidTags: ["偏辣", "偏咸"],
      recentFoods: ["food_006"],
      avoidFoods: ["food_003"],
      sessionContext: ["离教学楼近"],
    });

    expect(merged.budgetMax).toBe(15);
    expect(merged.preferTags).toEqual(["清淡", "高蛋白"]);
    expect(merged.avoidTags).toEqual(["偏辣", "偏咸"]);
    expect(merged.recentFoods).toEqual(["food_006", "food_001", "food_002", "food_003", "food_004"]);
    expect(merged.avoidFoods).toEqual(["food_003"]);
    expect(merged.updatedAt).not.toBe(base.updatedAt);
  });
});
