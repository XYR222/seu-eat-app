import fs from "node:fs";
import path from "node:path";
import type { Food } from "@/types";
import { buildStallKey } from "@/lib/feedback-store";

export type ParsedDish = {
  name: string;
  imagePath: string;
  priceText: string;
  spicyLevel: string;
  taste: string;
  sceneTags: string[];
  summary: string;
  reason: string;
};

export type GeneratedRealMenuData = {
  foods: Food[];
  stallImages: Record<string, string>;
  dishImageSources: Record<string, string>;
  stallImageSources: Record<string, string>;
};

const realMenuCanteens = ["桃园食堂", "橘园食堂", "湖滨餐厅"];

function lineValue(lines: string[], label: string) {
  const line = lines.find((item) => item.startsWith(`- ${label}：`));
  return line?.slice(`- ${label}：`.length).trim() ?? "";
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export function parseDishMarkdown(markdown: string): ParsedDish[] {
  const lines = markdown.split(/\r?\n/);
  const dishes: ParsedDish[] = [];

  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(/^##\s+\d+\.\s+(.+)$/);
    if (!match) continue;

    const block: string[] = [];
    for (let cursor = index + 1; cursor < lines.length && !lines[cursor].startsWith("## "); cursor++) {
      block.push(lines[cursor]);
    }

    dishes.push({
      name: match[1].trim(),
      imagePath: lineValue(block, "菜品图片"),
      priceText: lineValue(block, "价格"),
      spicyLevel: lineValue(block, "辣度"),
      taste: lineValue(block, "口味风格"),
      sceneTags: lineValue(block, "场景标签")
        .split("、")
        .map((item) => item.trim())
        .filter(Boolean),
      summary: lineValue(block, "UI 简述"),
      reason: lineValue(block, "推荐理由"),
    });
  }

  return dishes;
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function estimateMissingPrice(stall: string, dishName: string) {
  const text = `${stall} ${dishName}`;
  if (stall === "基本大伙") {
    if (hasAny(text, ["排骨", "红烧肉", "汤"])) return 14;
    if (hasAny(text, ["肉", "猪肝", "鸡", "鸭", "牛"])) return 12;
    return 7;
  }
  if (stall === "江西小炒") {
    if (hasAny(text, ["牛", "排骨", "鸭", "肥肠"])) return 18;
    return 14;
  }
  if (stall === "营养粥道") {
    if (hasAny(text, ["瘦肉", "银耳"])) return 10;
    return 8;
  }
  if (stall === "池奈 咖喱蛋包饭") {
    if (hasAny(text, ["锅"])) return 28;
    if (hasAny(text, ["饭", "面"])) return 22;
    return 12;
  }
  if (stall === "爷爷不泡茶") return 16;
  if (stall === "茉酸奶") {
    if (hasAny(text, ["牛油果", "巴旦木", "酒酿"])) return 22;
    return 18;
  }
  return 15;
}

function parsePrice(stall: string, dishName: string, priceText: string) {
  const match = priceText.match(/(\d+(?:\.\d+)?)/);
  if (match) return { price: Math.round(Number(match[1])), estimated: false };
  return { price: estimateMissingPrice(stall, dishName), estimated: true };
}

function tagsForDish(dish: ParsedDish) {
  const text = `${dish.name} ${dish.spicyLevel} ${dish.taste} ${dish.sceneTags.join(" ")}`;
  const tags: string[] = [];

  if (dish.spicyLevel === "不辣") tags.push("不辣");
  if (hasAny(dish.spicyLevel, ["微辣", "中辣", "重辣"]) || hasAny(text, ["重口", "麻辣", "香辣", "酸辣"])) tags.push("偏辣");
  if (hasAny(text, ["清淡", "爽口", "番茄味", "酸甜"])) tags.push("清淡");
  if (hasAny(text, ["油香", "炸", "烧肉", "五花", "红烧肉", "脆皮"])) tags.push("油腻");
  if (hasAny(text, ["高蛋白"])) tags.push("高蛋白");
  if (hasAny(text, ["出餐快", "赶课"])) tags.push("出餐快");
  if (hasAny(text, ["性价比高"])) tags.push("性价比高");
  if (hasAny(dish.name, ["面", "粉", "米线", "乌冬", "拉面", "冷面"])) tags.push("面食");
  if (hasAny(dish.name, ["饭", "盖浇饭", "拌饭", "炒饭", "卤肉饭"])) tags.push("米饭");
  if (hasAny(dish.name, ["汤", "粥", "煲", "锅"])) tags.push("热汤");
  if (hasAny(dish.name, ["牛", "鸡", "鸭", "猪", "肉", "鱼", "虾", "蟹", "排骨", "肥肠"])) tags.push("肉类");
  if (hasAny(dish.name, ["黄瓜", "豆腐", "茄子", "土豆丝", "青菜", "蔬菜", "南瓜", "红豆", "紫薯", "银耳"])) tags.push("素食");
  if (tags.length === 0) tags.push("适合一个人吃");

  return unique(tags).slice(0, 8);
}

function distanceForCanteen(canteen: string): Food["distanceLevel"] {
  if (canteen === "桃园食堂") return "near";
  if (canteen === "橘园食堂") return "medium";
  return "far";
}

function publicDishImagePath(foodId: string) {
  return `/real-food-assets/dishes/${foodId}.jpg`;
}

function slugStallImage(stallKey: string) {
  return Buffer.from(stallKey).toString("base64url");
}

function firstJpgInDirectory(directory: string) {
  if (!fs.existsSync(directory)) return "";
  const file = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((item) => item.isFile() && /\.jpe?g$/i.test(item.name))
    .map((item) => item.name)
    .sort()[0];
  return file ? path.join(directory, file) : "";
}

export function generateRealMenuData(rootDir: string): GeneratedRealMenuData {
  const foods: Food[] = [];
  const stallImages: Record<string, string> = {};
  const dishImageSources: Record<string, string> = {};
  const stallImageSources: Record<string, string> = {};

  for (const canteen of realMenuCanteens) {
    const canteenDir = path.join(rootDir, canteen);
    const stallNames = fs
      .readdirSync(canteenDir, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name)
      .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

    for (const stall of stallNames) {
      const stallDir = path.join(canteenDir, stall);
      const stallKey = buildStallKey(canteen, stall);
      const storeImageSource = firstJpgInDirectory(path.join(stallDir, "店面图"));
      if (storeImageSource) {
        const imagePath = `/real-food-assets/stalls/${slugStallImage(stallKey)}${path.extname(storeImageSource).toLowerCase()}`;
        stallImages[stallKey] = imagePath;
        stallImageSources[imagePath] = storeImageSource;
      }

      const dishes = parseDishMarkdown(fs.readFileSync(path.join(stallDir, "dishes.md"), "utf8"));
      for (const dish of dishes) {
        const id = `food_${String(foods.length + 1).padStart(3, "0")}`;
        const price = parsePrice(stall, dish.name, dish.priceText);
        const sourceImage = dish.imagePath ? path.join(stallDir, ...dish.imagePath.split("/")) : "";
        const image = sourceImage && fs.existsSync(sourceImage) ? publicDishImagePath(id) : undefined;
        if (image) dishImageSources[image] = sourceImage;

        foods.push({
          id,
          name: dish.name,
          canteen,
          stall,
          price: price.price,
          location: `${canteen} / ${stall}`,
          distanceLevel: distanceForCanteen(canteen),
          tags: tagsForDish(dish),
          taste: dish.taste || dish.spicyLevel || "常规口味",
          description: `${dish.summary || dish.reason || `${dish.name}来自${stall}。`}${price.estimated ? " 价格为估算，需现场校对。" : ""}`,
          image,
        });
      }
    }
  }

  return { foods, stallImages, dishImageSources, stallImageSources };
}
