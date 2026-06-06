import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { feedbackItems } from "@/data/feedback";
import { foodItems } from "@/data/foods";
import { stallImages } from "@/data/stall-images";

function publicFileExists(publicPath: string) {
  return fs.existsSync(path.resolve(process.cwd(), "public", publicPath.slice(1)));
}

describe("real menu static data", () => {
  test("contains the generated real campus menu", () => {
    expect(foodItems).toHaveLength(256);
    expect(new Set(foodItems.map((food) => food.id)).size).toBe(256);
    expect(new Set(foodItems.map((food) => food.canteen))).toEqual(new Set(["桃园食堂", "橘园食堂", "湖滨餐厅"]));
    expect(foodItems.every((food) => food.price > 0)).toBe(true);
    expect(foodItems.every((food) => food.name && food.canteen && food.stall && food.location && food.tags.length && food.taste && food.description)).toBe(true);
  });

  test("points generated food and stall images at existing public files", () => {
    expect(foodItems.every((food) => food.image && publicFileExists(food.image))).toBe(true);
    expect(Object.keys(stallImages)).toHaveLength(25);
    expect(Object.values(stallImages).every(publicFileExists)).toBe(true);
  });

  test("keeps generated feedback aligned with the real food ids", () => {
    expect(feedbackItems).toHaveLength(foodItems.length);
    expect(feedbackItems.map((item) => item.foodId)).toEqual(foodItems.map((food) => food.id));
  });
});
