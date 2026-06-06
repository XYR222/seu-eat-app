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
const demoPrompt = "15元以内，清淡，不要太咸，离教学楼近";
const scenePrompts = [
  { label: "赶时间", text: "赶时间，离教学楼近，出餐快" },
  { label: "想吃饱", text: "15元以内，量大，米饭类，能吃饱" },
  { label: "想清淡", text: "清淡，不要太咸，不辣，最好有热汤" },
  { label: "别踩雷", text: "随便推荐，但避开差评多和太辣的" },
];

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
  const [query, setQuery] = useState(demoPrompt);
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
      <header className="dn-hero-card dn-hero-card--lime">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="max-w-[68%]">
            <p className="dn-eyebrow">东南今天吃点啥</p>
            <h1 className="dn-card-title mt-1">AI 帮你选饭</h1>
          </div>
          <MetricPill tone="green">午饭高峰</MetricPill>
        </div>
        <p className="dn-muted relative z-10 mt-3 max-w-[68%] text-sm leading-6">说一句你现在想吃什么，我只从校园菜品库和同学反馈里给你 3 个靠谱选择。</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pipi/pipi-ai-hero.png" alt="" className="dn-pipi-shadow absolute -bottom-1 right-1 h-32 w-32 object-contain object-bottom" />
      </header>
      <section className="dn-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="dn-eyebrow">我想吃</p>
            <p className="dn-muted mt-1 text-xs">例如：15元以内，清淡，不想排队。</p>
          </div>
          <MetricPill tone="dark">RAG + Memory</MetricPill>
        </div>
        <textarea
          className="min-h-28 w-full resize-none rounded-[1.25rem] border border-[#4c4c35]/14 bg-white/95 p-4 text-[15px] font-semibold leading-7 text-[#2a2a1a] shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#b9dc00] focus:ring-4 focus:ring-[#dcff3e]/30"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="今天想吃什么？比如：15元以内，清淡，不想排队"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {scenePrompts.map((item) => (
            <button className="rounded-full border border-[#4c4c35]/14 bg-white/82 px-3 py-2 text-xs font-black text-[#4c4c35] transition active:scale-[0.98]" key={item.label} onClick={() => setQuery(item.text)} type="button">
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickQueries.map((item) => (
            <Chip key={item} tone="green" onClick={() => setQuery((current) => `${current}，${item}`)}>
              {item}
            </Chip>
          ))}
          <Chip
            tone="amber"
            onClick={() => {
              setQuery(demoPrompt);
              void recommend(demoPrompt);
            }}
          >
            演示一下
          </Chip>
        </div>
        <button className="dn-primary-button mt-4 w-full px-4 py-3.5 text-sm font-black transition active:scale-[0.99] disabled:opacity-60" type="button" onClick={() => recommend()} disabled={loading}>
          {loading ? "正在检索菜单和同学反馈..." : "生成 3 个选择"}
        </button>
      </section>
      <MemorySummary memory={memory} onRemove={onMemoryRemove} onClear={onMemoryClear} />
      {constraints.length > 0 && (
        <div className="dn-card px-3 py-2 text-xs font-bold text-[#4c4c35]">
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
          <div className="dn-card border-dashed p-6 text-center text-sm leading-6 text-stone-500">输入需求后，我会只从现有菜品库里推荐 3 个具体选择，并展示同学反馈证据。</div>
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
