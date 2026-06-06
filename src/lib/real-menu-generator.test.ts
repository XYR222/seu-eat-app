import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { generateRealMenuData, parseDishMarkdown } from "@/lib/real-menu-generator";

const rootDir = path.resolve(process.cwd(), "真实店铺与菜品及其简要描述");

describe("real menu generator", () => {
  test("parses one dishes.md file into structured dishes", () => {
    const markdown = fs.readFileSync(path.join(rootDir, "桃园食堂", "啵啵鱼", "dishes.md"), "utf8");

    const dishes = parseDishMarkdown(markdown);

    expect(dishes[0]).toMatchObject({
      name: "椒麻脆皮鸭",
      priceText: "15 元",
      imagePath: "菜品图/01_椒麻脆皮鸭.jpg",
      spicyLevel: "不确定",
      taste: "鲜香、咸鲜",
      summary: "椒麻脆皮鸭口味相对稳定，适合日常一人餐。",
    });
  });

  test("generates complete food and stall image data from the real menu folder", () => {
    const result = generateRealMenuData(rootDir);

    expect(result.foods).toHaveLength(256);
    expect(Object.keys(result.stallImages)).toHaveLength(25);
    expect(new Set(result.foods.map((food) => food.id)).size).toBe(256);
    expect(result.foods.every((food) => food.price > 0)).toBe(true);
    expect(result.foods.every((food) => food.name && food.canteen && food.stall && food.location && food.taste && food.description)).toBe(true);
    expect(result.foods.filter((food) => food.description.includes("价格为估算，需现场校对。"))).toHaveLength(60);
    expect(result.foods.find((food) => food.canteen === "湖滨餐厅" && food.stall === "茉酸奶")?.image).toMatch(/^\/real-food-assets\/dishes\/food_\d+\.jpg$/);
  });
});
