import { applyFeedbackAction } from "@/lib/feedback";
import { normalizeComment } from "@/lib/feedback-store";
import type { FoodFeedback, StallFeedback, UserMemory } from "@/types";

export type FoodDetailFeedbackAction =
  | { type: "like"; foodId: string }
  | { type: "dislike"; foodId: string }
  | { type: "tag"; foodId: string; tag: string }
  | { type: "comment"; foodId: string; comment: string };

export type StallDetailFeedbackAction =
  | { type: "like"; stallKey: string }
  | { type: "dislike"; stallKey: string }
  | { type: "comment"; stallKey: string; comment: string };

export function applyFoodDetailFeedback(
  feedback: FoodFeedback[],
  action: FoodDetailFeedbackAction,
): {
  feedback: FoodFeedback[];
  memoryPatch: Partial<UserMemory>;
} {
  if (action.type === "comment") {
    const comment = normalizeComment(action.comment);
    return {
      feedback: comment ? applyFeedbackAction(feedback, { type: "comment", foodId: action.foodId, comment }) : feedback,
      memoryPatch: {},
    };
  }

  const nextFeedback = applyFeedbackAction(feedback, action);
  const memoryPatch: Partial<UserMemory> = {};

  if (action.type === "dislike") memoryPatch.avoidFoods = [action.foodId];
  if (action.type === "tag" && (action.tag === "偏咸" || action.tag === "偏辣" || action.tag === "油腻")) {
    memoryPatch.avoidTags = [action.tag];
  }

  return { feedback: nextFeedback, memoryPatch };
}

export function applyStallDetailFeedback(feedback: StallFeedback[], action: StallDetailFeedbackAction): StallFeedback[] {
  return feedback.map((item) => {
    if (item.stallKey !== action.stallKey) return item;
    if (action.type === "like") return { ...item, likes: item.likes + 1 };
    if (action.type === "dislike") return { ...item, dislikes: item.dislikes + 1 };
    const comment = normalizeComment(action.comment);
    if (!comment) return item;
    return { ...item, comments: [comment, ...item.comments].slice(0, 12) };
  });
}
