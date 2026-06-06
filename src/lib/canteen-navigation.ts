import type { Food } from "@/types";

export type CanteenSummary = {
  canteen: string;
  foodCount: number;
  stallCount: number;
  tags: string[];
};

export type StallSummary = {
  canteen: string;
  stall: string;
  foodCount: number;
  tags: string[];
};

function topTags<T extends Food>(foods: T[], limit = 3) {
  const counts = new Map<string, number>();
  for (const food of foods) {
    for (const tag of food.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function getCanteenSummaries<T extends Food>(foods: T[]): CanteenSummary[] {
  const byCanteen = new Map<string, T[]>();
  for (const food of foods) {
    byCanteen.set(food.canteen, [...(byCanteen.get(food.canteen) ?? []), food]);
  }

  return [...byCanteen.entries()].map(([canteen, items]) => ({
    canteen,
    foodCount: items.length,
    stallCount: new Set(items.map((food) => food.stall)).size,
    tags: topTags(items),
  }));
}

export function getStallsForCanteen<T extends Food>(foods: T[], canteen: string): StallSummary[] {
  const byStall = new Map<string, T[]>();
  for (const food of foods) {
    if (food.canteen !== canteen) continue;
    byStall.set(food.stall, [...(byStall.get(food.stall) ?? []), food]);
  }

  return [...byStall.entries()].map(([stall, items]) => ({
    canteen,
    stall,
    foodCount: items.length,
    tags: topTags(items),
  }));
}

export function getFoodsForStall<T extends Food>(foods: T[], canteen: string, stall: string): T[] {
  return foods.filter((food) => food.canteen === canteen && food.stall === stall);
}
