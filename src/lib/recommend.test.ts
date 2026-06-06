import { describe, expect, it } from "vitest";
import { mergeRequestFoodFeedback, sanitizeRecommendations } from "@/lib/recommend";
import { retrieveCandidates } from "@/lib/rag";
import type { Candidate, Food, FoodFeedback, Recommendation, StallFeedback, UserMemory } from "@/types";

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

const memory: UserMemory = {
  preferTags: [],
  avoidTags: [],
  recentFoods: [],
  avoidFoods: [],
  preferredCanteens: [],
  sessionContext: [],
  updatedAt: "2026-06-06T00:00:00.000Z",
};

const foods = [
  {
    id: "food_a",
    name: "A Rice",
    canteen: "North Canteen",
    stall: "Rice Stall",
    price: 12,
    location: "North 1F",
    distanceLevel: "near",
    tags: ["rice"],
    taste: "light",
    description: "A",
  },
  {
    id: "food_b",
    name: "B Noodle",
    canteen: "North Canteen",
    stall: "Noodle Stall",
    price: 12,
    location: "North 1F",
    distanceLevel: "near",
    tags: ["noodle"],
    taste: "light",
    description: "B",
  },
] satisfies Food[];

describe("request feedback RAG loop", () => {
  it("merges request food feedback over static feedback", () => {
    const staticFeedback: FoodFeedback[] = [{ foodId: "food_a", likes: 1, dislikes: 0, tagVotes: { old: 1 }, comments: ["old comment"] }];
    const requestFeedback: FoodFeedback[] = [{ foodId: "food_a", likes: 30, dislikes: 2, tagVotes: { fresh: 4 }, comments: ["fresh comment"] }];

    expect(mergeRequestFoodFeedback(staticFeedback, requestFeedback)).toEqual([{ foodId: "food_a", likes: 30, dislikes: 2, tagVotes: { old: 1, fresh: 4 }, comments: ["fresh comment", "old comment"] }]);
  });

  it("uses request food comments as candidate evidence", () => {
    const requestFeedback: FoodFeedback[] = [{ foodId: "food_a", likes: 40, dislikes: 0, tagVotes: {}, comments: ["fresh campus review"] }];

    const [candidate] = retrieveCandidates({ query: "Rice", foods, feedback: requestFeedback, memory, limit: 1 });

    expect(candidate.food.id).toBe("food_a");
    expect(candidate.ragText).toContain("fresh campus review");
    expect(candidate.evidence).toContain("短评：fresh campus review");
  });

  it("uses request stall feedback as candidate evidence and score signal", () => {
    const stallFeedback: StallFeedback[] = [{ stallKey: "North Canteen::Rice Stall", canteen: "North Canteen", stall: "Rice Stall", likes: 50, dislikes: 0, comments: ["stall is reliable"] }];

    const [candidate] = retrieveCandidates({ query: "meal", foods, feedback: [], stallFeedback, memory, limit: 1 });

    expect(candidate.food.id).toBe("food_a");
    expect(candidate.ragText).toContain("stall is reliable");
    expect(candidate.evidence).toContain("窗口口碑：stall is reliable");
  });
});
