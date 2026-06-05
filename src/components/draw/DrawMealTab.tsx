import { Chip } from "@/components/ui/Chip";
import { foodItems } from "@/data/foods";
import { drawMealCards } from "@/lib/draw";
import type { DrawCard, Food, FoodFeedback, UserMemory } from "@/types";
import { useState } from "react";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

export function DrawMealTab({
  foods,
  feedback,
  memory,
  onMemoryPatch,
}: {
  foods: FoodWithFeedback[];
  feedback: FoodFeedback[];
  memory: UserMemory;
  onMemoryPatch: (patch: Partial<UserMemory>) => void;
}) {
  const [cards, setCards] = useState<DrawCard[]>([]);
  const draw = () => setCards(drawMealCards(foodItems, feedback, memory));
  const foodMap = new Map(foods.map((food) => [food.id, food]));

  return (
    <div className="space-y-4 pb-24">
      <header>
        <h1 className="text-3xl font-black text-stone-950">抽一餐</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">不想纠结的时候，从校园菜品库里抽出稳妥、探店和惊喜三个选择。</p>
      </header>
      <section className="rounded-lg border border-amber-100 bg-amber-50 p-4">
        <p className="text-xs font-bold text-amber-800">抽卡已避开</p>
        <p className="mt-1 text-sm text-amber-900">
          {memory.avoidTags.length || memory.recentFoods.length ? [...memory.avoidTags.map((tag) => `避开${tag}`), ...memory.recentFoods.map((id) => `最近吃过${foodMap.get(id)?.name ?? id}`)].join("、") : "暂无忌口，先给你抽点稳的。"}
        </p>
        <button className="mt-4 w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-black text-white" type="button" onClick={draw}>
          开始抽卡
        </button>
      </section>
      <section className="space-y-3">
        {cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">点击抽卡后，会出现稳妥卡、探店卡和惊喜卡。</div>
        ) : (
          cards.map((card) => {
            const food = foodMap.get(card.foodId);
            if (!food) return null;
            return (
              <article key={card.type} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-black text-emerald-700">{card.title}</p>
                <div className="mt-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-stone-900">{food.name}</h3>
                    <p className="mt-1 text-xs text-stone-500">
                      {food.canteen} · {food.stall}
                    </p>
                  </div>
                  <span className="font-black text-red-600">¥{food.price}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {food.tags.slice(0, 4).map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600">{card.reason}</p>
                <button className="mt-4 w-full rounded-lg bg-emerald-700 py-2 text-sm font-black text-white" type="button" onClick={() => onMemoryPatch({ recentFoods: [food.id] })}>
                  就它了
                </button>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
