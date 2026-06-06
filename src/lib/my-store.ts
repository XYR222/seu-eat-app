import type { FavoriteFood, MealHistoryItem } from "@/types";

export const MEAL_HISTORY_STORAGE_KEY = "seu-eat-history";
export const FAVORITES_STORAGE_KEY = "seu-eat-favorites";

export type AddMealHistoryInput = {
  foodId: string;
  action: MealHistoryItem["action"];
  source: MealHistoryItem["source"];
  now?: string;
};

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

export function addMealHistoryItem(items: MealHistoryItem[], input: AddMealHistoryInput): MealHistoryItem[] {
  const createdAt = input.now ?? new Date().toISOString();
  const item: MealHistoryItem = {
    id: `${createdAt}-${input.source}-${input.action}-${input.foodId}`,
    foodId: input.foodId,
    action: input.action,
    source: input.source,
    createdAt,
  };
  return [item, ...items].slice(0, 20);
}

export function toggleFavoriteFood(favorites: FavoriteFood[], foodId: string, now = new Date().toISOString()): FavoriteFood[] {
  if (favorites.some((item) => item.foodId === foodId)) {
    return favorites.filter((item) => item.foodId !== foodId);
  }
  return [{ foodId, createdAt: now }, ...favorites].slice(0, 50);
}

export function isFavoriteFood(favorites: FavoriteFood[], foodId: string) {
  return favorites.some((item) => item.foodId === foodId);
}

export function readMealHistory() {
  return readJsonArray<MealHistoryItem>(MEAL_HISTORY_STORAGE_KEY);
}

export function writeMealHistory(items: MealHistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEAL_HISTORY_STORAGE_KEY, JSON.stringify(items));
}

export function readFavoriteFoods() {
  return readJsonArray<FavoriteFood>(FAVORITES_STORAGE_KEY);
}

export function writeFavoriteFoods(items: FavoriteFood[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
}
