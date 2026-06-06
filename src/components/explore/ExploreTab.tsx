import { FoodDetailSheet } from "@/components/food/FoodDetailSheet";
import { StallDetailSheet } from "@/components/food/StallDetailSheet";
import { Chip } from "@/components/ui/Chip";
import { MetricPill } from "@/components/ui/MetricPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { stallImages } from "@/data/stall-images";
import { getCanteenSummaries, getFoodsForStall, getStallsForCanteen, withStallImages } from "@/lib/canteen-navigation";
import { buildCommunityBuzz } from "@/lib/community";
import { buildStallKey } from "@/lib/feedback-store";
import { applyFoodDetailFeedback, applyStallDetailFeedback } from "@/lib/food-detail";
import { isFavoriteFood } from "@/lib/my-store";
import type { FeedbackEventRequest } from "@/lib/shared-feedback";
import type { FavoriteFood, Food, FoodFeedback, StallFeedback, UserMemory } from "@/types";
import { useState } from "react";

type FoodWithFeedback = Food & { feedback: FoodFeedback };

const filterTags = ["清淡", "不辣", "高蛋白", "热汤", "面食", "米饭", "性价比高"];
const foodListPageSize = 12;

function getCanteenIllustration(canteen: string) {
  if (canteen.includes("桃园")) {
    return {
      src: "/canteen-illustrations/taoyuan-peach.png",
      className: "-bottom-2 right-3 h-24 w-24 opacity-95",
    };
  }
  if (canteen.includes("橘园")) {
    return {
      src: "/canteen-illustrations/juyuan-orange.png",
      className: "-bottom-3 -right-1 h-[6.5rem] w-[6.5rem] opacity-95",
    };
  }
  return {
    src: "/pipi/pipi-explore-hero.png",
    className: "-bottom-5 -right-5 h-32 w-32 opacity-95",
  };
}

function FoodListCard({ food, onClick }: { food: FoodWithFeedback; onClick: () => void }) {
  return (
    <button className="dn-card w-full p-4 text-left transition active:scale-[0.99]" type="button" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black leading-tight text-[#2a2a1a]">{food.name}</h3>
          <p className="dn-muted mt-1 text-xs">
            {food.canteen} / {food.stall}
          </p>
        </div>
        <MetricPill tone="red">¥{food.price}</MetricPill>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <MetricPill tone="green">赞 {food.feedback.likes}</MetricPill>
        <MetricPill tone="neutral">踩 {food.feedback.dislikes}</MetricPill>
        {food.tags.slice(0, 3).map((tag) => (
          <MetricPill key={tag}>{tag}</MetricPill>
        ))}
      </div>
    </button>
  );
}

export function ExploreTab({
  foods,
  feedback,
  stallFeedback,
  setFeedback,
  setStallFeedback,
  onMemoryPatch,
  favorites,
  onToggleFavorite,
  onMealSelected,
  onSharedFeedback,
  initialQuery = "",
}: {
  foods: FoodWithFeedback[];
  feedback: FoodFeedback[];
  stallFeedback: StallFeedback[];
  setFeedback: (items: FoodFeedback[]) => void;
  setStallFeedback: (items: StallFeedback[]) => void;
  onMemoryPatch: (patch: Partial<UserMemory>) => void;
  favorites: FavoriteFood[];
  onToggleFavorite: (foodId: string) => void;
  onMealSelected: (foodId: string) => void;
  onSharedFeedback: (event: Omit<FeedbackEventRequest, "deviceId">) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [selectedStallKey, setSelectedStallKey] = useState<string | null>(null);
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);
  const [selectedBrowseStall, setSelectedBrowseStall] = useState<string | null>(null);
  const [foodPage, setFoodPage] = useState(1);

  const filtered = foods.filter((food) => {
    const text = [food.name, food.canteen, food.stall, food.description, ...food.tags].join(" ");
    return (!query || text.includes(query)) && (!activeTag || food.tags.includes(activeTag));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / foodListPageSize));
  const currentPage = Math.min(foodPage, totalPages);
  const pagedFoods = filtered.slice((currentPage - 1) * foodListPageSize, currentPage * foodListPageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const popular = [...foods].sort((a, b) => b.feedback.likes - b.feedback.dislikes - (a.feedback.likes - a.feedback.dislikes)).slice(0, 5);
  const communityBuzz = buildCommunityBuzz(foods, 8);
  const canteens = getCanteenSummaries(foods);
  const canteenStalls = selectedCanteen ? withStallImages(getStallsForCanteen(foods, selectedCanteen), stallImages) : [];
  const stallFoods = selectedCanteen && selectedBrowseStall ? getFoodsForStall(foods, selectedCanteen, selectedBrowseStall) : [];
  const selected = selectedFoodId ? foods.find((food) => food.id === selectedFoodId) ?? null : null;
  const selectedStall = selectedStallKey ? stallFeedback.find((item) => item.stallKey === selectedStallKey) : undefined;
  const browseStallFeedback = selectedCanteen && selectedBrowseStall ? stallFeedback.find((item) => item.stallKey === buildStallKey(selectedCanteen, selectedBrowseStall)) : undefined;
  const browseStallImage = selectedCanteen && selectedBrowseStall ? stallImages[buildStallKey(selectedCanteen, selectedBrowseStall)] : undefined;

  const submitFeedback = (foodId: string, type: "like" | "dislike" | "tag" | "comment", value?: string) => {
    const result = applyFoodDetailFeedback(feedback, type === "tag" ? { type, foodId, tag: value ?? "出餐快" } : type === "comment" ? { type, foodId, comment: value ?? "" } : { type, foodId });
    setFeedback(result.feedback);
    onMemoryPatch(result.memoryPatch);
    onSharedFeedback({ scope: "food", eventType: type, foodId, tag: type === "tag" ? value : undefined, comment: type === "comment" ? value : undefined });
  };

  const submitStallFeedback = (stallKey: string, type: "like" | "dislike" | "comment", comment?: string) => {
    setStallFeedback(applyStallDetailFeedback(stallFeedback, type === "comment" ? { type, stallKey, comment: comment ?? "" } : { type, stallKey }));
    onSharedFeedback({ scope: "stall", eventType: type, stallKey, comment: type === "comment" ? comment : undefined });
  };

  const resetCanteenBrowse = () => {
    setSelectedCanteen(null);
    setSelectedBrowseStall(null);
  };

  return (
    <div className="space-y-4 pb-3">
      <header className="dn-hero-card">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="max-w-[68%]">
            <p className="dn-eyebrow text-orange-600">校园轻量点评</p>
            <h1 className="dn-card-title mt-1">逛食堂</h1>
          </div>
          <MetricPill tone="amber">{filtered.length} 个结果</MetricPill>
        </div>
        <p className="dn-muted relative z-10 mt-3 max-w-[70%] text-sm leading-6">搜索菜品、食堂和窗口，也可以直接点进食堂，再按窗口浏览菜品。</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pipi/pipi-explore-hero.png" alt="" className="dn-pipi-shadow absolute -bottom-1 right-1 h-32 w-32 object-contain object-bottom" />
      </header>

      <section className="space-y-3">
        <div className="dn-card flex flex-wrap items-center gap-2 px-3 py-2 text-xs font-black text-[#4c4c35]">
          <button className={selectedCanteen ? "text-[#526100]" : "text-[#2a2a1a]"} onClick={resetCanteenBrowse} type="button">
            全部食堂
          </button>
          {selectedCanteen && (
            <>
              <span className="text-stone-300">&gt;</span>
              <button
                className={selectedBrowseStall ? "text-[#526100]" : "text-[#2a2a1a]"}
                onClick={() => {
                  setSelectedBrowseStall(null);
                }}
                type="button"
              >
                {selectedCanteen}
              </button>
            </>
          )}
          {selectedBrowseStall && (
            <>
              <span className="text-stone-300">&gt;</span>
              <span className="text-[#2a2a1a]">{selectedBrowseStall}</span>
            </>
          )}
        </div>
        <SectionHeader
          title={selectedCanteen ? selectedCanteen : "按食堂逛"}
          subtitle={selectedBrowseStall ? `${selectedBrowseStall} / ${stallFoods.length} 个菜品` : selectedCanteen ? `${canteenStalls.length} 个窗口，继续选择窗口看菜品` : "不想搜索时，直接从食堂入口进入。"}
          action={
            selectedCanteen ? (
              <Chip
                onClick={resetCanteenBrowse}
              >
                全部食堂
              </Chip>
            ) : (
              <MetricPill tone="green">{canteens.length} 个食堂</MetricPill>
            )
          }
        />

        {!selectedCanteen && (
          <div className="grid grid-cols-2 gap-3">
            {canteens.map((item, index) => {
              const illustration = getCanteenIllustration(item.canteen);
              return (
                <button key={item.canteen} className="dn-card relative min-h-36 overflow-hidden p-4 text-left transition active:scale-[0.99]" type="button" onClick={() => setSelectedCanteen(item.canteen)}>
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-[#dcff3e]/36 text-lg font-black text-[#526100]">{index + 1}</span>
                    <MetricPill tone="amber">{item.foodCount} 菜</MetricPill>
                  </div>
                  <div className="relative z-10 mt-7 max-w-[72%]">
                    <h3 className="line-clamp-1 text-lg font-black leading-tight text-[#2a2a1a]">{item.canteen}</h3>
                    <p className="mt-2 inline-flex rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-black text-[#526100]">食堂入口</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={illustration.src} alt="" className={`dn-pipi-shadow absolute object-contain object-bottom ${illustration.className}`} />
                </button>
              );
            })}
          </div>
        )}

        {selectedCanteen && !selectedBrowseStall && (
          <div className="space-y-2">
            {canteenStalls.map((item) => (
              <button key={item.stall} className="dn-card w-full overflow-hidden text-left transition active:scale-[0.99]" type="button" onClick={() => setSelectedBrowseStall(item.stall)}>
                <div className="flex gap-3 p-3">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl border border-stone-100 bg-gradient-to-br from-emerald-50 to-amber-50">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={`${item.stall}店面图`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[11px] font-black text-emerald-800">{item.stall}</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-[#2a2a1a]">{item.stall}</h3>
                    <p className="dn-muted mt-1 text-xs">{item.canteen}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span className="rounded-full bg-[#f4f4ea] px-2 py-1 text-[10px] font-bold text-[#4c4c35]" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedCanteen && selectedBrowseStall && (
          <div className="space-y-3">
            <div className="dn-card overflow-hidden">
              <div className="aspect-[16/9] bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-50">
                {browseStallImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={browseStallImage} alt={`${selectedBrowseStall}店面图`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center">
                    <div>
                      <p className="text-xs font-black text-emerald-700">{selectedCanteen}</p>
                      <p className="mt-2 text-xl font-black text-stone-950">{selectedBrowseStall}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="dn-eyebrow">{selectedCanteen}</p>
                <h3 className="mt-1 text-lg font-black text-[#2a2a1a]">{selectedBrowseStall}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-[#b9dc00]/40 bg-[#dcff3e]/18 p-3">
              <button className="text-xs font-black text-[#526100]" type="button" onClick={() => setSelectedBrowseStall(null)}>
                返回窗口列表
              </button>
              {browseStallFeedback && (
                <button className="rounded-full bg-[#4c4c35] px-3 py-1.5 text-xs font-black text-white" type="button" onClick={() => setSelectedStallKey(browseStallFeedback.stallKey)}>
                  查看窗口口碑
                </button>
              )}
            </div>
            {stallFoods.map((food) => (
              <FoodListCard key={food.id} food={food} onClick={() => setSelectedFoodId(food.id)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="热门 Top 5" subtitle="来自点赞、踩和高频反馈。" action={<MetricPill tone="green">同学反馈</MetricPill>} />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {popular.map((food, index) => (
            <button key={food.id} className="dn-card mt-3 min-w-48 p-3 text-left transition active:scale-[0.99]" onClick={() => setSelectedFoodId(food.id)} type="button">
              <div className="flex items-center justify-between">
                <MetricPill tone={index === 0 ? "amber" : "neutral"}>#{index + 1}</MetricPill>
                <span className="text-sm font-black text-red-600">¥{food.price}</span>
              </div>
              <p className="mt-2 line-clamp-1 font-black text-stone-950">{food.name}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {food.canteen} / 赞 {food.feedback.likes} 踩 {food.feedback.dislikes}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="同学正在说" subtitle="短评会同步进校园口碑，AI 推荐也会参考这些反馈。" action={<MetricPill tone="amber">实时口碑</MetricPill>} />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {communityBuzz.map((item) => (
            <button className="dn-card min-w-64 p-3 text-left transition active:scale-[0.99]" key={item.id} onClick={() => setSelectedFoodId(item.foodId)} type="button">
              <div className="flex items-center justify-between gap-3">
                <MetricPill tone="green">{item.actor}</MetricPill>
                <span className="text-[11px] font-black text-stone-400">刚刚</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-black leading-6 text-[#2a2a1a]">{item.text}</p>
              <p className="dn-muted mt-2 line-clamp-1 text-xs font-bold">{item.meta}</p>
            </button>
          ))}
        </div>
      </section>

      <label className="flex items-center gap-2 rounded-full border border-[#4c4c35]/14 bg-white/92 px-4 py-3 shadow-sm focus-within:border-[#b9dc00] focus-within:ring-4 focus-within:ring-[#dcff3e]/30">
        <span className="text-stone-400">⌕</span>
        <input
          className="w-full bg-transparent text-sm font-semibold text-[#2a2a1a] outline-none placeholder:text-stone-400"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setFoodPage(1);
          }}
          placeholder="搜索菜品 / 食堂 / 窗口 / 标签"
        />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip
          tone={!activeTag ? "green" : "neutral"}
          onClick={() => {
            setActiveTag("");
            setFoodPage(1);
          }}
        >
          全部
        </Chip>
        {filterTags.map((tag) => (
          <Chip
            key={tag}
            tone={activeTag === tag ? "green" : "neutral"}
            onClick={() => {
              setActiveTag(tag);
              setFoodPage(1);
            }}
          >
            {tag}
          </Chip>
        ))}
      </div>

      <section className="space-y-3">
        <SectionHeader
          title="菜品列表"
          subtitle={query || activeTag ? `已筛出 ${filtered.length} 个结果，第 ${currentPage}/${totalPages} 页。` : `共 ${filtered.length} 个菜品，第 ${currentPage}/${totalPages} 页。`}
          action={<MetricPill tone="neutral">每页 {foodListPageSize} 个</MetricPill>}
        />
        {pagedFoods.map((food) => (
          <FoodListCard key={food.id} food={food} onClick={() => setSelectedFoodId(food.id)} />
        ))}
        {filtered.length === 0 && <div className="dn-card border-dashed p-5 text-center text-sm leading-6 text-stone-500">没有找到匹配菜品，试试换个关键词或标签。</div>}
        {totalPages > 1 && (
          <div className="dn-card flex flex-col gap-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <button className="dn-secondary-button px-4 py-2 text-xs font-black disabled:opacity-40" disabled={currentPage === 1} onClick={() => setFoodPage((page) => Math.max(1, page - 1))} type="button">
                上一页
              </button>
              <span className="text-xs font-black text-[#4c4c35]">
                {currentPage} / {totalPages}
              </span>
              <button className="dn-secondary-button px-4 py-2 text-xs font-black disabled:opacity-40" disabled={currentPage === totalPages} onClick={() => setFoodPage((page) => Math.min(totalPages, page + 1))} type="button">
                下一页
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pageNumbers.map((page) => (
                <button
                  className={[
                    "flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs font-black transition active:scale-[0.98]",
                    currentPage === page ? "border-[#b9dc00] bg-[#dcff3e] text-[#526100]" : "border-[#4c4c35]/14 bg-white text-[#4c4c35]",
                  ].join(" ")}
                  key={page}
                  onClick={() => setFoodPage(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {selected && (
        <FoodDetailSheet
          food={selected}
          favorite={isFavoriteFood(favorites, selected.id)}
          onClose={() => setSelectedFoodId(null)}
          onFeedback={submitFeedback}
          onOpenStall={() => setSelectedStallKey(buildStallKey(selected.canteen, selected.stall))}
          onToggleFavorite={onToggleFavorite}
          onMarkAte={(foodId) => {
            onMemoryPatch({ recentFoods: [foodId] });
            onMealSelected(foodId);
          }}
        />
      )}
      {selectedStall && <StallDetailSheet stall={selectedStall} foods={foods} foodFeedback={feedback} onClose={() => setSelectedStallKey(null)} onFeedback={submitStallFeedback} />}
    </div>
  );
}
