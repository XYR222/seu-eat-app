"use client";

import { AiRecommendTab } from "@/components/ai/AiRecommendTab";
import { BottomTabs } from "@/components/BottomTabs";
import { DrawMealTab } from "@/components/draw/DrawMealTab";
import { ExploreTab } from "@/components/explore/ExploreTab";
import { FoodDetailSheet } from "@/components/food/FoodDetailSheet";
import { StallDetailSheet } from "@/components/food/StallDetailSheet";
import { MyRecordsSheet } from "@/components/my/MyRecordsSheet";
import { feedbackItems as initialFeedback } from "@/data/feedback";
import { foodItems } from "@/data/foods";
import { createInitialStallFeedback, mergeFoodFeedback, mergeStallFeedback, readStoredFoodFeedback, readStoredStallFeedback, writeStoredFoodFeedback, writeStoredStallFeedback } from "@/lib/feedback-store";
import { buildStallKey } from "@/lib/feedback-store";
import { applyFoodDetailFeedback, applyStallDetailFeedback } from "@/lib/food-detail";
import { defaultMemory, mergeMemoryPatch, readMemory, removeMemoryValue, writeMemory } from "@/lib/memory";
import { addMealHistoryItem, isFavoriteFood, readFavoriteFoods, readMealHistory, toggleFavoriteFood, writeFavoriteFoods, writeMealHistory } from "@/lib/my-store";
import { readDeviceId } from "@/lib/device-id";
import { fetchSharedFeedbackSnapshot, postSharedFeedbackEvent } from "@/lib/shared-feedback-client";
import type { FeedbackEventRequest } from "@/lib/shared-feedback";
import type { FavoriteFood, Food, FoodFeedback, MealHistoryItem, StallFeedback, UserMemory } from "@/types";
import { useEffect, useMemo, useState } from "react";

export type TabId = "ai" | "explore" | "draw";
type FoodWithFeedback = Food & { feedback: FoodFeedback };

function attachFoodFeedback(feedback: FoodFeedback[]): FoodWithFeedback[] {
  return foodItems.map((food) => ({
    ...food,
    feedback: feedback.find((item) => item.foodId === food.id) ?? { foodId: food.id, likes: 0, dislikes: 0, tagVotes: {}, comments: [] },
  }));
}

export function AppShell() {
  const [tab, setTab] = useState<TabId>("ai");
  const [feedback, setFeedback] = useState<FoodFeedback[]>(initialFeedback);
  const [stallFeedback, setStallFeedback] = useState<StallFeedback[]>(() => createInitialStallFeedback(foodItems));
  const [memory, setMemory] = useState<UserMemory>(() => defaultMemory());
  const [history, setHistory] = useState<MealHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [myOpen, setMyOpen] = useState(false);
  const [selectedMyFoodId, setSelectedMyFoodId] = useState<string | null>(null);
  const [selectedMyStallKey, setSelectedMyStallKey] = useState<string | null>(null);
  const foods = useMemo(() => attachFoodFeedback(feedback), [feedback]);
  const selectedMyFood = selectedMyFoodId ? foods.find((food) => food.id === selectedMyFoodId) ?? null : null;
  const selectedMyStall = selectedMyStallKey ? stallFeedback.find((item) => item.stallKey === selectedMyStallKey) : undefined;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextDeviceId = readDeviceId();
      setMemory(readMemory());
      setDeviceId(nextDeviceId);
      const localFoodFeedback = readStoredFoodFeedback();
      const localStallFeedback = readStoredStallFeedback();
      setFeedback(mergeFoodFeedback(initialFeedback, localFoodFeedback));
      setStallFeedback(mergeStallFeedback(createInitialStallFeedback(foodItems), localStallFeedback));
      setHistory(readMealHistory());
      setFavorites(readFavoriteFoods());
      void fetchSharedFeedbackSnapshot().then((snapshot) => {
        setFeedback(mergeFoodFeedback(mergeFoodFeedback(initialFeedback, snapshot.foodFeedback), localFoodFeedback));
        setStallFeedback(mergeStallFeedback(mergeStallFeedback(createInitialStallFeedback(foodItems), snapshot.stallFeedback), localStallFeedback));
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const updateFeedback = (items: FoodFeedback[]) => {
    setFeedback(items);
    writeStoredFoodFeedback(items);
  };

  const updateStallFeedback = (items: StallFeedback[]) => {
    setStallFeedback(items);
    writeStoredStallFeedback(items);
  };

  const updateMemory = (patch: Partial<UserMemory>) => {
    setMemory((current) => {
      const next = mergeMemoryPatch(current, patch);
      writeMemory(next);
      return next;
    });
  };

  const syncSharedFeedback = (event: Omit<FeedbackEventRequest, "deviceId">) => {
    const id = deviceId || readDeviceId();
    if (!deviceId) setDeviceId(id);
    void postSharedFeedbackEvent({ ...event, deviceId: id });
  };

  const addHistory = (foodId: string, source: MealHistoryItem["source"], action: MealHistoryItem["action"] = "ate") => {
    setHistory((current) => {
      const next = addMealHistoryItem(current, { foodId, source, action });
      writeMealHistory(next);
      return next;
    });
  };

  const toggleFavorite = (foodId: string) => {
    setFavorites((current) => {
      const next = toggleFavoriteFood(current, foodId);
      writeFavoriteFoods(next);
      return next;
    });
  };

  const submitMyFeedback = (foodId: string, type: "like" | "dislike" | "tag" | "comment", value?: string) => {
    const result = applyFoodDetailFeedback(feedback, type === "tag" ? { type, foodId, tag: value ?? "出餐快" } : type === "comment" ? { type, foodId, comment: value ?? "" } : { type, foodId });
    updateFeedback(result.feedback);
    updateMemory(result.memoryPatch);
    syncSharedFeedback({ scope: "food", eventType: type, foodId, tag: type === "tag" ? value : undefined, comment: type === "comment" ? value : undefined });
    if (type === "dislike") addHistory(foodId, "explore", "disliked");
  };

  const submitMyStallFeedback = (stallKey: string, type: "like" | "dislike" | "comment", comment?: string) => {
    updateStallFeedback(applyStallDetailFeedback(stallFeedback, type === "comment" ? { type, stallKey, comment: comment ?? "" } : { type, stallKey }));
    syncSharedFeedback({ scope: "stall", eventType: type, stallKey, comment: type === "comment" ? comment : undefined });
  };

  const removeMemory = (field: keyof UserMemory, value: string) => {
    setMemory((current) => {
      const next = removeMemoryValue(current, field, value);
      writeMemory(next);
      return next;
    });
  };

  const clearMemory = () => {
    const next = defaultMemory();
    setMemory(next);
    writeMemory(next);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed_0,#f8f5ee_34%,#eff7ee_100%)] text-stone-900">
      <button className="fixed right-4 top-4 z-10 rounded-full border border-emerald-200 bg-white/92 px-4 py-2 text-xs font-black text-emerald-800 shadow-[0_10px_24px_rgba(41,37,30,0.12)] backdrop-blur" onClick={() => setMyOpen(true)} type="button">
        我的
      </button>
      <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-5">
        {tab === "ai" && <AiRecommendTab foods={foods} feedback={feedback} stallFeedback={stallFeedback} setFeedback={updateFeedback} setStallFeedback={updateStallFeedback} memory={memory} onMemoryPatch={updateMemory} onMemoryRemove={removeMemory} onMemoryClear={clearMemory} onMealSelected={(foodId) => addHistory(foodId, "ai", "ate")} favorites={favorites} onToggleFavorite={toggleFavorite} onSharedFeedback={syncSharedFeedback} />}
        {tab === "explore" && <ExploreTab foods={foods} feedback={feedback} stallFeedback={stallFeedback} setFeedback={updateFeedback} setStallFeedback={updateStallFeedback} onMemoryPatch={updateMemory} favorites={favorites} onToggleFavorite={toggleFavorite} onMealSelected={(foodId) => addHistory(foodId, "explore", "ate")} onSharedFeedback={syncSharedFeedback} />}
        {tab === "draw" && <DrawMealTab foods={foods} feedback={feedback} stallFeedback={stallFeedback} setFeedback={updateFeedback} setStallFeedback={updateStallFeedback} memory={memory} onMemoryPatch={updateMemory} onMealSelected={(foodId) => addHistory(foodId, "draw", "ate")} favorites={favorites} onToggleFavorite={toggleFavorite} onSharedFeedback={syncSharedFeedback} />}
      </div>
      <BottomTabs tab={tab} setTab={setTab} />
      {myOpen && <MyRecordsSheet foods={foods} history={history} favorites={favorites} memory={memory} onClose={() => setMyOpen(false)} onOpenFood={setSelectedMyFoodId} onToggleFavorite={toggleFavorite} onMemoryRemove={removeMemory} onMemoryClear={clearMemory} />}
      {selectedMyFood && (
        <FoodDetailSheet
          food={selectedMyFood}
          favorite={isFavoriteFood(favorites, selectedMyFood.id)}
          onClose={() => setSelectedMyFoodId(null)}
          onFeedback={submitMyFeedback}
          onOpenStall={() => setSelectedMyStallKey(buildStallKey(selectedMyFood.canteen, selectedMyFood.stall))}
          onToggleFavorite={toggleFavorite}
          onMarkAte={(foodId) => {
            addHistory(foodId, "explore", "ate");
            updateMemory({ recentFoods: [foodId] });
          }}
        />
      )}
      {selectedMyStall && <StallDetailSheet stall={selectedMyStall} foods={foods} foodFeedback={feedback} onClose={() => setSelectedMyStallKey(null)} onFeedback={submitMyStallFeedback} />}
    </main>
  );
}
