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

  it("adds normalized food comments to the top of the food comments list", () => {
    const result = applyFoodDetailFeedback(feedbackItems, { type: "comment", foodId: "food_001", comment: "  今天番茄味很足  " });

    expect(result.feedback.find((item) => item.foodId === "food_001")?.comments[0]).toBe("今天番茄味很足");
    expect(result.memoryPatch).toEqual({});
  });
});
