import { feedbackItems } from "@/data/feedback";
import { foodItems } from "@/data/foods";
import { rerankWithDeepSeek } from "@/lib/deepseek";
import { extractMemoryPatch, mockRerank } from "@/lib/mock-ai";
import { retrieveCandidates } from "@/lib/rag";
import type { Candidate, Recommendation, RecommendRequest, RecommendResponse } from "@/types";

const fallbackReason = "它是当前候选里综合反馈比较稳的一项。";

function normalizeEvidence(evidence: unknown, candidate: Candidate): string[] {
  if (Array.isArray(evidence)) {
    const normalized = evidence.map((item) => String(item).trim()).filter(Boolean);
    if (normalized.length) return normalized;
  }
  if (typeof evidence === "string" && evidence.trim()) return [evidence.trim()];
  return candidate.evidence.length > 0 ? candidate.evidence : [`${candidate.food.canteen} ${candidate.food.stall}`, `价格${candidate.food.price}元`];
}

export function sanitizeRecommendations(recommendations: Recommendation[], candidates: Candidate[]): Recommendation[] {
  const candidateMap = new Map(candidates.map((candidate) => [candidate.food.id, candidate]));

  return recommendations.flatMap((recommendation) => {
    const candidate = candidateMap.get(recommendation.foodId);
    if (!candidate) return [];
    const score = Number(recommendation.score);
    return [
      {
        foodId: candidate.food.id,
        score: Number.isFinite(score) ? score : Math.max(70, Math.round(candidate.score)),
        reason: typeof recommendation.reason === "string" && recommendation.reason.trim() ? recommendation.reason.trim() : fallbackReason,
        risk: typeof recommendation.risk === "string" && recommendation.risk.trim() ? recommendation.risk.trim() : candidate.risk,
        evidence: normalizeEvidence(recommendation.evidence, candidate),
      },
    ];
  });
}

export async function recommendMeals(request: RecommendRequest): Promise<RecommendResponse> {
  const candidates = retrieveCandidates({
    query: request.query,
    foods: foodItems,
    feedback: feedbackItems,
    memory: request.memory,
    limit: 8,
  });
  const recommendations = await rerankWithDeepSeek({
    query: request.query,
    memory: request.memory,
    candidates,
  });
  const safeRecommendations = sanitizeRecommendations(recommendations, candidates);
  const memoryPatch = extractMemoryPatch(request.query);

  return {
    resolvedIntent: {
      summary: request.query || "随便推荐一顿",
      constraints: [...(memoryPatch.preferTags ?? []), ...(memoryPatch.avoidTags ?? []).map((tag) => `避开${tag}`), ...(memoryPatch.sessionContext ?? [])],
    },
    recommendations: safeRecommendations.length >= 3 ? safeRecommendations.slice(0, 3) : mockRerank(candidates).slice(0, 3),
    memoryPatch,
  };
}
