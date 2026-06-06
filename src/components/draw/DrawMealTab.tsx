import { Chip } from "@/components/ui/Chip";
import { FoodDetailSheet } from "@/components/food/FoodDetailSheet";
import { StallDetailSheet } from "@/components/food/StallDetailSheet";
import { MetricPill } from "@/components/ui/MetricPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { foodItems } from "@/data/foods";
import { drawMealCards } from "@/lib/draw";
import { buildStallKey } from "@/lib/feedback-store";
import { applyFoodDetailFeedback, applyStallDetailFeedback } from "@/lib/food-detail";
import { isFavoriteFood } from "@/lib/my-store";
import type { FeedbackEventRequest } from "@/lib/shared-feedback";
import type { DrawCard, FavoriteFood, Food, FoodFeedback, StallFeedback, UserMemory } from "@/types";
import { useState } from "react";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

export function DrawMealTab({
  foods,
  feedback,
  stallFeedback,
  setFeedback,
  setStallFeedback,
  memory,
  onMemoryPatch,
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
  onMealSelected: (foodId: string) => void;
  favorites: FavoriteFood[];
  onToggleFavorite: (foodId: string) => void;
  onSharedFeedback: (event: Omit<FeedbackEventRequest, "deviceId">) => void;
}) {
  const [cards, setCards] = useState<DrawCard[]>([]);
  const [drawCount, setDrawCount] = useState(0);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [selectedStallKey, setSelectedStallKey] = useState<string | null>(null);
  const draw = () =>
    setCards((current) => {
      const next = drawMealCards(foodItems, feedback, memory, { previousFoodIds: current.map((card) => card.foodId) });
      setDrawCount((count) => count + 1);
      return next;
    });
  const foodMap = new Map(foods.map((food) => [food.id, food]));
  const avoidedText =
    memory.avoidTags.length || memory.recentFoods.length
      ? [...memory.avoidTags.map((tag) => `避开${tag}`), ...memory.recentFoods.map((id) => `最近吃过${foodMap.get(id)?.name ?? id}`)].join("、")
      : "暂无忌口，先给你抽点稳的。";
  const toneMap: Record<DrawCard["type"], { wrap: string; pill: "green" | "amber" | "dark"; label: string }> = {
    safe: { wrap: "border-emerald-200 bg-emerald-50/70", pill: "green", label: "低踩雷" },
    explore: { wrap: "border-orange-200 bg-orange-50/80", pill: "amber", label: "换窗口" },
    surprise: { wrap: "border-yellow-200 bg-yellow-50/90", pill: "dark", label: "随机感" },
  };
  const selected = selectedFoodId ? foods.find((food) => food.id === selectedFoodId) ?? null : null;
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
  const selectedStall = selectedStallKey ? stallFeedback.find((item) => item.stallKey === selectedStallKey) : undefined;

  return (
    <div className="space-y-4 pb-3">
      <header className="rounded-[1.7rem] border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-orange-50 p-5 shadow-[0_18px_45px_rgba(120,73,20,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-orange-700">不想纠结</p>
            <h1 className="mt-1 text-[2rem] font-black leading-tight text-stone-950">抽一餐</h1>
          </div>
          <MetricPill tone="amber">3 张卡</MetricPill>
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-600">从校园菜品库里抽出稳妥、探店和惊喜三个选择，仍然会参考你的忌口和最近吃过什么。</p>
      </header>
      <section className="rounded-[1.45rem] border border-amber-200 bg-white/85 p-4 shadow-sm">
        <p className="text-xs font-black text-amber-800">抽卡已避开</p>
        <p className="mt-1 text-sm leading-6 text-amber-950">{avoidedText}</p>
        <button className="mt-4 w-full rounded-2xl bg-stone-950 px-4 py-3.5 text-sm font-black text-white shadow-[0_14px_24px_rgba(41,37,30,0.24)] transition hover:bg-stone-800 active:scale-[0.99]" type="button" onClick={draw}>
          {cards.length ? "再抽一轮" : "开始抽卡"}
        </button>
      </section>
      <section className="space-y-3">
        <SectionHeader title="今日三张卡" subtitle={drawCount ? `第 ${drawCount} 轮，随机但不乱来。` : "随机但不乱来，仍然基于本地菜品和反馈。"} />
        {cards.length === 0 ? (
          <div className="rounded-[1.35rem] border border-dashed border-amber-300 bg-white/82 p-6 text-center text-sm leading-6 text-stone-500">点击抽卡后，会出现稳妥卡、探店卡和惊喜卡。</div>
        ) : (
          cards.map((card) => {
            const food = foodMap.get(card.foodId);
            if (!food) return null;
            const tone = toneMap[card.type];
            return (
              <article key={card.type} className={`rounded-[1.45rem] border p-4 text-left shadow-[0_14px_32px_rgba(41,37,30,0.08)] transition active:scale-[0.99] ${tone.wrap}`} onClick={() => setSelectedFoodId(food.id)}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black text-stone-800">{card.title}</p>
                  <MetricPill tone={tone.pill}>{tone.label}</MetricPill>
                </div>
                <div className="mt-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black leading-tight text-stone-950">{food.name}</h3>
                    <p className="mt-1 text-xs text-stone-500">
                      {food.canteen} · {food.stall}
                    </p>
                  </div>
                  <MetricPill tone="red">¥{food.price}</MetricPill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {food.tags.slice(0, 4).map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
                <p className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-sm leading-6 text-stone-700">{card.reason}</p>
                <button
                  className="mt-4 w-full rounded-2xl bg-emerald-700 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMemoryPatch({ recentFoods: [food.id] });
                    onMealSelected(food.id);
                  }}
                >
                  就它了
                </button>
              </article>
            );
          })
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
