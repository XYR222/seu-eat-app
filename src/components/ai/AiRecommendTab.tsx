import { MemorySummary } from "@/components/ai/MemorySummary";
import { RecommendationCard } from "@/components/ai/RecommendationCard";
import { Chip } from "@/components/ui/Chip";
import type { Food, FoodFeedback, Recommendation, UserMemory } from "@/types";
import { useState } from "react";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

const quickQueries = ["15元以内", "清淡", "不辣", "高蛋白", "离我近"];
const followups = ["换一批", "再便宜点", "不要面食", "离我更近", "别太辣", "偏咸"];

export function AiRecommendTab({
  foods,
  memory,
  onMemoryPatch,
  onMemoryRemove,
  onMemoryClear,
}: {
  foods: FoodWithFeedback[];
  memory: UserMemory;
  onMemoryPatch: (patch: Partial<UserMemory>) => void;
  onMemoryRemove: (field: keyof UserMemory, value: string) => void;
  onMemoryClear: () => void;
}) {
  const [query, setQuery] = useState("15元以内，清淡，不要太咸，离教学楼近");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState<string[]>([]);

  const recommend = async (nextQuery = query) => {
    setLoading(true);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: nextQuery,
          memory,
          session: { previousRecommendations: recommendations.map((item) => item.foodId), currentConstraints: constraints },
        }),
      });
      const data = await response.json();
      setRecommendations(data.recommendations ?? []);
      setConstraints(data.resolvedIntent?.constraints ?? []);
      onMemoryPatch(data.memoryPatch ?? {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <header>
        <p className="text-sm font-bold text-emerald-700">东南今天吃点啥</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-stone-950">今天吃什么？</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">基于校园菜单、同学反馈和你的饭点偏好推荐。</p>
      </header>
      <section className="rounded-lg border border-emerald-100 bg-gradient-to-br from-emerald-50 to-amber-50 p-4">
        <textarea
          className="min-h-24 w-full resize-none rounded-lg border border-stone-200 bg-white p-3 text-sm leading-6 text-stone-800 outline-none focus:border-emerald-400"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {quickQueries.map((item) => (
            <Chip key={item} tone="green" onClick={() => setQuery((current) => `${current}，${item}`)}>
              {item}
            </Chip>
          ))}
        </div>
        <button className="mt-4 w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-black text-white shadow-sm" type="button" onClick={() => recommend()} disabled={loading}>
          {loading ? "正在检索真实菜单..." : "帮我推荐"}
        </button>
      </section>
      <MemorySummary memory={memory} onRemove={onMemoryRemove} onClear={onMemoryClear} />
      {constraints.length > 0 && <p className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-500">当前条件：{constraints.join("、")}</p>}
      <div className="flex flex-wrap gap-2">
        {followups.map((item) => (
          <Chip key={item} onClick={() => recommend(`${query}，${item}`)}>
            {item}
          </Chip>
        ))}
      </div>
      <section className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">输入需求后，我会只从现有菜品库里推荐 3 个具体选择。</div>
        ) : (
          recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.foodId}
              recommendation={recommendation}
              foods={foods}
              onAte={(foodId) => onMemoryPatch({ recentFoods: [foodId] })}
              onAvoid={(foodId) => onMemoryPatch({ avoidFoods: [foodId] })}
              onPatch={onMemoryPatch}
            />
          ))
        )}
      </section>
    </div>
  );
}
