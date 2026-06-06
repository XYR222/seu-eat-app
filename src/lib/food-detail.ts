import { applyFeedbackAction } from "@/lib/feedback";
import type { FoodFeedback, UserMemory } from "@/types";

export type FoodDetailFeedbackAction =
  | { type: "like"; foodId: string }
  | { type: "dislike"; foodId: string }
  | { type: "tag"; foodId: string; tag: string };

export function applyFoodDetailFeedback(
  feedback: FoodFeedback[],
  action: FoodDetailFeedbackAction,
): {
  feedback: FoodFeedback[];
  memoryPatch: Partial<UserMemory>;
} {
  const nextFeedback = applyFeedbackAction(feedback, action);
  const memoryPatch: Partial<UserMemory> = {};

  if (action.type === "dislike") memoryPatch.avoidFoods = [action.foodId];
  if (action.type === "tag" && (action.tag === "偏咸" || action.tag === "偏辣" || action.tag === "油腻")) {
    memoryPatch.avoidTags = [action.tag];
  }

  return { feedback: nextFeedback, memoryPatch };
}
