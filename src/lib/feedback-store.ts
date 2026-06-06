import type { Food, FoodFeedback, StallFeedback } from "@/types";
import { scopedStorageKey } from "@/lib/storage-scope";

export const FOOD_FEEDBACK_STORAGE_KEY = "seu-eat-feedback";
export const STALL_FEEDBACK_STORAGE_KEY = "seu-eat-stall-feedback";

type FoodLike = Pick<Food, "id" | "canteen" | "stall">;

export function buildStallKey(canteen: string, stall: string) {
  return `${canteen}::${stall}`;
}

export function normalizeComment(comment: string) {
  return comment.trim().replace(/\s+/g, " ").slice(0, 80);
}

const mergeComments = (stored: string[] = [], initial: string[] = []) => Array.from(new Set([...stored.map(normalizeComment).filter(Boolean), ...initial.map(normalizeComment).filter(Boolean)])).slice(0, 12);

export function mergeFoodFeedback(initial: FoodFeedback[], stored: FoodFeedback[] = []): FoodFeedback[] {
  const storedById = new Map(stored.map((item) => [item.foodId, item]));
  const merged = initial.map((item) => {
    const saved = storedById.get(item.foodId);
    if (!saved) return item;
    return {
      foodId: item.foodId,
      likes: saved.likes ?? item.likes,
      dislikes: saved.dislikes ?? item.dislikes,
      tagVotes: { ...item.tagVotes, ...(saved.tagVotes ?? {}) },
      comments: mergeComments(saved.comments, item.comments),
    };
  });
  const initialIds = new Set(initial.map((item) => item.foodId));
  const extras = stored
    .filter((item) => !initialIds.has(item.foodId))
    .map((item) => ({
      foodId: item.foodId,
      likes: item.likes ?? 0,
      dislikes: item.dislikes ?? 0,
      tagVotes: item.tagVotes ?? {},
      comments: mergeComments(item.comments, []),
    }));
  return [...merged, ...extras];
}

export function createInitialStallFeedback(foods: FoodLike[]): StallFeedback[] {
  const byKey = new Map<string, StallFeedback>();
  for (const food of foods) {
    const stallKey = buildStallKey(food.canteen, food.stall);
    if (!byKey.has(stallKey)) {
      byKey.set(stallKey, {
        stallKey,
        canteen: food.canteen,
        stall: food.stall,
        likes: 0,
        dislikes: 0,
        comments: [],
      });
    }
  }
  return [...byKey.values()];
}

export function mergeStallFeedback(initial: StallFeedback[], stored: StallFeedback[] = []): StallFeedback[] {
  const storedByKey = new Map(stored.map((item) => [item.stallKey, item]));
  return initial.map((item) => {
    const saved = storedByKey.get(item.stallKey);
    if (!saved) return item;
    return {
      ...item,
      likes: saved.likes ?? item.likes,
      dislikes: saved.dislikes ?? item.dislikes,
      comments: mergeComments(saved.comments, item.comments),
    };
  });
}

export function collectStallComments(stallFeedback: StallFeedback, foodFeedback: FoodFeedback[], foods: FoodLike[]) {
  const foodIds = new Set(foods.filter((food) => buildStallKey(food.canteen, food.stall) === stallFeedback.stallKey).map((food) => food.id));
  const foodComments = foodFeedback.filter((item) => foodIds.has(item.foodId)).flatMap((item) => item.comments);
  return mergeComments(stallFeedback.comments, foodComments);
}

function readJsonArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readStoredFoodFeedback(scope?: string) {
  const scoped = readJsonArray<FoodFeedback>(scopedStorageKey(FOOD_FEEDBACK_STORAGE_KEY, scope));
  return scoped.length ? scoped : readJsonArray<FoodFeedback>(FOOD_FEEDBACK_STORAGE_KEY);
}

export function readStoredStallFeedback(scope?: string) {
  const scoped = readJsonArray<StallFeedback>(scopedStorageKey(STALL_FEEDBACK_STORAGE_KEY, scope));
  return scoped.length ? scoped : readJsonArray<StallFeedback>(STALL_FEEDBACK_STORAGE_KEY);
}

export function writeStoredFoodFeedback(feedback: FoodFeedback[], scope?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedStorageKey(FOOD_FEEDBACK_STORAGE_KEY, scope), JSON.stringify(feedback));
}

export function writeStoredStallFeedback(feedback: StallFeedback[], scope?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedStorageKey(STALL_FEEDBACK_STORAGE_KEY, scope), JSON.stringify(feedback));
}
