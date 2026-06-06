import { describe, expect, test } from "vitest";
import { addMealHistoryItem, isFavoriteFood, toggleFavoriteFood } from "./my-store";
import type { FavoriteFood, MealHistoryItem } from "@/types";

describe("my-store helpers", () => {
  test("adds new meal history at the front with bounded length", () => {
    const existing: MealHistoryItem[] = Array.from({ length: 20 }, (_, index) => ({
      id: `old-${index}`,
      foodId: `food_${index}`,
      action: "ate",
      source: "draw",
      createdAt: `2026-06-0${index}`,
    }));

    const next = addMealHistoryItem(existing, { foodId: "food_new", action: "ate", source: "ai", now: "2026-06-06T12:00:00.000Z" });

    expect(next).toHaveLength(20);
    expect(next[0]).toMatchObject({ foodId: "food_new", action: "ate", source: "ai", createdAt: "2026-06-06T12:00:00.000Z" });
    expect(next[0].id).toContain("food_new");
  });

  test("toggleFavoriteFood adds and removes a favorite", () => {
    const added = toggleFavoriteFood([], "food_001", "2026-06-06T12:00:00.000Z");

    expect(added).toEqual([{ foodId: "food_001", createdAt: "2026-06-06T12:00:00.000Z" }]);
    expect(toggleFavoriteFood(added, "food_001", "later")).toEqual([]);
  });

  test("isFavoriteFood checks by food id", () => {
    const favorites: FavoriteFood[] = [{ foodId: "food_001", createdAt: "2026-06-06T12:00:00.000Z" }];

    expect(isFavoriteFood(favorites, "food_001")).toBe(true);
    expect(isFavoriteFood(favorites, "food_002")).toBe(false);
  });
});
