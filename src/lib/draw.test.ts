import { describe, expect, it } from "vitest";
import { feedbackItems } from "@/data/feedback";
import { foodItems } from "@/data/foods";
import { drawMealCards } from "@/lib/draw";
import type { UserMemory } from "@/types";

describe("drawMealCards", () => {
  it("draws safe, explore, and surprise cards without violating memory avoid rules", () => {
    const memory: UserMemory = {
      budgetMax: 18,
      preferTags: ["清淡"],
      avoidTags: ["偏辣"],
      recentFoods: ["food_001"],
      avoidFoods: ["food_004"],
      preferredCanteens: [],
      sessionContext: [],
      updatedAt: "2026-06-06T00:00:00.000Z",
    };

    const cards = drawMealCards(foodItems, feedbackItems, memory);

    expect(cards.map((card) => card.type)).toEqual(["safe", "explore", "surprise"]);
    expect(new Set(cards.map((card) => card.foodId)).size).toBe(3);
    for (const card of cards) {
      const food = foodItems.find((item) => item.id === card.foodId);
      expect(food).toBeDefined();
      expect(food?.tags).not.toContain("偏辣");
      expect(card.foodId).not.toBe("food_001");
      expect(card.foodId).not.toBe("food_004");
    }
  });
});
