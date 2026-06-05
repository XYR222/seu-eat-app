"use client";

import { AiRecommendTab } from "@/components/ai/AiRecommendTab";
import { BottomTabs } from "@/components/BottomTabs";
import { DrawMealTab } from "@/components/draw/DrawMealTab";
import { ExploreTab } from "@/components/explore/ExploreTab";
import { feedbackItems as initialFeedback } from "@/data/feedback";
import { foodItems } from "@/data/foods";
import { defaultMemory, mergeMemoryPatch, readMemory, removeMemoryValue, writeMemory } from "@/lib/memory";
import type { Food, FoodFeedback, UserMemory } from "@/types";
import { useMemo, useState } from "react";

export type TabId = "ai" | "explore" | "draw";
type FoodWithFeedback = Food & { feedback: FoodFeedback };

function mergeFoodFeedback(feedback: FoodFeedback[]): FoodWithFeedback[] {
  return foodItems.map((food) => ({
    ...food,
    feedback: feedback.find((item) => item.foodId === food.id) ?? { foodId: food.id, likes: 0, dislikes: 0, tagVotes: {}, comments: [] },
  }));
}

export function AppShell() {
  const [tab, setTab] = useState<TabId>("ai");
  const [feedback, setFeedback] = useState<FoodFeedback[]>(initialFeedback);
  const [memory, setMemory] = useState<UserMemory>(() => readMemory());
  const foods = useMemo(() => mergeFoodFeedback(feedback), [feedback]);

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
    <main className="min-h-screen bg-[#f7f8f5] text-stone-900">
      <div className="mx-auto min-h-screen max-w-md px-4 py-5">
        {tab === "ai" && <AiRecommendTab foods={foods} memory={memory} onMemoryPatch={updateMemory} onMemoryRemove={removeMemory} onMemoryClear={clearMemory} />}
        {tab === "explore" && <ExploreTab foods={foods} feedback={feedback} setFeedback={setFeedback} onMemoryPatch={updateMemory} />}
        {tab === "draw" && <DrawMealTab foods={foods} feedback={feedback} memory={memory} onMemoryPatch={updateMemory} />}
      </div>
      <BottomTabs tab={tab} setTab={setTab} />
    </main>
  );
}
