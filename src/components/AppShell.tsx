"use client";

import { AiRecommendTab } from "@/components/ai/AiRecommendTab";
import { BottomTabs } from "@/components/BottomTabs";
import { DrawMealTab } from "@/components/draw/DrawMealTab";
import { ExploreTab } from "@/components/explore/ExploreTab";
import { feedbackItems as initialFeedback } from "@/data/feedback";
import { foodItems } from "@/data/foods";
import { createInitialStallFeedback, mergeFoodFeedback, mergeStallFeedback, readStoredFoodFeedback, readStoredStallFeedback, writeStoredFoodFeedback, writeStoredStallFeedback } from "@/lib/feedback-store";
import { defaultMemory, mergeMemoryPatch, readMemory, removeMemoryValue, writeMemory } from "@/lib/memory";
import type { Food, FoodFeedback, StallFeedback, UserMemory } from "@/types";
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
  const foods = useMemo(() => attachFoodFeedback(feedback), [feedback]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMemory(readMemory());
      setFeedback(mergeFoodFeedback(initialFeedback, readStoredFoodFeedback()));
      setStallFeedback(mergeStallFeedback(createInitialStallFeedback(foodItems), readStoredStallFeedback()));
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
      <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-5">
        {tab === "ai" && <AiRecommendTab foods={foods} feedback={feedback} stallFeedback={stallFeedback} memory={memory} onMemoryPatch={updateMemory} onMemoryRemove={removeMemory} onMemoryClear={clearMemory} />}
        {tab === "explore" && <ExploreTab foods={foods} feedback={feedback} stallFeedback={stallFeedback} setFeedback={updateFeedback} setStallFeedback={updateStallFeedback} onMemoryPatch={updateMemory} />}
        {tab === "draw" && <DrawMealTab foods={foods} feedback={feedback} stallFeedback={stallFeedback} setFeedback={updateFeedback} setStallFeedback={updateStallFeedback} memory={memory} onMemoryPatch={updateMemory} />}
      </div>
      <BottomTabs tab={tab} setTab={setTab} />
    </main>
  );
}
