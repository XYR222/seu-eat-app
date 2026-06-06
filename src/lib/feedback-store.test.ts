import { describe, expect, it } from "vitest";
import type { FoodFeedback, StallFeedback } from "@/types";
import { buildStallKey, collectStallComments, mergeFoodFeedback, mergeStallFeedback, normalizeComment } from "@/lib/feedback-store";

const baseFoodFeedback: FoodFeedback[] = [
  { foodId: "food_001", likes: 2, dislikes: 1, tagVotes: { 清淡: 1 }, comments: ["原始菜品评论"] },
  { foodId: "food_002", likes: 3, dislikes: 0, tagVotes: { 出餐快: 2 }, comments: ["同窗口菜品评论"] },
];

const foods = [
  { id: "food_001", canteen: "桃园食堂", stall: "二楼盖浇饭窗口" },
  { id: "food_002", canteen: "桃园食堂", stall: "二楼盖浇饭窗口" },
  { id: "food_003", canteen: "梅园食堂", stall: "轻食窗口" },
];

describe("feedback-store", () => {
  it("normalizes empty and overlong comments", () => {
    expect(normalizeComment("   ")).toBe("");
    expect(normalizeComment(`  ${"好".repeat(100)}  `)).toHaveLength(80);
  });

  it("merges stored food comments without losing initial feedback", () => {
    const merged = mergeFoodFeedback(baseFoodFeedback, [{ foodId: "food_001", likes: 5, dislikes: 4, tagVotes: { 偏咸: 2 }, comments: ["新评论"] }]);

    expect(merged.find((item) => item.foodId === "food_001")).toMatchObject({
      foodId: "food_001",
      likes: 5,
      dislikes: 4,
      tagVotes: { 清淡: 1, 偏咸: 2 },
      comments: ["新评论", "原始菜品评论"],
    });
    expect(merged.find((item) => item.foodId === "food_002")?.comments).toEqual(["同窗口菜品评论"]);
  });

  it("keeps stored feedback for foods missing from initial feedback", () => {
    const stored: FoodFeedback[] = [{ foodId: "food_999", likes: 1, dislikes: 0, tagVotes: {}, comments: ["new food comment"] }];

    expect(mergeFoodFeedback(baseFoodFeedback, stored).find((item) => item.foodId === "food_999")).toEqual(stored[0]);
  });

  it("merges stored stall feedback by stable canteen and stall key", () => {
    const stallKey = buildStallKey("桃园食堂", "二楼盖浇饭窗口");
    const initial: StallFeedback[] = [{ stallKey, canteen: "桃园食堂", stall: "二楼盖浇饭窗口", likes: 1, dislikes: 0, comments: ["窗口老评论"] }];
    const stored: StallFeedback[] = [{ stallKey, canteen: "桃园食堂", stall: "二楼盖浇饭窗口", likes: 2, dislikes: 1, comments: ["窗口新评论"] }];

    expect(mergeStallFeedback(initial, stored)).toEqual([{ stallKey, canteen: "桃园食堂", stall: "二楼盖浇饭窗口", likes: 2, dislikes: 1, comments: ["窗口新评论", "窗口老评论"] }]);
  });

  it("collects stall comments from stall itself and foods under that stall", () => {
    const stallKey = buildStallKey("桃园食堂", "二楼盖浇饭窗口");
    const stallFeedback: StallFeedback = { stallKey, canteen: "桃园食堂", stall: "二楼盖浇饭窗口", likes: 1, dislikes: 0, comments: ["窗口评论"] };

    const comments = collectStallComments(stallFeedback, baseFoodFeedback, foods);

    expect(comments).toEqual(["窗口评论", "原始菜品评论", "同窗口菜品评论"]);
  });
});
