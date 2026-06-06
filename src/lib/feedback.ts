import type { FoodFeedback } from "@/types";

export type FeedbackAction =
  | { type: "like"; foodId: string }
  | { type: "dislike"; foodId: string }
  | { type: "tag"; foodId: string; tag: string }
  | { type: "comment"; foodId: string; comment: string };

export function applyFeedbackAction(items: FoodFeedback[], action: FeedbackAction): FoodFeedback[] {
  const baseItems = items.some((item) => item.foodId === action.foodId) ? items : [...items, { foodId: action.foodId, likes: 0, dislikes: 0, tagVotes: {}, comments: [] }];
  return baseItems.map((item) => {
    if (item.foodId !== action.foodId) return item;
    if (action.type === "like") return { ...item, likes: item.likes + 1 };
    if (action.type === "dislike") return { ...item, dislikes: item.dislikes + 1 };
    if (action.type === "tag") {
      return {
        ...item,
        tagVotes: {
          ...item.tagVotes,
          [action.tag]: (item.tagVotes[action.tag] ?? 0) + 1,
        },
      };
    }
    return {
      ...item,
      comments: [action.comment, ...item.comments].slice(0, 5),
    };
  });
}
