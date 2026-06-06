import { Chip } from "@/components/ui/Chip";
import { MetricPill } from "@/components/ui/MetricPill";
import type { Food, FoodFeedback, Recommendation, UserMemory } from "@/types";
import type { MouseEvent } from "react";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

export function RecommendationCard({
  rank,
  recommendation,
  foods,
  onAte,
  onAvoid,
  onPatch,
  onOpenDetail,
}: {
  rank: number;
  recommendation: Recommendation;
  foods: FoodWithFeedback[];
  onAte: (foodId: string) => void;
  onAvoid: (foodId: string) => void;
  onPatch: (patch: Partial<UserMemory>) => void;
  onOpenDetail: (foodId: string) => void;
}) {
  const food = foods.find((item) => item.id === recommendation.foodId);
  if (!food) return null;
  const evidence = Array.isArray(recommendation.evidence) ? recommendation.evidence : [String(recommendation.evidence || `${food.canteen} ${food.stall}`)];
  const distanceText = food.distanceLevel === "near" ? "距离近" : food.distanceLevel === "medium" ? "距离适中" : "稍远";
  const stopAndRun = (event: MouseEvent, action: () => void) => {
    event.stopPropagation();
    action();
  };

  return (
    <article
      className="cursor-pointer overflow-hidden rounded-[1.45rem] border border-stone-200 bg-white shadow-[0_16px_36px_rgba(41,37,30,0.09)] transition active:scale-[0.995]"
      onClick={() => onOpenDetail(food.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpenDetail(food.id);
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <MetricPill tone="green">推荐 {rank}</MetricPill>
          <MetricPill tone="neutral">{distanceText}</MetricPill>
        </div>
        <MetricPill tone="red">¥{food.price}</MetricPill>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black leading-tight text-stone-950">{food.name}</h3>
            <p className="mt-1 text-xs text-stone-500">
              {food.canteen} / {food.stall}
            </p>
          </div>
          <span className="text-xs font-black text-emerald-700">匹配 {Math.round(recommendation.score)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {food.tags.slice(0, 5).map((tag) => (
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-emerald-50 px-3 py-3">
          <p className="text-xs font-black text-emerald-800">为什么推荐</p>
          <p className="mt-1 text-sm leading-6 text-stone-700">{recommendation.reason}</p>
        </div>
        <p className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">可能缺点：{recommendation.risk}</p>
        <div className="mt-3 space-y-1 rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2">
          <p className="text-xs font-black text-stone-700">证据</p>
          {evidence.map((item) => (
            <p className="text-xs leading-5 text-stone-500" key={item}>
              {item}
            </p>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-2xl bg-emerald-700 px-3 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]" type="button" onClick={(event) => stopAndRun(event, () => onAte(food.id))}>
            就吃这个
          </button>
          <button className="rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50 active:scale-[0.99]" type="button" onClick={(event) => stopAndRun(event, () => onAvoid(food.id))}>
            不喜欢
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
          <Chip tone="red" onClick={() => onPatch({ avoidTags: ["偏咸", "鍋忓捀"] })}>
            偏咸
          </Chip>
          <Chip tone="red" onClick={() => onPatch({ avoidTags: ["偏辣", "鍋忚荆"] })}>
            太辣
          </Chip>
          <Chip tone="green" onClick={() => onPatch({ preferTags: ["清淡", "娓呮贰"] })}>
            想清淡
          </Chip>
        </div>
      </div>
    </article>
  );
}
