import { MemorySummary } from "@/components/ai/MemorySummary";
import { RecommendationCard } from "@/components/ai/RecommendationCard";
import { FoodDetailSheet } from "@/components/food/FoodDetailSheet";
import { StallDetailSheet } from "@/components/food/StallDetailSheet";
import { Chip } from "@/components/ui/Chip";
import { MetricPill } from "@/components/ui/MetricPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildStallKey } from "@/lib/feedback-store";
import { applyFoodDetailFeedback, applyStallDetailFeedback } from "@/lib/food-detail";
import { isFavoriteFood } from "@/lib/my-store";
import type { FeedbackEventRequest } from "@/lib/shared-feedback";
import type { FavoriteFood, Food, FoodFeedback, Recommendation, StallFeedback, UserMemory } from "@/types";
import { useState } from "react";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

const quickQueries = ["15元以内", "清淡", "不辣", "高蛋白", "离我近"];
const followups = ["换一批", "再便宜点", "不要面食", "离我更近", "别太辣", "偏咸"];

export function AiRecommendTab({
  foods,
  feedback,
  stallFeedback,
  setFeedback,
  setStallFeedback,
  memory,
  onMemoryPatch,
  onMemoryRemove,
  onMemoryClear,
  onMealSelected,
  favorites,
  onToggleFavorite,
  onSharedFeedback,
}: {
  foods: FoodWithFeedback[];
  feedback: FoodFeedback[];
  stallFeedback: StallFeedback[];
  setFeedback: (items: FoodFeedback[]) => void;
  setStallFeedback: (items: StallFeedback[]) => void;
  memory: UserMemory;
  onMemoryPatch: (patch: Partial<UserMemory>) => void;
  onMemoryRemove: (field: keyof UserMemory, value: string) => void;
  onMemoryClear: () => void;
  onMealSelected: (foodId: string) => void;
  favorites: FavoriteFood[];
  onToggleFavorite: (foodId: string) => void;
  onSharedFeedback: (event: Omit<FeedbackEventRequest, "deviceId">) => void;
}) {
  const [query, setQuery] = useState("15元以内，清淡，不要太咸，离教学楼近");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [selectedStallKey, setSelectedStallKey] = useState<string | null>(null);
  const selected = selectedFoodId ? foods.find((food) => food.id === selectedFoodId) ?? null : null;
  const selectedStall = selectedStallKey ? stallFeedback.find((item) => item.stallKey === selectedStallKey) : undefined;

  const recommend = async (nextQuery = query) => {
    setLoading(true);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: nextQuery,
          memory,
          feedback,
          stallFeedback,
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

  const submitFeedback = (foodId: string, type: "like" | "dislike" | "tag" | "comment", value?: string) => {
    const result = applyFoodDetailFeedback(feedback, type === "tag" ? { type, foodId, tag: value ?? "出餐快" } : type === "comment" ? { type, foodId, comment: value ?? "" } : { type, foodId });
    setFeedback(result.feedback);
    onMemoryPatch(result.memoryPatch);
    onSharedFeedback({ scope: "food", eventType: type, foodId, tag: type === "tag" ? value : undefined, comment: type === "comment" ? value : undefined });
  };

  const submitStallFeedback = (stallKey: string, type: "like" | "dislike" | "comment", comment?: string) => {
    setStallFeedback(applyStallDetailFeedback(stallFeedback, type === "comment" ? { type, stallKey, comment: comment ?? "" } : { type, stallKey }));
    onSharedFeedback({ scope: "stall", eventType: type, stallKey, comment: type === "comment" ? comment : undefined });
  };

  return (
    <div className="space-y-4 pb-3">
      <header className="rounded-[1.7rem] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(41,37,30,0.10)] backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-emerald-700">东南今天吃点啥</p>
            <h1 className="mt-1 text-[2rem] font-black leading-tight tracking-normal text-stone-950">AI 帮你选饭</h1>
          </div>
          <MetricPill tone="green">午饭高峰</MetricPill>
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-600">说一句你现在想吃什么，我只从校园菜品库和同学反馈里给你 3 个靠谱选择。</p>
      </header>
      <section className="rounded-[1.55rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-amber-50 p-4 shadow-[0_16px_40px_rgba(20,83,45,0.10)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-emerald-700">我想吃</p>
            <p className="mt-1 text-xs text-stone-500">预算、口味、距离都可以直接写。</p>
          </div>
          <MetricPill tone="dark">RAG + Memory</MetricPill>
        </div>
        <textarea
          className="min-h-28 w-full resize-none rounded-2xl border border-emerald-100 bg-white/95 p-4 text-[15px] leading-7 text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
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
        <button className="mt-4 w-full rounded-2xl bg-emerald-700 px-4 py-3.5 text-sm font-black text-white shadow-[0_12px_24px_rgba(4,120,87,0.25)] transition hover:bg-emerald-800 active:scale-[0.99] disabled:bg-emerald-400" type="button" onClick={() => recommend()} disabled={loading}>
          {loading ? "正在检索菜单和同学反馈..." : "生成 3 个选择"}
        </button>
      </section>
      <MemorySummary memory={memory} onRemove={onMemoryRemove} onClear={onMemoryClear} />
      {constraints.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white/82 px-3 py-2 text-xs font-bold text-stone-600 shadow-sm">
          当前条件：{constraints.join("、")}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {followups.map((item) => (
          <Chip key={item} onClick={() => recommend(`${query}，${item}`)}>
            {item}
          </Chip>
        ))}
      </div>
      <section className="space-y-3">
        <SectionHeader title="推荐结果" subtitle="每张卡都包含理由、风险和证据，方便现场解释 AI 不是乱猜。" />
        {recommendations.length === 0 ? (
          <div className="rounded-[1.35rem] border border-dashed border-stone-300 bg-white/80 p-6 text-center text-sm leading-6 text-stone-500">输入需求后，我会只从现有菜品库里推荐 3 个具体选择，并展示同学反馈证据。</div>
        ) : (
          recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.foodId}
              rank={index + 1}
              recommendation={recommendation}
              foods={foods}
              onAte={(foodId) => {
                onMemoryPatch({ recentFoods: [foodId] });
                onMealSelected(foodId);
              }}
              onAvoid={(foodId) => onMemoryPatch({ avoidFoods: [foodId] })}
              onPatch={onMemoryPatch}
              onOpenDetail={setSelectedFoodId}
            />
          ))
        )}
      </section>
      {selected && (
        <FoodDetailSheet
          food={selected}
          favorite={isFavoriteFood(favorites, selected.id)}
          onClose={() => setSelectedFoodId(null)}
          onFeedback={submitFeedback}
          onOpenStall={() => setSelectedStallKey(buildStallKey(selected.canteen, selected.stall))}
          onToggleFavorite={onToggleFavorite}
          onMarkAte={(foodId) => {
            onMemoryPatch({ recentFoods: [foodId] });
            onMealSelected(foodId);
          }}
        />
      )}
      {selectedStall && <StallDetailSheet stall={selectedStall} foods={foods} foodFeedback={feedback} onClose={() => setSelectedStallKey(null)} onFeedback={submitStallFeedback} />}
    </div>
  );
}
