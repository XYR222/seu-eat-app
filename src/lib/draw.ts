import type { DrawCard, Food, FoodFeedback, UserMemory } from "@/types";

const feedbackScore = (food: Food, feedback?: FoodFeedback) =>
  (feedback?.likes ?? 0) - (feedback?.dislikes ?? 0) * 2 + (feedback?.tagVotes["性价比高"] ?? 0);

const allowed = (food: Food, memory: UserMemory) =>
  !memory.avoidFoods?.includes(food.id) &&
  !memory.recentFoods?.includes(food.id) &&
  !food.tags.some((tag) => memory.avoidTags?.includes(tag));

export function drawMealCards(foods: Food[], feedback: FoodFeedback[], memory: UserMemory): DrawCard[] {
  const feedbackByFood = new Map(feedback.map((item) => [item.foodId, item]));
  const pool = foods.filter((food) => allowed(food, memory));
  const used = new Set<string>();
  const pick = (items: Food[], fallback: Food[]) => {
    const source = items.find((food) => !used.has(food.id)) ?? fallback.find((food) => !used.has(food.id)) ?? foods[0];
    used.add(source.id);
    return source;
  };

  const safeCandidates = [...pool].sort((a, b) => feedbackScore(b, feedbackByFood.get(b.id)) - feedbackScore(a, feedbackByFood.get(a.id)));
  const safe = pick(safeCandidates.slice(0, 8), pool);
  const explore = pick(
    pool.filter((food) => food.canteen !== safe.canteen && (feedbackByFood.get(food.id)?.dislikes ?? 0) <= 4),
    pool,
  );
  const surprise = pick(
    pool.filter((food) => !food.tags.some((tag) => memory.preferTags?.includes(tag))),
    pool,
  );

  return [
    { type: "safe", title: "稳妥卡", foodId: safe.id, reason: "点赞稳定、踩雷概率低，适合不想纠结的时候。" },
    { type: "explore", title: "探店卡", foodId: explore.id, reason: "换个窗口试试，反馈不错且不是你最近吃过的选择。" },
    { type: "surprise", title: "惊喜卡", foodId: surprise.id, reason: "保留一点随机性，同时避开了你的明确忌口。" },
  ];
}
