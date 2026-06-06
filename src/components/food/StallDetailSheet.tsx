import { MetricPill } from "@/components/ui/MetricPill";
import { collectStallComments } from "@/lib/feedback-store";
import type { Food, FoodFeedback, StallFeedback } from "@/types";
import { useState } from "react";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

export function StallDetailSheet({
  stall,
  foods,
  foodFeedback,
  onClose,
  onFeedback,
}: {
  stall: StallFeedback;
  foods: FoodWithFeedback[];
  foodFeedback: FoodFeedback[];
  onClose: () => void;
  onFeedback: (stallKey: string, type: "like" | "dislike" | "comment", comment?: string) => void;
}) {
  const [comment, setComment] = useState("");
  const stallFoods = foods.filter((food) => `${food.canteen}::${food.stall}` === stall.stallKey);
  const comments = collectStallComments(stall, foodFeedback, foods);
  const submitComment = () => {
    onFeedback(stall.stallKey, "comment", comment);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-stone-950/40 px-3 pb-3 backdrop-blur-[2px]" onClick={onClose}>
      <div className="max-h-[84vh] w-full overflow-auto rounded-[1.7rem] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200" />
        <div className="rounded-[1.35rem] border border-orange-100 bg-gradient-to-br from-orange-50 to-emerald-50 p-4">
          <p className="text-xs font-black text-orange-700">{stall.canteen}</p>
          <h2 className="mt-1 text-2xl font-black leading-tight text-stone-950">{stall.stall}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <MetricPill tone="amber">{stallFoods.length} 个菜品</MetricPill>
            <MetricPill tone="green">赞 {stall.likes}</MetricPill>
            <MetricPill tone="neutral">踩 {stall.dislikes}</MetricPill>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-2xl bg-emerald-700 py-2.5 text-sm font-black text-white shadow-sm" onClick={() => onFeedback(stall.stallKey, "like")} type="button">
            点赞窗口
          </button>
          <button className="rounded-2xl border border-stone-200 bg-white py-2.5 text-sm font-bold" onClick={() => onFeedback(stall.stallKey, "dislike")} type="button">
            不推荐窗口
          </button>
        </div>
        <div className="mt-3 rounded-[1.25rem] border border-stone-100 bg-white p-3">
          <p className="text-sm font-black text-stone-950">评价窗口</p>
          <textarea
            className="mt-2 min-h-20 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-6 outline-none focus:border-emerald-400"
            maxLength={80}
            placeholder="评价这个窗口整体体验"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400">{comment.trim().length}/80</span>
            <button className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-black text-white disabled:bg-stone-300" disabled={!comment.trim()} onClick={submitComment} type="button">
              发布窗口评论
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-[1.25rem] border border-stone-100 bg-stone-50 p-3">
          <p className="text-sm font-black text-stone-950">窗口口碑汇总</p>
          <p className="mt-1 text-xs text-stone-500">包含窗口自身评论和该窗口下菜品评论。</p>
          <div className="mt-3 space-y-2">
            {comments.length ? (
              comments.slice(0, 8).map((item) => (
                <p className="rounded-md bg-white px-3 py-2 text-xs leading-5 text-stone-600" key={item}>
                  “{item}”
                </p>
              ))
            ) : (
              <p className="text-xs text-stone-500">这个窗口还没有评论。</p>
            )}
          </div>
        </div>
        <button className="mt-4 w-full rounded-2xl border border-stone-200 bg-white py-2.5 text-sm font-black text-stone-700" onClick={onClose} type="button">
          关闭
        </button>
      </div>
    </div>
  );
}
