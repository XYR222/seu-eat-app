import { describe, expect, it } from "vitest";
import { feedbackItems } from "@/data/feedback";
import { foodItems } from "@/data/foods";
import { retrieveCandidates } from "@/lib/rag";
import type { UserMemory } from "@/types";

describe("retrieveCandidates", () => {
  it("returns existing foods that match query and memory while avoiding disliked tags", () => {
    const memory: UserMemory = {
      budgetMax: 15,
      preferTags: ["清淡"],
      avoidTags: ["偏辣", "偏咸"],
      recentFoods: ["food_006"],
      avoidFoods: [],
      preferredCanteens: [],
      sessionContext: [],
      updatedAt: "2026-06-06T00:00:00.000Z",
    };

    const candidates = retrieveCandidates({
      query: "15元以内，清淡，不要太咸，离教学楼近",
      foods: foodItems,
      feedback: feedbackItems,
      memory,
      limit: 8,
    });

    expect(candidates).toHaveLength(8);
    expect(candidates.every((candidate) => foodItems.some((food) => food.id === candidate.food.id))).toBe(true);
    expect(candidates[0].food.price).toBeLessThanOrEqual(15);
    expect(candidates[0].food.tags).toContain("清淡");
    expect(candidates[0].food.tags).not.toContain("偏辣");
    expect(candidates[0].food.id).not.toBe("food_006");
    expect(candidates.every((candidate) => !candidate.food.tags.includes("偏咸"))).toBe(true);
    expect(candidates.every((candidate) => !candidate.food.tags.includes("偏辣"))).toBe(true);
  });
});
