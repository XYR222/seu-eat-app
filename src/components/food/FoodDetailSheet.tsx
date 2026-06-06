import { Chip } from "@/components/ui/Chip";
import { MetricPill } from "@/components/ui/MetricPill";
import type { Food, FoodFeedback } from "@/types";
import { useState } from "react";

export type FoodWithFeedback = Food & { feedback: FoodFeedback };

export function FoodDetailSheet({
  food,
  onClose,
  onFeedback,
  onOpenStall,
  favorite = false,
  onToggleFavorite,
  onMarkAte,
}: {
  food: FoodWithFeedback;
  onClose: () => void;
  onFeedback: (foodId: string, type: "like" | "dislike" | "tag" | "comment", value?: string) => void;
  onOpenStall: () => void;
  favorite?: boolean;
  onToggleFavorite?: (foodId: string) => void;
  onMarkAte?: (foodId: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [synced, setSynced] = useState(false);
  const submitComment = () => {
    onFeedback(food.id, "comment", comment);
    setComment("");
    setSynced(true);
    window.setTimeout(() => setSynced(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-stone-950/35 px-3 pb-3 backdrop-blur-[2px]" onClick={onClose}>
      <div className="mx-auto flex max-h-[86vh] w-full max-w-[430px] flex-col overflow-hidden rounded-[1.8rem] border border-white/70 bg-[#f9faf3] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="overflow-auto p-5 pb-3">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#4c4c35]/16" />
        <div className="mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[1.45rem] border border-white/80 bg-gradient-to-br from-[#dcff3e]/30 via-[#ffe270]/32 to-white shadow-sm">
          {food.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={food.image} alt={food.name} className="h-full w-full object-cover" />
          ) : (
            <div className="px-6 text-center">
              <p className="dn-eyebrow">{food.canteen}</p>
              <p className="mt-2 text-2xl font-black text-[#2a2a1a]">{food.name}</p>
              <p className="dn-muted mt-2 text-xs font-bold">{food.stall}</p>
            </div>
          )}
        </div>

        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="dn-eyebrow text-orange-600">菜品详情</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-[#2a2a1a]">{food.name}</h2>
            <p className="dn-muted mt-1 text-sm">
              {food.canteen} / {food.stall}
            </p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl text-[#4c4c35] shadow-sm" onClick={onClose} type="button">
            x
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <MetricPill tone="red">¥{food.price}</MetricPill>
          {onToggleFavorite && (
            <button className="rounded-full border border-[#dfb836]/40 bg-[#ffe270]/70 px-3 py-1 text-[11px] font-black text-[#8a5b00]" type="button" onClick={() => onToggleFavorite(food.id)}>
              {favorite ? "已收藏" : "收藏"}
            </button>
          )}
          <button className="rounded-full border border-[#4c4c35]/14 bg-white px-3 py-1 text-[11px] font-black text-[#4c4c35]" type="button" onClick={onOpenStall}>
            看同学怎么说
          </button>
        </div>

        <p className="dn-muted mt-3 text-sm leading-6">{food.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {food.tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>

        <div className="dn-card mt-4 p-3">
          <p className="text-sm font-black text-[#2a2a1a]">同学短评墙</p>
          <p className="dn-muted mt-1 text-xs">
            {food.feedback.likes} 位同学推荐，{food.feedback.dislikes} 位同学帮忙排雷。
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
            {food.feedback.comments.length ? (
              food.feedback.comments.slice(0, 6).map((item, index) => (
                <div className="rounded-xl bg-white px-3 py-2" key={`${item}-${index}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-[#526100]">游客 {String.fromCharCode(65 + (index % 4))}</span>
                    <span className="text-[10px] font-bold text-stone-400">{index === 0 ? "刚刚" : index < 3 ? `${index * 12}分钟前` : "今天"}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#4c4c35]">{item}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500">还没有短评，成为第一个帮同学排雷的人。</p>
            )}
          </div>
        </div>

        <div className="dn-card mt-3 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-[#2a2a1a]">发布短评</p>
            {synced && <span className="rounded-full bg-[#dcff3e]/60 px-2.5 py-1 text-[11px] font-black text-[#526100]">已同步到校园口碑</span>}
          </div>
          <textarea
            className="mt-2 min-h-20 w-full resize-none rounded-[1.15rem] border border-[#4c4c35]/14 bg-[#f4f4ea]/70 px-3 py-2 text-sm leading-6 outline-none focus:border-[#b9dc00] focus:ring-4 focus:ring-[#dcff3e]/30"
            maxLength={80}
            placeholder="写一句给同学看的真实短评"
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

        <div className="mt-3 flex flex-wrap gap-2">
          {["偏咸", "偏辣", "出餐快", "性价比高", "量大", "适合减脂"].map((tag) => (
            <Chip key={tag} onClick={() => onFeedback(food.id, "tag", tag)} tone={tag.includes("偏") ? "red" : "green"}>
              {tag}
            </Chip>
          ))}
        </div>
        </div>
        <div className="border-t border-white/80 bg-white/88 p-3 shadow-[0_-12px_28px_rgba(80,82,44,0.10)]">
          <div className="grid grid-cols-2 gap-2">
            <button className="dn-primary-button py-2.5 text-sm font-black" onClick={() => onFeedback(food.id, "like")} type="button">
              推荐给同学
            </button>
            <button className="dn-secondary-button py-2.5 text-sm font-bold" onClick={() => onFeedback(food.id, "dislike")} type="button">
              帮同学排雷
            </button>
          </div>
          {onMarkAte && (
            <button className="mt-2 w-full rounded-full border border-[#b9dc00]/50 bg-[#dcff3e]/24 py-2.5 text-sm font-black text-[#526100]" onClick={() => onMarkAte(food.id)} type="button">
              记为吃过
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
