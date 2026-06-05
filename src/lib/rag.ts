import type { Candidate, Food, FoodFeedback, UserMemory } from "@/types";

type RetrieveInput = {
  query: string;
  foods: Food[];
  feedback: FoodFeedback[];
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

const queryTagMap: Array<[string[], string]> = [
  [["清淡", "淡一点", "少盐"], "清淡"],
  [["不辣", "别辣", "不要辣"], "不辣"],
  [["高蛋白", "蛋白质", "健身"], "高蛋白"],
  [["热汤", "喝汤", "汤"], "热汤"],
  [["面", "面食"], "面食"],
  [["米饭", "盖饭", "饭"], "米饭"],
  [["素", "素食"], "素食"],
  [["快", "赶时间"], "出餐快"],
  [["便宜", "性价比"], "性价比高"],
];

const avoidTagMap: Array<[string[], string]> = [
  [["不要太咸", "别太咸", "不咸", "少盐"], "偏咸"],
  [["不要辣", "不吃辣", "别辣"], "偏辣"],
  [["不要油", "少油", "不油"], "油腻"],
  [["不要面", "不想吃面", "不要面食"], "面食"],
];

export function parseQuery(query: string): QueryIntent {
  const budgetMatch = query.match(/(\d+)\s*元?(以内|以下|内)?/);
  const preferTags = queryTagMap
    .filter(([words]) => words.some((word) => query.includes(word)))
    .map(([, tag]) => tag);
  const avoidTags = avoidTagMap
    .filter(([words]) => words.some((word) => query.includes(word)))
    .map(([, tag]) => tag);
  const distanceLevel = query.includes("近") || query.includes("教学楼") ? "near" : undefined;
  const constraints = [
    budgetMatch ? `${budgetMatch[1]}元以内` : "",
    ...preferTags,
    ...avoidTags.map((tag) => `避开${tag}`),
    distanceLevel === "near" ? "距离近" : "",
  ].filter(Boolean);

  return {
    budgetMax: budgetMatch ? Number(budgetMatch[1]) : undefined,
    preferTags: Array.from(new Set(preferTags)),
    avoidTags: Array.from(new Set(avoidTags)),
    distanceLevel,
    constraints,
  };
}

export function buildRagDocument(food: Food, feedback?: FoodFeedback) {
  const tagSummary = feedback
    ? Object.entries(feedback.tagVotes)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([tag, count]) => `${tag}${count}次`)
        .join("、")
    : "暂无反馈";
  return [
    `菜品：${food.name}`,
    `食堂：${food.canteen}`,
    `窗口：${food.stall}`,
    `价格：${food.price}元`,
    `位置：${food.location}，距离${food.distanceLevel}`,
    `标签：${food.tags.join("、")}`,
    `口味：${food.taste}`,
    `描述：${food.description}`,
    feedback ? `学生反馈：${feedback.likes}人点赞，${feedback.dislikes}人不推荐；高频反馈：${tagSummary}` : "",
    feedback ? `短评：${feedback.comments.join("；")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function retrieveCandidates({ query, foods, feedback, memory, limit = 8 }: RetrieveInput): Candidate[] {
  const intent = parseQuery(query);
  const budgetMax = intent.budgetMax ?? memory.budgetMax;
  const preferTags = new Set([...intent.preferTags, ...(memory.preferTags ?? [])]);
  const avoidTags = new Set([...intent.avoidTags, ...(memory.avoidTags ?? [])]);
  const hardAvoidTags = new Set(intent.avoidTags);
  const feedbackByFood = new Map(feedback.map((item) => [item.foodId, item]));

  return foods
    .filter((food) => !food.tags.some((tag) => hardAvoidTags.has(tag)))
    .map((food) => {
      const itemFeedback = feedbackByFood.get(food.id);
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
        const topTags = Object.entries(itemFeedback.tagVotes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tag, count]) => `${tag}${count}次`);
        if (topTags.length) evidence.push(`反馈：${topTags.join("、")}`);
        for (const avoidTag of avoidTags) {
          const votes = itemFeedback.tagVotes[avoidTag] ?? 0;
          if (votes > 3) {
            score -= votes;
            riskParts.push(`同学反馈${avoidTag}${votes}次`);
          }
        }
      }

      if (food.name.includes(query) || query.includes(food.name)) score += 20;

      return {
        food,
        feedback: itemFeedback,
        score,
        evidence: Array.from(new Set(evidence)).slice(0, 4),
        risk: Array.from(new Set(riskParts)).slice(0, 2).join("；") || "暂无明显风险",
        ragText: buildRagDocument(food, itemFeedback),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
