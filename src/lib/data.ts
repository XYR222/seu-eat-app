import { feedbackItems } from "@/data/feedback";
import { foodItems } from "@/data/foods";
import type { Food, FoodFeedback } from "@/types";

export type FoodWithFeedback = Food & {
  feedback: FoodFeedback;
};

export function getFeedbackForFood(foodId: string, feedback: FoodFeedback[] = feedbackItems) {
  return feedback.find((item) => item.foodId === foodId);
}

export function mergeFoodsWithFeedback(foods: Food[] = foodItems, feedback: FoodFeedback[] = feedbackItems): FoodWithFeedback[] {
  return foods.map((food) => ({
    ...food,
    feedback: getFeedbackForFood(food.id, feedback) ?? {
      foodId: food.id,
      likes: 0,
      dislikes: 0,
      tagVotes: {},
      comments: [],
    },
  }));
}

export function searchFoods(
  foods: FoodWithFeedback[],
  options: {
    query?: string;
    canteen?: string;
    tag?: string;
    maxPrice?: number;
  },
) {
  const q = options.query?.trim().toLowerCase();
  return foods.filter((food) => {
    const matchesQuery =
      !q ||
      [food.name, food.canteen, food.stall, food.location, food.taste, food.description, ...food.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    const matchesCanteen = !options.canteen || food.canteen === options.canteen;
    const matchesTag = !options.tag || food.tags.includes(options.tag);
    const matchesPrice = !options.maxPrice || food.price <= options.maxPrice;
    return matchesQuery && matchesCanteen && matchesTag && matchesPrice;
  });
}

export function getPopularFoods(foods: FoodWithFeedback[], limit = 5) {
  return [...foods]
    .sort((a, b) => b.feedback.likes - b.feedback.dislikes - (a.feedback.likes - a.feedback.dislikes))
    .slice(0, limit);
}
