export type DistanceLevel = "near" | "medium" | "far";

export type Food = {
  id: string;
  name: string;
  canteen: string;
  stall: string;
  price: number;
  location: string;
  distanceLevel: DistanceLevel;
  tags: string[];
  taste: string;
  description: string;
  image?: string;
};

export type FoodFeedback = {
  foodId: string;
  likes: number;
  dislikes: number;
  tagVotes: Record<string, number>;
  comments: string[];
};

export type UserMemory = {
  budgetMax?: number;
  preferTags: string[];
  avoidTags: string[];
  recentFoods: string[];
  avoidFoods: string[];
  preferredCanteens: string[];
  sessionContext: string[];
  updatedAt: string;
};

export type Recommendation = {
  foodId: string;
  score: number;
  reason: string;
  risk: string;
  evidence: string[];
};

export type Candidate = {
  food: Food;
  feedback?: FoodFeedback;
  score: number;
  evidence: string[];
  risk: string;
  ragText: string;
};

export type DrawCard = {
  type: "safe" | "explore" | "surprise";
  title: string;
  foodId: string;
  reason: string;
};

export type RecommendRequest = {
  query: string;
  memory: UserMemory;
  session: {
    previousRecommendations: string[];
    currentConstraints: string[];
  };
};

export type RecommendResponse = {
  resolvedIntent: {
    summary: string;
    constraints: string[];
  };
  recommendations: Recommendation[];
  memoryPatch: Partial<UserMemory>;
};

export const FOOD_TAGS = [
  "清淡",
  "偏辣",
  "不辣",
  "偏咸",
  "少油",
  "油腻",
  "高蛋白",
  "碳水足",
  "热汤",
  "面食",
  "米饭",
  "素食",
  "肉类",
  "出餐快",
  "量大",
  "性价比高",
  "适合减脂",
  "容易卖完",
] as const;

export const FEEDBACK_TAGS = [
  "出餐快",
  "性价比高",
  "量大",
  "偏咸",
  "偏辣",
  "清淡",
  "油腻",
  "适合减脂",
  "容易卖完",
] as const;
