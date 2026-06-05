import { Chip } from "@/components/ui/Chip";
import type { Food, FoodFeedback, Recommendation, UserMemory } from "@/types";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

export function RecommendationCard({
  recommendation,
  foods,
  onAte,
  onAvoid,
  onPatch,
}: {
  recommendation: Recommendation;
  foods: FoodWithFeedback[];
  onAte: (foodId: string) => void;
  onAvoid: (foodId: string) => void;
  onPatch: (patch: Partial<UserMemory>) => void;
}) {
  const food = foods.find((item) => item.id === recommendation.foodId);
  if (!food) return null;
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-stone-900">{food.name}</h3>
          <p className="mt-1 text-xs text-stone-500">
            {food.canteen} · {food.stall}
          </p>
        </div>
        <span className="text-lg font-black text-red-600">¥{food.price}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {food.tags.slice(0, 5).map((tag) => (
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-700">{recommendation.reason}</p>
      <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">可能缺点：{recommendation.risk}</p>
      <div className="mt-3 space-y-1">
        {recommendation.evidence.map((item) => (
          <p className="text-xs text-stone-500" key={item}>
            · {item}
          </p>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-black text-white" type="button" onClick={() => onAte(food.id)}>
          就吃这个
        </button>
        <button className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-bold text-stone-700" type="button" onClick={() => onAvoid(food.id)}>
          不喜欢
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
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
    </article>
  );
}
