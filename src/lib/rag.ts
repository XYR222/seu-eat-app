import { buildStallKey } from "@/lib/feedback-store";
import type { Candidate, Food, FoodFeedback, StallFeedback, UserMemory } from "@/types";

type RetrieveInput = {
  query: string;
  foods: Food[];
  feedback: FoodFeedback[];
  stallFeedback?: StallFeedback[];
  memory: UserMemory;
  limit?: number;
};

type QueryIntent = {
  budgetMax?: number;
  preferTags: string[];
  avoidTags: string[];
  distanceLevel?: "near" | "medium" | "far";
  constraints: string[];
};

const queryTagMap: Array<[string[], string[]]> = [
  [["清淡", "淡一点", "少盐", "娓呮贰"], ["清淡", "娓呮贰"]],
  [["不辣", "别辣", "不要辣", "涓嶈荆"], ["不辣", "涓嶈荆"]],
  [["高蛋白", "蛋白质", "健身", "楂樿泲鐧?"], ["高蛋白", "楂樿泲鐧?"]],
  [["热汤", "喝汤", "汤", "鐑堡"], ["热汤", "鐑堡"]],
  [["面", "面食", "闈㈤"], ["面食", "闈㈤"]],
  [["米饭", "盖饭", "饭", "绫抽キ"], ["米饭", "绫抽キ"]],
  [["素", "素食", "绱犻"], ["素食", "绱犻"]],
  [["快", "赶时间", "鍑洪蹇?"], ["出餐快", "鍑洪蹇?"]],
  [["便宜", "性价比", "鎬т环姣旈珮"], ["性价比高", "鎬т环姣旈珮"]],
];

const avoidTagMap: Array<[string[], string[]]> = [
  [["不要太咸", "别太咸", "不咸", "少盐", "鍋忓捀"], ["偏咸", "鍋忓捀"]],
  [["不要辣", "不吃辣", "别辣", "鍋忚荆"], ["偏辣", "鍋忚荆"]],
  [["不要油", "少油", "不油", "娌硅吇"], ["油腻", "娌硅吇"]],
  [["不要面", "不想吃面", "不要面食", "闈㈤"], ["面食", "闈㈤"]],
];

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function matchingFoodTags(food: Food, desiredTags: Set<string>) {
  return food.tags.filter((tag) => desiredTags.has(tag));
}

export function parseQuery(query: string): QueryIntent {
  const budgetMatch = query.match(/(\d+)\s*(元|鍏?)*(以内|以下|内|浠ュ唴|浠ヤ笅|鍐?)/);
  const preferTags = queryTagMap.filter(([words]) => includesAny(query, words)).flatMap(([, tags]) => tags);
  const avoidTags = avoidTagMap.filter(([words]) => includesAny(query, words)).flatMap(([, tags]) => tags);
  const distanceLevel = includesAny(query, ["近", "教学楼", "杩?", "鏁欏妤?"]) ? "near" : undefined;
  const constraints = [
    budgetMatch ? `${budgetMatch[1]}元以内` : "",
    ...preferTags,
    ...avoidTags.map((tag) => `避开${tag}`),
    distanceLevel === "near" ? "距离近" : "",
  ].filter(Boolean);

  return {
    budgetMax: budgetMatch ? Number(budgetMatch[1]) : undefined,
    preferTags: unique(preferTags),
    avoidTags: unique(avoidTags),
    distanceLevel,
    constraints: unique(constraints),
  };
}

function topFeedbackTags(feedback?: FoodFeedback) {
  if (!feedback) return "";
  return Object.entries(feedback.tagVotes)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag, count]) => `${tag}${count}次`)
    .join("、");
}

export function buildRagDocument(food: Food, feedback?: FoodFeedback, stallFeedback?: StallFeedback) {
  return [
    `菜品：${food.name}`,
    `食堂：${food.canteen}`,
    `窗口：${food.stall}`,
    `价格：${food.price}元`,
    `位置：${food.location}，距离${food.distanceLevel}`,
    `标签：${food.tags.join("、")}`,
    `口味：${food.taste}`,
    `描述：${food.description}`,
    feedback ? `学生反馈：${feedback.likes}人点赞，${feedback.dislikes}人不推荐；高频反馈：${topFeedbackTags(feedback) || "暂无标签反馈"}` : "",
    feedback?.comments.length ? `短评：${feedback.comments.join("；")}` : "",
    stallFeedback ? `窗口反馈：${stallFeedback.likes}人点赞，${stallFeedback.dislikes}人不推荐` : "",
    stallFeedback?.comments.length ? `窗口短评：${stallFeedback.comments.join("；")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function retrieveCandidates({ query, foods, feedback, stallFeedback = [], memory, limit = 8 }: RetrieveInput): Candidate[] {
  const intent = parseQuery(query);
  const budgetMax = intent.budgetMax ?? memory.budgetMax;
  const preferTags = new Set([...intent.preferTags, ...(memory.preferTags ?? [])]);
  const avoidTags = new Set([...intent.avoidTags, ...(memory.avoidTags ?? [])]);
  const hardAvoidTags = new Set(intent.avoidTags);
  const feedbackByFood = new Map(feedback.map((item) => [item.foodId, item]));
  const feedbackByStall = new Map(stallFeedback.map((item) => [item.stallKey, item]));

  return foods
    .filter((food) => matchingFoodTags(food, hardAvoidTags).length === 0)
    .map((food) => {
      const itemFeedback = feedbackByFood.get(food.id);
      const itemStallFeedback = feedbackByStall.get(buildStallKey(food.canteen, food.stall));
      let score = 0;
      const evidence: string[] = [];
      const riskParts: string[] = [];

      if (budgetMax && food.price <= budgetMax) {
        score += 18;
        evidence.push(`价格${food.price}元，符合预算`);
      } else if (budgetMax && food.price > budgetMax) {
        score -= 16;
        riskParts.push(`价格${food.price}元，略超预算`);
      }

      if (intent.distanceLevel === "near" && food.distanceLevel === "near") {
        score += 10;
        evidence.push("距离较近");
      } else if (intent.distanceLevel === "near" && food.distanceLevel === "far") {
        score -= 8;
        riskParts.push("距离稍远");
      }

      for (const tag of food.tags) {
        if (preferTags.has(tag)) {
          score += 12;
          evidence.push(`匹配${tag}`);
        }
        if (avoidTags.has(tag)) {
          score -= 36;
          riskParts.push(`命中需避开的${tag}`);
        }
      }

      if (memory.recentFoods?.includes(food.id)) {
        score -= 18;
        riskParts.push("最近吃过");
      }
      if (memory.avoidFoods?.includes(food.id)) {
        score -= 80;
        riskParts.push("已标记不想再推荐");
      }
      if (memory.preferredCanteens?.includes(food.canteen)) {
        score += 8;
        evidence.push(`偏好${food.canteen}`);
      }

      if (itemFeedback) {
        score += Math.min(12, itemFeedback.likes / 2);
        score -= itemFeedback.dislikes * 1.5;
        const tags = topFeedbackTags(itemFeedback);
        if (tags) evidence.push(`反馈：${tags}`);
        if (itemFeedback.comments[0]) evidence.push(`短评：${itemFeedback.comments[0]}`);
        for (const avoidTag of avoidTags) {
          const votes = itemFeedback.tagVotes[avoidTag] ?? 0;
          if (votes > 3) {
            score -= votes;
            riskParts.push(`同学反馈${avoidTag}${votes}次`);
          }
        }
      }

      if (itemStallFeedback) {
        score += Math.min(10, itemStallFeedback.likes / 6);
        score -= itemStallFeedback.dislikes;
        if (itemStallFeedback.comments[0]) evidence.push(`窗口口碑：${itemStallFeedback.comments[0]}`);
      }

      if (food.name.includes(query) || query.includes(food.name)) score += 20;

      return {
        food,
        feedback: itemFeedback,
        score,
        evidence: unique(evidence).slice(0, 4),
        risk: unique(riskParts).slice(0, 2).join("；") || "暂无明显风险",
        ragText: buildRagDocument(food, itemFeedback, itemStallFeedback),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
