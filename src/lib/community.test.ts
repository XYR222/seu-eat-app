import { describe, expect, it } from "vitest";
import { buildCommunityBuzz } from "@/lib/community";
import type { Food, FoodFeedback } from "@/types";

function food(id: string, name: string, feedback: FoodFeedback): Food & { feedback: FoodFeedback } {
  return {
    id,
    name,
    canteen: "桃园食堂",
    stall: "测试窗口",
    price: 12,
    location: "桃园食堂 / 测试窗口",
    distanceLevel: "near",
    tags: ["清淡"],
    taste: "家常",
    description: "测试菜品",
    feedback,
  };
}

describe("community signals", () => {
  it("builds buzz items from food comments", () => {
    const items = buildCommunityBuzz([
      food("food_001", "番茄蛋饭", { foodId: "food_001", likes: 10, dislikes: 0, tagVotes: { 出餐快: 3 }, comments: ["这个很稳"] }),
      food("food_002", "牛肉面", { foodId: "food_002", likes: 2, dislikes: 0, tagVotes: {}, comments: [] }),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ foodId: "food_001", text: "这个很稳" });
    expect(items[0].meta).toContain("出餐快");
  });
});
