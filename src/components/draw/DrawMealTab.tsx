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
  const toneMap: Record<DrawCard["type"], { wrap: string; pill: "green" | "amber" | "dark"; label: string; pipi: string }> = {
    safe: { wrap: "border-[#b9dc00]/45 bg-[#dcff3e]/22", pill: "green", label: "低踩雷", pipi: "/pipi/pipi-draw-safe-accent.png" },
    explore: { wrap: "border-[#dfb836]/36 bg-[#ffe270]/30", pill: "amber", label: "换窗口", pipi: "/pipi/pipi-draw-explore-accent.png" },
    surprise: { wrap: "border-[#4c4c35]/16 bg-white/86", pill: "dark", label: "随机感", pipi: "/pipi/pipi-draw-surprise-accent.png" },
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
      <header className="dn-hero-card">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="max-w-[68%]">
            <p className="dn-eyebrow text-orange-700">不想纠结</p>
            <h1 className="dn-card-title mt-1">抽一餐</h1>
          </div>
          <MetricPill tone="amber">3 张卡</MetricPill>
        </div>
        <p className="dn-muted relative z-10 mt-3 max-w-[68%] text-sm leading-6">从校园菜品库里抽出稳妥、探店和惊喜三个选择，仍然会参考你的忌口和最近吃过什么。</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pipi/pipi-draw-hero.png" alt="" className="dn-pipi-shadow absolute -bottom-1 right-1 h-32 w-32 object-contain object-bottom" />
      </header>
      <section className="dn-card p-4">
        <p className="dn-eyebrow text-[#8a5b00]">抽卡已避开</p>
        <p className="mt-1 text-sm leading-6 text-[#4c4c35]">{avoidedText}</p>
        <button className="dn-primary-button mt-4 w-full px-4 py-3.5 text-sm font-black transition active:scale-[0.99]" type="button" onClick={draw}>
          {cards.length ? "再抽一轮" : "开始抽卡"}
        </button>
      </section>
      <section className="space-y-3">
        <SectionHeader title="今日三张卡" subtitle={drawCount ? `第 ${drawCount} 轮，随机但不乱来。` : "随机但不乱来，仍然基于本地菜品和反馈。"} />
        {cards.length === 0 ? (
          <div className="dn-card border-dashed p-6 text-center text-sm leading-6 text-stone-500">点击抽卡后，会出现稳妥卡、探店卡和惊喜卡。</div>
        ) : (
          cards.map((card) => {
            const food = foodMap.get(card.foodId);
            if (!food) return null;
            const tone = toneMap[card.type];
            return (
              <article key={card.type} className={`relative overflow-hidden rounded-[1.45rem] border p-4 text-left shadow-[0_14px_32px_rgba(41,37,30,0.08)] transition active:scale-[0.99] ${tone.wrap}`} onClick={() => setSelectedFoodId(food.id)}>
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <p className="text-sm font-black text-[#4c4c35]">{card.title}</p>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <MetricPill tone={tone.pill}>{tone.label}</MetricPill>
                    <MetricPill tone="red">¥{food.price}</MetricPill>
                  </div>
                </div>
                <div className="relative z-10 mt-2">
                  <div>
                    <h3 className="line-clamp-2 text-2xl font-black leading-tight text-[#2a2a1a]">{food.name}</h3>
                    <p className="dn-muted mt-1 text-xs">
                      {food.canteen} · {food.stall}
                    </p>
                  </div>
                </div>
                <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                  {food.tags.slice(0, 4).map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
                <p className="relative z-10 mt-4 rounded-[1.1rem] bg-white/72 px-3 py-2.5 text-sm leading-6 text-[#4c4c35]">{card.reason}</p>
                <button
                  className="dn-primary-button relative z-10 mt-4 w-full py-2.5 text-sm font-black transition active:scale-[0.99]"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMemoryPatch({ recentFoods: [food.id] });
                    onMealSelected(food.id);
                  }}
                >
                  就它了
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tone.pipi} alt="" className="dn-pipi-shadow pointer-events-none absolute right-10 top-24 z-0 h-20 w-20 object-contain opacity-45" />
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
