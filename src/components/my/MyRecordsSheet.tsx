import { MemorySummary } from "@/components/ai/MemorySummary";
import { Chip } from "@/components/ui/Chip";
import { MetricPill } from "@/components/ui/MetricPill";
import type { FavoriteFood, Food, FoodFeedback, MealHistoryItem, UserMemory } from "@/types";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

const sourceLabel: Record<MealHistoryItem["source"], string> = {
  ai: "AI帮选",
  draw: "抽一餐",
  explore: "逛食堂",
};

const actionLabel: Record<MealHistoryItem["action"], string> = {
  ate: "吃过",
  selected: "选择",
  disliked: "不喜欢",
};

function formatRelativeTime(createdAt: string) {
  const time = new Date(createdAt).getTime();
  if (!Number.isFinite(time)) return "刚刚";
  const minutes = Math.max(0, Math.round((Date.now() - time) / 60000));
  if (minutes < 5) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.round(hours / 24)}天前`;
}

export function MyRecordsSheet({
  foods,
  history,
  favorites,
  memory,
  onClose,
  onOpenFood,
  onToggleFavorite,
  onMemoryRemove,
  onMemoryClear,
}: {
  foods: FoodWithFeedback[];
  history: MealHistoryItem[];
  favorites: FavoriteFood[];
  memory: UserMemory;
  onClose: () => void;
  onOpenFood: (foodId: string) => void;
  onToggleFavorite: (foodId: string) => void;
  onMemoryRemove: (field: keyof UserMemory, value: string) => void;
  onMemoryClear: () => void;
}) {
  const foodMap = new Map(foods.map((food) => [food.id, food]));
  const recentHistory = history.slice(0, 5);
  const favoriteFoods = favorites.map((item) => foodMap.get(item.foodId)).filter((food): food is FoodWithFeedback => Boolean(food));

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-stone-950/35 px-3 pb-3 backdrop-blur-[2px]" onClick={onClose}>
      <div className="max-h-[86vh] w-full overflow-auto rounded-[1.7rem] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-emerald-700">个人记录</p>
            <h2 className="mt-1 text-2xl font-black text-stone-950">我的吃饭记录</h2>
            <p className="mt-1 text-xs leading-5 text-stone-500">记录明确选择、收藏和偏好，不保存账号身份。</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-lg font-black text-stone-500" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-xl font-black text-emerald-900">{history.length}</p>
            <p className="mt-1 text-[11px] font-bold text-emerald-700">最近记录</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
            <p className="text-xl font-black text-amber-900">{favorites.length}</p>
            <p className="mt-1 text-[11px] font-bold text-amber-700">收藏菜品</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
            <p className="text-xl font-black text-stone-950">{memory.avoidFoods.length}</p>
            <p className="mt-1 text-[11px] font-bold text-stone-600">不再推荐</p>
          </div>
        </div>

        <section className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-stone-950">最近吃过</h3>
            <MetricPill tone="green">最近 20 条</MetricPill>
          </div>
          {recentHistory.length ? (
            recentHistory.map((item) => {
              const food = foodMap.get(item.foodId);
              if (!food) return null;
              return (
                <button className="w-full rounded-[1.2rem] border border-stone-200 bg-white p-3 text-left shadow-sm transition active:scale-[0.99]" key={item.id} onClick={() => onOpenFood(food.id)} type="button">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-stone-950">{food.name}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {food.canteen} / {food.stall}
                      </p>
                    </div>
                    <MetricPill tone={item.action === "disliked" ? "red" : "neutral"}>{actionLabel[item.action]}</MetricPill>
                  </div>
                  <p className="mt-2 text-xs font-bold text-stone-500">
                    {sourceLabel[item.source]} · {formatRelativeTime(item.createdAt)}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-500">点“就吃这个”或在菜品详情里“记为吃过”后，这里会出现记录。</div>
          )}
        </section>

        <section className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-stone-950">收藏菜品</h3>
            <MetricPill tone="amber">{favorites.length} 个</MetricPill>
          </div>
          {favoriteFoods.length ? (
            favoriteFoods.map((food) => (
              <div className="rounded-[1.2rem] border border-stone-200 bg-white p-3 shadow-sm" key={food.id}>
                <button className="w-full text-left" onClick={() => onOpenFood(food.id)} type="button">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-stone-950">{food.name}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {food.canteen} / {food.stall}
                      </p>
                    </div>
                    <MetricPill tone="red">¥{food.price}</MetricPill>
                  </div>
                </button>
                <button className="mt-3 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-black text-stone-600" onClick={() => onToggleFavorite(food.id)} type="button">
                  取消收藏
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-500">打开菜品详情后可以收藏。</div>
          )}
        </section>

        <section className="mt-5">
          <MemorySummary memory={memory} onRemove={onMemoryRemove} onClear={onMemoryClear} />
          <div className="mt-3 flex flex-wrap gap-2">
            {memory.recentFoods.slice(0, 5).map((foodId) => {
              const food = foodMap.get(foodId);
              if (!food) return null;
              return (
                <Chip key={foodId} onClick={() => onOpenFood(foodId)}>
                  最近：{food.name}
                </Chip>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
