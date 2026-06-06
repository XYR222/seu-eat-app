import { Chip } from "@/components/ui/Chip";
import { MetricPill } from "@/components/ui/MetricPill";
import type { Food, FoodFeedback } from "@/types";

export type FoodWithFeedback = Food & { feedback: FoodFeedback };

export function FoodDetailSheet({
  food,
  onClose,
  onFeedback,
}: {
  food: FoodWithFeedback;
  onClose: () => void;
  onFeedback: (foodId: string, type: "like" | "dislike" | "tag", tag?: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-end bg-stone-950/35 px-3 pb-3 backdrop-blur-[2px]" onClick={onClose}>
      <div className="max-h-[84vh] w-full overflow-auto rounded-[1.7rem] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200" />
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-xs font-black text-orange-600">菜品详情</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-stone-950">{food.name}</h2>
            <p className="mt-1 text-sm text-stone-500">
              {food.canteen} · {food.stall}
            </p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-xl text-stone-500" onClick={onClose} type="button">
            ×
          </button>
        </div>
        <MetricPill tone="red">¥{food.price}</MetricPill>
        <p className="mt-3 text-sm leading-6 text-stone-600">{food.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {food.tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
        <div className="mt-4 rounded-[1.25rem] border border-stone-100 bg-stone-50 p-3">
          <p className="text-sm font-black text-stone-950">学生反馈</p>
          <p className="mt-1 text-xs text-stone-500">
            👍{food.feedback.likes} 👎{food.feedback.dislikes}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(food.feedback.tagVotes)
              .filter(([, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([tag, count]) => (
                <Chip key={tag}>
                  {tag} {count}
                </Chip>
              ))}
          </div>
          <div className="mt-3 space-y-2">
            {food.feedback.comments.slice(0, 3).map((comment) => (
              <p className="rounded-md bg-white px-3 py-2 text-xs leading-5 text-stone-600" key={comment}>
                “{comment}”
              </p>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-2xl bg-emerald-700 py-2.5 text-sm font-black text-white shadow-sm" onClick={() => onFeedback(food.id, "like")} type="button">
            点赞
          </button>
          <button className="rounded-2xl border border-stone-200 bg-white py-2.5 text-sm font-bold" onClick={() => onFeedback(food.id, "dislike")} type="button">
            不推荐
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["偏咸", "偏辣", "出餐快", "性价比高", "量大", "适合减脂"].map((tag) => (
            <Chip key={tag} onClick={() => onFeedback(food.id, "tag", tag)} tone={tag.includes("偏") ? "red" : "green"}>
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
