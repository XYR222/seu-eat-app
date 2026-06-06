import { describe, expect, it } from "vitest";
import { feedbackItems } from "@/data/feedback";
import { applyFoodDetailFeedback } from "@/lib/food-detail";

describe("applyFoodDetailFeedback", () => {
  it("updates feedback and adds disliked food to memory patch", () => {
    const result = applyFoodDetailFeedback(feedbackItems, { type: "dislike", foodId: "food_001" });

    expect(result.feedback.find((item) => item.foodId === "food_001")?.dislikes).toBeGreaterThan(
      feedbackItems.find((item) => item.foodId === "food_001")?.dislikes ?? 0,
    );
    expect(result.memoryPatch).toEqual({ avoidFoods: ["food_001"] });
  });

  it("adds salty, spicy, and oily tags to avoid memory", () => {
    const result = applyFoodDetailFeedback(feedbackItems, { type: "tag", foodId: "food_001", tag: "偏咸" });

    expect(result.feedback.find((item) => item.foodId === "food_001")?.tagVotes["偏咸"]).toBeGreaterThan(0);
    expect(result.memoryPatch).toEqual({ avoidTags: ["偏咸"] });
  });
});
