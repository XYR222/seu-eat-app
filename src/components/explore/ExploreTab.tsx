import { Chip } from "@/components/ui/Chip";
import { FoodDetailSheet } from "@/components/food/FoodDetailSheet";
import { MetricPill } from "@/components/ui/MetricPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { applyFoodDetailFeedback } from "@/lib/food-detail";
import type { Food, FoodFeedback, UserMemory } from "@/types";
import { useState } from "react";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

const filterTags = ["清淡", "不辣", "高蛋白", "热汤", "面食", "米饭", "性价比高"];

export function ExploreTab({
  foods,
  feedback,
  setFeedback,
  onMemoryPatch,
}: {
  foods: FoodWithFeedback[];
  feedback: FoodFeedback[];
  setFeedback: (items: FoodFeedback[]) => void;
  onMemoryPatch: (patch: Partial<UserMemory>) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [selected, setSelected] = useState<FoodWithFeedback | null>(null);
  const filtered = foods.filter((food) => {
    const text = [food.name, food.canteen, food.stall, food.description, ...food.tags].join(" ");
    return (!query || text.includes(query)) && (!activeTag || food.tags.includes(activeTag));
  });
  const popular = [...foods].sort((a, b) => b.feedback.likes - b.feedback.dislikes - (a.feedback.likes - a.feedback.dislikes)).slice(0, 5);

  const submitFeedback = (foodId: string, type: "like" | "dislike" | "tag", tag?: string) => {
    const result = applyFoodDetailFeedback(feedback, type === "tag" ? { type, foodId, tag: tag ?? "出餐快" } : { type, foodId });
    setFeedback(result.feedback);
    onMemoryPatch(result.memoryPatch);
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
        <p className="mt-3 text-sm leading-6 text-stone-600">搜索菜品、窗口和同学反馈；你的点赞和标签会进入推荐依据。</p>
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
      <section>
        <SectionHeader title="热门 Top 5" subtitle="来自点赞、踩和高频反馈。" action={<MetricPill tone="green">同学反馈</MetricPill>} />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {popular.map((food, index) => (
            <button key={food.id} className="mt-3 min-w-48 rounded-[1.25rem] border border-stone-200 bg-white p-3 text-left shadow-[0_10px_24px_rgba(41,37,30,0.07)] transition active:scale-[0.99]" onClick={() => setSelected(food)} type="button">
              <div className="flex items-center justify-between">
                <MetricPill tone={index === 0 ? "amber" : "neutral"}>#{index + 1}</MetricPill>
                <span className="text-sm font-black text-red-600">¥{food.price}</span>
              </div>
              <p className="mt-2 line-clamp-1 font-black text-stone-950">{food.name}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {food.canteen} · 👍{food.feedback.likes} 👎{food.feedback.dislikes}
              </p>
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <SectionHeader title="菜品列表" subtitle={query || activeTag ? "已按当前条件筛选。" : "按食堂、价格和同学反馈快速扫一遍。"} />
        {filtered.map((food) => (
          <button key={food.id} className="w-full rounded-[1.35rem] border border-stone-200 bg-white/95 p-4 text-left shadow-[0_12px_28px_rgba(41,37,30,0.07)] transition active:scale-[0.99]" type="button" onClick={() => setSelected(food)}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black leading-tight text-stone-950">{food.name}</h3>
                <p className="mt-1 text-xs text-stone-500">
                  {food.canteen} · {food.stall}
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
        ))}
      </section>
      {selected && <FoodDetailSheet food={selected} onClose={() => setSelected(null)} onFeedback={submitFeedback} />}
    </div>
  );
}
