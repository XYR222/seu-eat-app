import { FoodDetailSheet } from "@/components/food/FoodDetailSheet";
import { StallDetailSheet } from "@/components/food/StallDetailSheet";
import { Chip } from "@/components/ui/Chip";
import { MetricPill } from "@/components/ui/MetricPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCanteenSummaries, getFoodsForStall, getStallsForCanteen } from "@/lib/canteen-navigation";
import { buildStallKey } from "@/lib/feedback-store";
import { applyFoodDetailFeedback, applyStallDetailFeedback } from "@/lib/food-detail";
import { isFavoriteFood } from "@/lib/my-store";
import type { FeedbackEventRequest } from "@/lib/shared-feedback";
import type { FavoriteFood, Food, FoodFeedback, StallFeedback, UserMemory } from "@/types";
import { useState } from "react";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

const filterTags = ["清淡", "不辣", "高蛋白", "热汤", "面食", "米饭", "性价比高"];

function FoodListCard({ food, onClick }: { food: FoodWithFeedback; onClick: () => void }) {
  return (
    <button className="w-full rounded-[1.35rem] border border-stone-200 bg-white/95 p-4 text-left shadow-[0_12px_28px_rgba(41,37,30,0.07)] transition active:scale-[0.99]" type="button" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black leading-tight text-stone-950">{food.name}</h3>
          <p className="mt-1 text-xs text-stone-500">
            {food.canteen} / {food.stall}
          </p>
        </div>
        <MetricPill tone="red">¥{food.price}</MetricPill>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <MetricPill tone="green">赞 {food.feedback.likes}</MetricPill>
        <MetricPill tone="neutral">踩 {food.feedback.dislikes}</MetricPill>
        {food.tags.slice(0, 3).map((tag) => (
          <MetricPill key={tag}>{tag}</MetricPill>
        ))}
      </div>
    </button>
  );
}

export function ExploreTab({
  foods,
  feedback,
  stallFeedback,
  setFeedback,
  setStallFeedback,
  onMemoryPatch,
  favorites,
  onToggleFavorite,
  onMealSelected,
  onSharedFeedback,
}: {
  foods: FoodWithFeedback[];
  feedback: FoodFeedback[];
  stallFeedback: StallFeedback[];
  setFeedback: (items: FoodFeedback[]) => void;
  setStallFeedback: (items: StallFeedback[]) => void;
  onMemoryPatch: (patch: Partial<UserMemory>) => void;
  favorites: FavoriteFood[];
  onToggleFavorite: (foodId: string) => void;
  onMealSelected: (foodId: string) => void;
  onSharedFeedback: (event: Omit<FeedbackEventRequest, "deviceId">) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [selectedStallKey, setSelectedStallKey] = useState<string | null>(null);
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);
  const [selectedBrowseStall, setSelectedBrowseStall] = useState<string | null>(null);

  const filtered = foods.filter((food) => {
    const text = [food.name, food.canteen, food.stall, food.description, ...food.tags].join(" ");
    return (!query || text.includes(query)) && (!activeTag || food.tags.includes(activeTag));
  });
  const popular = [...foods].sort((a, b) => b.feedback.likes - b.feedback.dislikes - (a.feedback.likes - a.feedback.dislikes)).slice(0, 5);
  const canteens = getCanteenSummaries(foods);
  const canteenStalls = selectedCanteen ? getStallsForCanteen(foods, selectedCanteen) : [];
  const stallFoods = selectedCanteen && selectedBrowseStall ? getFoodsForStall(foods, selectedCanteen, selectedBrowseStall) : [];
  const selected = selectedFoodId ? foods.find((food) => food.id === selectedFoodId) ?? null : null;
  const selectedStall = selectedStallKey ? stallFeedback.find((item) => item.stallKey === selectedStallKey) : undefined;
  const browseStallFeedback = selectedCanteen && selectedBrowseStall ? stallFeedback.find((item) => item.stallKey === buildStallKey(selectedCanteen, selectedBrowseStall)) : undefined;

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
            <p className="text-xs font-black text-orange-600">校园轻量点评</p>
            <h1 className="mt-1 text-[2rem] font-black leading-tight text-stone-950">逛食堂</h1>
          </div>
          <MetricPill tone="amber">{filtered.length} 个结果</MetricPill>
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-600">搜索菜品、食堂和窗口，也可以直接点进食堂，再按窗口浏览菜品。</p>
      </header>

      <label className="flex items-center gap-2 rounded-3xl border border-stone-200 bg-white/90 px-4 py-3 shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
        <span className="text-stone-400">⌕</span>
        <input className="w-full bg-transparent text-sm font-semibold text-stone-800 outline-none placeholder:text-stone-400" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索菜品 / 食堂 / 窗口 / 标签" />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip tone={!activeTag ? "green" : "neutral"} onClick={() => setActiveTag("")}>
          全部
        </Chip>
        {filterTags.map((tag) => (
          <Chip key={tag} tone={activeTag === tag ? "green" : "neutral"} onClick={() => setActiveTag(tag)}>
            {tag}
          </Chip>
        ))}
      </div>

      <section className="space-y-3">
        <SectionHeader
          title={selectedCanteen ? selectedCanteen : "按食堂逛"}
          subtitle={selectedBrowseStall ? `${selectedBrowseStall} / ${stallFoods.length} 个菜品` : selectedCanteen ? `${canteenStalls.length} 个窗口，继续选择窗口看菜品` : "不想搜索时，直接从食堂入口进入。"}
          action={
            selectedCanteen ? (
              <Chip
                onClick={() => {
                  setSelectedCanteen(null);
                  setSelectedBrowseStall(null);
                }}
              >
                全部食堂
              </Chip>
            ) : (
              <MetricPill tone="green">{canteens.length} 个食堂</MetricPill>
            )
          }
        />

        {!selectedCanteen && (
          <div className="grid grid-cols-2 gap-3">
            {canteens.map((item, index) => (
              <button key={item.canteen} className="rounded-[1.35rem] border border-stone-200 bg-white/95 p-4 text-left shadow-[0_12px_28px_rgba(41,37,30,0.07)] transition active:scale-[0.99]" type="button" onClick={() => setSelectedCanteen(item.canteen)}>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-black text-emerald-800">{index + 1}</span>
                  <MetricPill tone="amber">{item.foodCount} 菜</MetricPill>
                </div>
                <h3 className="mt-3 line-clamp-1 text-base font-black text-stone-950">{item.canteen}</h3>
                <p className="mt-1 text-xs font-bold text-stone-500">{item.stallCount} 个窗口</p>
              </button>
            ))}
          </div>
        )}

        {selectedCanteen && !selectedBrowseStall && (
          <div className="space-y-2">
            {canteenStalls.map((item) => (
              <button key={item.stall} className="w-full rounded-[1.25rem] border border-stone-200 bg-white/95 p-4 text-left shadow-[0_10px_24px_rgba(41,37,30,0.06)] transition active:scale-[0.99]" type="button" onClick={() => setSelectedBrowseStall(item.stall)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-stone-950">{item.stall}</h3>
                    <p className="mt-1 text-xs text-stone-500">{item.canteen}</p>
                  </div>
                  <MetricPill tone="green">{item.foodCount} 个菜</MetricPill>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedCanteen && selectedBrowseStall && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-emerald-100 bg-emerald-50/80 p-3">
              <button className="text-xs font-black text-emerald-800" type="button" onClick={() => setSelectedBrowseStall(null)}>
                返回窗口列表
              </button>
              {browseStallFeedback && (
                <button className="rounded-full bg-stone-950 px-3 py-1.5 text-xs font-black text-white" type="button" onClick={() => setSelectedStallKey(browseStallFeedback.stallKey)}>
                  查看窗口口碑
                </button>
              )}
            </div>
            {stallFoods.map((food) => (
              <FoodListCard key={food.id} food={food} onClick={() => setSelectedFoodId(food.id)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="热门 Top 5" subtitle="来自点赞、踩和高频反馈。" action={<MetricPill tone="green">同学反馈</MetricPill>} />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {popular.map((food, index) => (
            <button key={food.id} className="mt-3 min-w-48 rounded-[1.25rem] border border-stone-200 bg-white p-3 text-left shadow-[0_10px_24px_rgba(41,37,30,0.07)] transition active:scale-[0.99]" onClick={() => setSelectedFoodId(food.id)} type="button">
              <div className="flex items-center justify-between">
                <MetricPill tone={index === 0 ? "amber" : "neutral"}>#{index + 1}</MetricPill>
                <span className="text-sm font-black text-red-600">¥{food.price}</span>
              </div>
              <p className="mt-2 line-clamp-1 font-black text-stone-950">{food.name}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {food.canteen} / 赞 {food.feedback.likes} 踩 {food.feedback.dislikes}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title="菜品列表" subtitle={query || activeTag ? "已按当前条件筛选。" : "按食堂、价格和同学反馈快速扫一遍。"} />
        {filtered.map((food) => (
          <FoodListCard key={food.id} food={food} onClick={() => setSelectedFoodId(food.id)} />
        ))}
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
