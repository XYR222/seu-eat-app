import { Chip } from "@/components/ui/Chip";
import { applyFeedbackAction } from "@/lib/feedback";
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
    const next = applyFeedbackAction(feedback, type === "tag" ? { type, foodId, tag: tag ?? "出餐快" } : { type, foodId });
    setFeedback(next);
    if (type === "dislike") onMemoryPatch({ avoidFoods: [foodId] });
    if (tag === "偏咸" || tag === "偏辣" || tag === "油腻") onMemoryPatch({ avoidTags: [tag] });
  };

  return (
    <div className="space-y-4 pb-24">
      <header>
        <h1 className="text-3xl font-black text-stone-950">自己逛逛</h1>
        <p className="mt-2 text-sm text-stone-500">搜索菜品、窗口和同学反馈；这些反馈会成为推荐依据。</p>
      </header>
      <input className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索菜品 / 食堂 / 窗口" />
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
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-black text-stone-900">热门 Top 5</h2>
          <span className="text-xs font-bold text-emerald-700">来自点赞和反馈</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {popular.map((food, index) => (
            <button key={food.id} className="min-w-44 rounded-lg border border-stone-200 bg-white p-3 text-left shadow-sm" onClick={() => setSelected(food)} type="button">
              <span className="text-xs font-black text-amber-700">#{index + 1}</span>
              <p className="mt-1 font-black text-stone-900">{food.name}</p>
              <p className="text-xs text-stone-500">
                👍{food.feedback.likes} 👎{food.feedback.dislikes}
              </p>
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        {filtered.map((food) => (
          <button key={food.id} className="w-full rounded-lg border border-stone-200 bg-white p-4 text-left shadow-sm" type="button" onClick={() => setSelected(food)}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-black text-stone-900">{food.name}</h3>
                <p className="mt-1 text-xs text-stone-500">
                  {food.canteen} · {food.stall}
                </p>
              </div>
              <span className="font-black text-red-600">¥{food.price}</span>
            </div>
            <p className="mt-2 text-xs text-stone-500">
              👍{food.feedback.likes} 👎{food.feedback.dislikes} · {food.tags.slice(0, 3).join(" / ")}
            </p>
          </button>
        ))}
      </section>
      {selected && (
        <div className="fixed inset-0 z-20 flex items-end bg-black/30 px-3 pb-3" onClick={() => setSelected(null)}>
          <div className="max-h-[82vh] w-full overflow-auto rounded-2xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black">{selected.name}</h2>
                <p className="mt-1 text-sm text-stone-500">
                  {selected.canteen} · {selected.stall} · ¥{selected.price}
                </p>
              </div>
              <button className="text-xl text-stone-400" onClick={() => setSelected(null)} type="button">
                ×
              </button>
            </div>
            <p className="text-sm leading-6 text-stone-600">{selected.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.tags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-stone-50 p-3">
              <p className="text-sm font-black">学生反馈</p>
              <p className="mt-1 text-xs text-stone-500">
                👍{selected.feedback.likes} 👎{selected.feedback.dislikes}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(selected.feedback.tagVotes)
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
                {selected.feedback.comments.slice(0, 3).map((comment) => (
                  <p className="rounded-md bg-white px-3 py-2 text-xs leading-5 text-stone-600" key={comment}>
                    “{comment}”
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="rounded-lg bg-emerald-700 py-2 text-sm font-black text-white" onClick={() => submitFeedback(selected.id, "like")} type="button">
                点赞
              </button>
              <button className="rounded-lg border border-stone-200 py-2 text-sm font-bold" onClick={() => submitFeedback(selected.id, "dislike")} type="button">
                不推荐
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["偏咸", "偏辣", "出餐快", "性价比高", "量大", "适合减脂"].map((tag) => (
                <Chip key={tag} onClick={() => submitFeedback(selected.id, "tag", tag)} tone={tag.includes("偏") ? "red" : "green"}>
                  {tag}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
