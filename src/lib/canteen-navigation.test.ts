import { describe, expect, test } from "vitest";
import type { Food } from "@/types";
import { getCanteenSummaries, getFoodsForStall, getStallsForCanteen, withStallImages } from "./canteen-navigation";

const foods: Food[] = [
  {
    id: "a",
    name: "Tomato Rice",
    canteen: "North Canteen",
    stall: "Rice Stall",
    price: 12,
    location: "North 1F",
    distanceLevel: "near",
    tags: ["light", "rice"],
    taste: "light",
    description: "A",
  },
  {
    id: "b",
    name: "Noodle Soup",
    canteen: "North Canteen",
    stall: "Noodle Stall",
    price: 10,
    location: "North 1F",
    distanceLevel: "near",
    tags: ["soup", "noodle"],
    taste: "warm",
    description: "B",
  },
  {
    id: "c",
    name: "Chicken Rice",
    canteen: "North Canteen",
    stall: "Rice Stall",
    price: 15,
    location: "North 2F",
    distanceLevel: "medium",
    tags: ["protein", "rice"],
    taste: "savory",
    description: "C",
  },
  {
    id: "d",
    name: "Fish Rice",
    canteen: "South Canteen",
    stall: "Steam Stall",
    price: 18,
    location: "South 1F",
    distanceLevel: "far",
    tags: ["light", "protein"],
    taste: "fresh",
    description: "D",
  },
];

describe("canteen navigation helpers", () => {
  test("extracts canteen summaries in first-seen order", () => {
    expect(getCanteenSummaries(foods)).toEqual([
      { canteen: "North Canteen", foodCount: 3, stallCount: 2, tags: ["rice", "light", "soup"] },
      { canteen: "South Canteen", foodCount: 1, stallCount: 1, tags: ["light", "protein"] },
    ]);
  });

  test("extracts stalls for a canteen with food counts and top tags", () => {
    expect(getStallsForCanteen(foods, "North Canteen")).toEqual([
      { canteen: "North Canteen", stall: "Rice Stall", foodCount: 2, tags: ["rice", "light", "protein"] },
      { canteen: "North Canteen", stall: "Noodle Stall", foodCount: 1, tags: ["soup", "noodle"] },
    ]);
  });

  test("extracts foods for one stall only", () => {
    expect(getFoodsForStall(foods, "North Canteen", "Rice Stall").map((food) => food.id)).toEqual(["a", "c"]);
  });

  test("attaches stall images by stable canteen and stall key", () => {
    expect(withStallImages(getStallsForCanteen(foods, "North Canteen"), { "North Canteen::Rice Stall": "/stalls/rice.jpg" })).toMatchObject([
      { stall: "Rice Stall", image: "/stalls/rice.jpg" },
      { stall: "Noodle Stall", image: undefined },
    ]);
  });
});
