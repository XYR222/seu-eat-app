import type { Food, FoodFeedback } from "@/types";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

export type CommunityBuzzItem = {
  id: string;
  actor: string;
  text: string;
  meta: string;
  foodId: string;
};

const actors = ["游客 A", "游客 B", "游客 C", "游客 D", "同学路过", "下课人"];

function topTag(feedback: FoodFeedback) {
  return Object.entries(feedback.tagVotes)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function buildCommunityBuzz(foods: FoodWithFeedback[], limit = 8): CommunityBuzzItem[] {
  return foods
    .filter((food) => food.feedback.comments.length > 0)
    .sort((a, b) => b.feedback.likes + b.feedback.comments.length * 3 - (a.feedback.likes + a.feedback.comments.length * 3))
    .slice(0, limit)
    .map((food, index) => {
      const tag = topTag(food.feedback);
      const comment = food.feedback.comments[0];
      return {
        id: `${food.id}-${index}`,
        actor: actors[index % actors.length],
        text: comment,
        meta: `${food.canteen} / ${food.stall}${tag ? ` · 常被说${tag}` : ""}`,
        foodId: food.id,
      };
    });
}
