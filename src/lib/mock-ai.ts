import type { Candidate, Recommendation, UserMemory } from "@/types";

export function mockRerank(candidates: Candidate[]): Recommendation[] {
  return candidates.slice(0, 3).map((candidate, index) => ({
    foodId: candidate.food.id,
    score: Math.max(70, Math.round(candidate.score + 20 - index * 4)),
    reason:
      candidate.evidence.length > 0
        ? `它匹配你的饭点需求：${candidate.evidence.slice(0, 3).join("；")}。`
        : "它是当前候选里综合反馈比较稳的一项。",
    risk: candidate.risk,
    evidence: candidate.evidence.length > 0 ? candidate.evidence : [`${candidate.food.canteen} ${candidate.food.stall}`, `价格${candidate.food.price}元`],
  }));
}

export function extractMemoryPatch(query: string): Partial<UserMemory> {
  const patch: Partial<UserMemory> = {};
  const budget = query.match(/(\d+)\s*元?(以内|以下|内)?/);
  if (budget) patch.budgetMax = Number(budget[1]);
  const preferTags: string[] = [];
  const avoidTags: string[] = [];
  const sessionContext: string[] = [];

  if (query.includes("清淡")) preferTags.push("清淡");
  if (query.includes("高蛋白") || query.includes("蛋白质") || query.includes("健身")) preferTags.push("高蛋白");
  if (query.includes("汤")) preferTags.push("热汤");
  if (query.includes("不辣") || query.includes("不要辣") || query.includes("不吃辣")) avoidTags.push("偏辣");
  if (query.includes("不要太咸") || query.includes("少盐") || query.includes("偏咸")) avoidTags.push("偏咸");
  if (query.includes("不要面") || query.includes("不要面食")) avoidTags.push("面食");
  if (query.includes("近") || query.includes("教学楼")) sessionContext.push("距离近优先");

  if (preferTags.length) patch.preferTags = Array.from(new Set(preferTags));
  if (avoidTags.length) patch.avoidTags = Array.from(new Set(avoidTags));
  if (sessionContext.length) patch.sessionContext = sessionContext;
  return patch;
}
