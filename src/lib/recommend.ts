import { feedbackItems } from "@/data/feedback";
import { foodItems } from "@/data/foods";
import { rerankWithDeepSeek } from "@/lib/deepseek";
import { extractMemoryPatch, mockRerank } from "@/lib/mock-ai";
import { retrieveCandidates } from "@/lib/rag";
import type { RecommendRequest, RecommendResponse } from "@/types";

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
  const candidateIds = new Set(candidates.map((candidate) => candidate.food.id));
  const safeRecommendations = recommendations.filter((recommendation) => candidateIds.has(recommendation.foodId));
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
