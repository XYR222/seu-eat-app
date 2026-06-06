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
      className="dn-card cursor-pointer overflow-hidden transition active:scale-[0.995]"
      onClick={() => onOpenDetail(food.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpenDetail(food.id);
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between border-b border-[#4c4c35]/10 bg-[#f4f4ea]/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <MetricPill tone="green">推荐 {rank}</MetricPill>
          <MetricPill tone="neutral">{distanceText}</MetricPill>
        </div>
        <MetricPill tone="red">¥{food.price}</MetricPill>
      </div>
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black leading-tight text-[#2a2a1a]">{food.name}</h3>
            <p className="dn-muted mt-1 text-xs">
              {food.canteen} / {food.stall}
            </p>
          </div>
          <span className="text-xs font-black text-[#5e6e00]">匹配 {Math.round(recommendation.score)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {food.tags.slice(0, 5).map((tag) => (
            <span className="rounded-full bg-[#dcff3e]/35 px-2 py-1 text-[11px] font-black text-[#526100]" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-[1.15rem] bg-[#dcff3e]/24 px-3 py-3 pr-16">
          <p className="text-xs font-black text-[#526100]">为什么适合你</p>
          <p className="mt-1 text-sm leading-6 text-[#4c4c35]">{recommendation.reason}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pipi/pipi-avatar.png" alt="" className="dn-pipi-shadow absolute right-2 top-28 h-16 w-16 object-contain opacity-95" />
        </div>
        <div className="mt-3 space-y-1 rounded-[1.1rem] border border-[#4c4c35]/10 bg-[#f4f4ea]/80 px-3 py-2">
          <p className="text-xs font-black text-[#4c4c35]">同学怎么说</p>
          {evidence.slice(0, 3).map((item) => (
            <p className="text-xs leading-5 text-stone-500" key={item}>
              {item}
            </p>
          ))}
        </div>
        <div className="mt-2 rounded-[1.1rem] bg-[#ffe270]/42 px-3 py-2">
          <p className="text-xs font-black text-[#8a5b00]">可能不适合</p>
          <p className="mt-1 text-xs leading-5 text-[#8a5b00]">{recommendation.risk}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="dn-primary-button px-3 py-2.5 text-sm font-black transition active:scale-[0.99]" type="button" onClick={(event) => stopAndRun(event, () => onAte(food.id))}>
            就吃这个
          </button>
          <button className="dn-secondary-button px-3 py-2.5 text-sm font-bold transition active:scale-[0.99]" type="button" onClick={(event) => stopAndRun(event, () => onAvoid(food.id))}>
            不喜欢
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
          <Chip tone="red" onClick={() => onPatch({ avoidTags: ["偏咸"] })}>
            偏咸
          </Chip>
          <Chip tone="red" onClick={() => onPatch({ avoidTags: ["偏辣"] })}>
            太辣
          </Chip>
          <Chip tone="green" onClick={() => onPatch({ preferTags: ["清淡"] })}>
            想清淡
          </Chip>
        </div>
      </div>
    </article>
  );
}

