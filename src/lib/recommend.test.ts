import { describe, expect, it } from "vitest";
import { sanitizeRecommendations } from "@/lib/recommend";
import type { Candidate, Recommendation } from "@/types";

const candidate = {
  food: {
    id: "food_001",
    name: "番茄鸡蛋盖饭",
    canteen: "桃园食堂",
    stall: "盖浇饭窗口",
    price: 12,
    location: "二楼",
    distanceLevel: "near",
    tags: ["清淡"],
    taste: "酸甜",
    description: "清淡快手",
  },
  score: 83,
  evidence: ["清淡", "12元"],
  risk: "可能偏咸",
  ragText: "菜品：番茄鸡蛋盖饭",
} satisfies Candidate;

describe("sanitizeRecommendations", () => {
  it("normalizes malformed LLM recommendation fields before UI rendering", () => {
    const malformed = [
      {
        foodId: "food_001",
        score: "95",
        reason: "",
        risk: undefined,
        evidence: "同学反馈说出餐快",
      },
    ] as unknown as Recommendation[];

    const sanitized = sanitizeRecommendations(malformed, [candidate]);

    expect(sanitized).toEqual([
      {
        foodId: "food_001",
        score: 95,
        reason: "它是当前候选里综合反馈比较稳的一项。",
        risk: "可能偏咸",
        evidence: ["同学反馈说出餐快"],
      },
    ]);
  });

  it("filters recommendations outside candidate whitelist", () => {
    const sanitized = sanitizeRecommendations([{ foodId: "invented", score: 100, reason: "bad", risk: "bad", evidence: ["bad"] }], [candidate]);

    expect(sanitized).toEqual([]);
  });
});
