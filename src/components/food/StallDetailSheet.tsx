import { MetricPill } from "@/components/ui/MetricPill";
import { stallImages } from "@/data/stall-images";
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
  const stallImage = stallImages[stall.stallKey];
  const submitComment = () => {
    onFeedback(stall.stallKey, "comment", comment);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-stone-950/40 px-3 pb-3 backdrop-blur-[2px]" onClick={onClose}>
      <div className="mx-auto max-h-[86vh] w-full max-w-[430px] overflow-auto rounded-[1.8rem] border border-white/70 bg-[#f9faf3] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#4c4c35]/16" />
        <div className="dn-card overflow-hidden">
          <div className="aspect-[16/9] bg-gradient-to-br from-orange-50 to-emerald-50">
            {stallImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={stallImage} alt={`${stall.stall}店面图`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <div>
                  <p className="dn-eyebrow text-orange-700">{stall.canteen}</p>
                  <p className="mt-2 text-2xl font-black leading-tight text-[#2a2a1a]">{stall.stall}</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="dn-eyebrow text-orange-700">{stall.canteen}</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-[#2a2a1a]">{stall.stall}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <MetricPill tone="amber">{stallFoods.length} 个菜品</MetricPill>
              <MetricPill tone="green">赞 {stall.likes}</MetricPill>
              <MetricPill tone="neutral">踩 {stall.dislikes}</MetricPill>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="dn-primary-button py-2.5 text-sm font-black" onClick={() => onFeedback(stall.stallKey, "like")} type="button">
            推荐这个窗口
          </button>
          <button className="dn-secondary-button py-2.5 text-sm font-bold" onClick={() => onFeedback(stall.stallKey, "dislike")} type="button">
            帮同学排雷
          </button>
        </div>

        <div className="dn-card mt-3 p-3">
          <p className="text-sm font-black text-[#2a2a1a]">发布窗口短评</p>
          <textarea
            className="mt-2 min-h-20 w-full resize-none rounded-[1.15rem] border border-[#4c4c35]/14 bg-[#f4f4ea]/70 px-3 py-2 text-sm leading-6 outline-none focus:border-[#b9dc00] focus:ring-4 focus:ring-[#dcff3e]/30"
            maxLength={80}
            placeholder="评价这个窗口整体体验，帮同学判断要不要排队"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400">{comment.trim().length}/80</span>
            <button className="dn-primary-button px-4 py-2 text-xs font-black disabled:opacity-50" disabled={!comment.trim()} onClick={submitComment} type="button">
              发布短评
            </button>
          </div>
        </div>

        <div className="dn-card mt-4 p-3">
          <p className="text-sm font-black text-[#2a2a1a]">窗口口碑汇总</p>
          <p className="dn-muted mt-1 text-xs">包含窗口自身评论和该窗口下菜品评论。</p>
          <div className="mt-3 space-y-2">
            {comments.length ? (
              comments.slice(0, 8).map((item) => (
                <p className="rounded-xl bg-white px-3 py-2 text-xs leading-5 text-[#4c4c35]" key={item}>
                  {item}
                </p>
              ))
            ) : (
              <p className="text-xs text-stone-500">这个窗口还没有评论。</p>
            )}
          </div>
        </div>

        <button className="dn-secondary-button mt-4 w-full py-2.5 text-sm font-black" onClick={onClose} type="button">
          关闭
        </button>
      </div>
    </div>
  );
}
