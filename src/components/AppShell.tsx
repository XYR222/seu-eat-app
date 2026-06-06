"use client";

import { AiRecommendTab } from "@/components/ai/AiRecommendTab";
import { ActivitySheet } from "@/components/activity/ActivitySheet";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BottomTabs } from "@/components/BottomTabs";
import { DrawMealTab } from "@/components/draw/DrawMealTab";
import { ExploreTab } from "@/components/explore/ExploreTab";
import { FoodDetailSheet } from "@/components/food/FoodDetailSheet";
import { StallDetailSheet } from "@/components/food/StallDetailSheet";
import { MyRecordsSheet } from "@/components/my/MyRecordsSheet";
import { OnboardingSheet } from "@/components/onboarding/OnboardingSheet";
import { feedbackItems as initialFeedback } from "@/data/feedback";
import { canteenActivities } from "@/data/canteen-activities";
import { foodItems } from "@/data/foods";
import { createInitialStallFeedback, mergeFoodFeedback, mergeStallFeedback, readStoredFoodFeedback, readStoredStallFeedback, writeStoredFoodFeedback, writeStoredStallFeedback } from "@/lib/feedback-store";
import { buildStallKey } from "@/lib/feedback-store";
import { applyFoodDetailFeedback, applyStallDetailFeedback } from "@/lib/food-detail";
import { defaultMemory, mergeMemoryPatch, readMemory, removeMemoryValue, writeMemory } from "@/lib/memory";
import { addMealHistoryItem, isFavoriteFood, readFavoriteFoods, readMealHistory, toggleFavoriteFood, writeFavoriteFoods, writeMealHistory } from "@/lib/my-store";
import { readDeviceId } from "@/lib/device-id";
import { getUnreadActivityIds, readSeenActivityIds, writeSeenActivityIds } from "@/lib/activity-store";
import { onboardingProfileToMemoryPatch, readOnboardingProfile, writeOnboardingProfile, type OnboardingProfile } from "@/lib/onboarding-store";
import { fetchSharedFeedbackSnapshot, postSharedFeedbackEvent } from "@/lib/shared-feedback-client";
import type { FeedbackEventRequest } from "@/lib/shared-feedback";
import type { CanteenActivity, FavoriteFood, Food, FoodFeedback, MealHistoryItem, StallFeedback, UserMemory } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export type TabId = "ai" | "explore" | "draw";
type FoodWithFeedback = Food & { feedback: FoodFeedback };
type AppShellProps = {
  guestId?: string;
  userEmail?: string | null;
};

function attachFoodFeedback(feedback: FoodFeedback[]): FoodWithFeedback[] {
  return foodItems.map((food) => ({
    ...food,
    feedback: feedback.find((item) => item.foodId === food.id) ?? { foodId: food.id, likes: 0, dislikes: 0, tagVotes: {}, comments: [] },
  }));
}

export function AppShell({ guestId = "default", userEmail }: AppShellProps) {
  const [tab, setTab] = useState<TabId>("ai");
  const [feedback, setFeedback] = useState<FoodFeedback[]>(initialFeedback);
  const [stallFeedback, setStallFeedback] = useState<StallFeedback[]>(() => createInitialStallFeedback(foodItems));
  const [memory, setMemory] = useState<UserMemory>(() => defaultMemory());
  const [history, setHistory] = useState<MealHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [myOpen, setMyOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [seenActivityIds, setSeenActivityIds] = useState<string[]>([]);
  const [exploreQuery, setExploreQuery] = useState("");
  const [selectedMyFoodId, setSelectedMyFoodId] = useState<string | null>(null);
  const [selectedMyStallKey, setSelectedMyStallKey] = useState<string | null>(null);
  const foods = useMemo(() => attachFoodFeedback(feedback), [feedback]);
  const selectedMyFood = selectedMyFoodId ? foods.find((food) => food.id === selectedMyFoodId) ?? null : null;
  const selectedMyStall = selectedMyStallKey ? stallFeedback.find((item) => item.stallKey === selectedMyStallKey) : undefined;
  const unreadActivityIds = useMemo(() => getUnreadActivityIds(canteenActivities.map((activity) => activity.id), seenActivityIds), [seenActivityIds]);

  const refreshSharedFeedback = useCallback((localFoodFeedback: FoodFeedback[], localStallFeedback: StallFeedback[]) => {
    void fetchSharedFeedbackSnapshot().then((snapshot) => {
      setFeedback(mergeFoodFeedback(mergeFoodFeedback(initialFeedback, snapshot.foodFeedback), localFoodFeedback));
      setStallFeedback(mergeStallFeedback(mergeStallFeedback(createInitialStallFeedback(foodItems), snapshot.stallFeedback), localStallFeedback));
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextDeviceId = readDeviceId(guestId);
      setMemory(readMemory(guestId));
      setDeviceId(nextDeviceId);
      const localFoodFeedback = readStoredFoodFeedback(guestId);
      const localStallFeedback = readStoredStallFeedback(guestId);
      setFeedback(mergeFoodFeedback(initialFeedback, localFoodFeedback));
      setStallFeedback(mergeStallFeedback(createInitialStallFeedback(foodItems), localStallFeedback));
      setHistory(readMealHistory(guestId));
      setFavorites(readFavoriteFoods(guestId));
      setSeenActivityIds(readSeenActivityIds(guestId));
      setOnboardingOpen(!readOnboardingProfile(guestId));
      refreshSharedFeedback(localFoodFeedback, localStallFeedback);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [guestId, refreshSharedFeedback]);

  const updateFeedback = (items: FoodFeedback[]) => {
    setFeedback(items);
    writeStoredFoodFeedback(items, guestId);
  };

  const updateStallFeedback = (items: StallFeedback[]) => {
    setStallFeedback(items);
    writeStoredStallFeedback(items, guestId);
  };

  const updateMemory = (patch: Partial<UserMemory>) => {
    setMemory((current) => {
      const next = mergeMemoryPatch(current, patch);
      writeMemory(next, guestId);
      return next;
    });
  };

  const syncSharedFeedback = (event: Omit<FeedbackEventRequest, "deviceId">) => {
    const id = deviceId || readDeviceId(guestId);
    if (!deviceId) setDeviceId(id);
    void postSharedFeedbackEvent({ ...event, deviceId: id }).then((ok) => {
      if (ok) refreshSharedFeedback(readStoredFoodFeedback(guestId), readStoredStallFeedback(guestId));
    });
  };

  const addHistory = (foodId: string, source: MealHistoryItem["source"], action: MealHistoryItem["action"] = "ate") => {
    setHistory((current) => {
      const next = addMealHistoryItem(current, { foodId, source, action });
      writeMealHistory(next, guestId);
      return next;
    });
  };

  const toggleFavorite = (foodId: string) => {
    setFavorites((current) => {
      const next = toggleFavoriteFood(current, foodId);
      writeFavoriteFoods(next, guestId);
      return next;
    });
  };

  const submitMyFeedback = (foodId: string, type: "like" | "dislike" | "tag" | "comment", value?: string) => {
    const result = applyFoodDetailFeedback(feedback, type === "tag" ? { type, foodId, tag: value ?? "\u51fa\u9910\u5feb" } : type === "comment" ? { type, foodId, comment: value ?? "" } : { type, foodId });
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
      writeMemory(next, guestId);
      return next;
    });
  };

  const clearMemory = () => {
    const next = defaultMemory();
    setMemory(next);
    writeMemory(next, guestId);
  };

  const openActivities = () => {
    setActivityOpen(true);
    const ids = canteenActivities.map((activity) => activity.id);
    setSeenActivityIds(ids);
    writeSeenActivityIds(ids, guestId);
  };

  const exploreActivity = (activity: CanteenActivity) => {
    setExploreQuery(activity.stall ? `${activity.canteen} ${activity.stall}` : activity.canteen);
    setTab("explore");
    setActivityOpen(false);
  };

  const finishOnboarding = (profile: OnboardingProfile) => {
    writeOnboardingProfile(profile, guestId);
    setOnboardingOpen(false);
    if (!profile.skipped) updateMemory(onboardingProfileToMemoryPatch(profile));
  };

  return (
    <main className="dn-app min-h-screen text-stone-900">
      <div className="fixed left-3 top-3 z-20 flex max-w-[48vw] items-center gap-2 sm:left-[calc(50%-212px)]">
        {userEmail && <span className="dn-top-pill dn-top-pill--primary max-w-28 truncate px-3 py-2 text-xs font-black">{userEmail}</span>}
        <SignOutButton />
      </div>
      <div className="fixed right-3 top-3 z-20 flex max-w-[48vw] items-center justify-end gap-2 sm:right-[calc(50%-212px)]">
        <button className="dn-top-pill dn-top-pill--warm relative px-4 py-2 text-xs font-black active:scale-[0.98]" onClick={openActivities} type="button">
          &#27963;&#21160;
          {unreadActivityIds.length > 0 && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
        </button>
        <button className="dn-top-pill px-4 py-2 text-xs font-black active:scale-[0.98]" onClick={() => setMyOpen(true)} type="button">
          &#25105;&#30340;
        </button>
      </div>
      <div className="mx-auto min-h-screen max-w-[430px] px-4 pb-28 pt-[4.5rem]">
        {tab === "ai" && <AiRecommendTab foods={foods} feedback={feedback} stallFeedback={stallFeedback} setFeedback={updateFeedback} setStallFeedback={updateStallFeedback} memory={memory} onMemoryPatch={updateMemory} onMemoryRemove={removeMemory} onMemoryClear={clearMemory} onMealSelected={(foodId) => addHistory(foodId, "ai", "ate")} favorites={favorites} onToggleFavorite={toggleFavorite} onSharedFeedback={syncSharedFeedback} />}
        {tab === "explore" && <ExploreTab key={exploreQuery || "explore"} foods={foods} feedback={feedback} stallFeedback={stallFeedback} setFeedback={updateFeedback} setStallFeedback={updateStallFeedback} onMemoryPatch={updateMemory} favorites={favorites} onToggleFavorite={toggleFavorite} onMealSelected={(foodId) => addHistory(foodId, "explore", "ate")} onSharedFeedback={syncSharedFeedback} initialQuery={exploreQuery} />}
        {tab === "draw" && <DrawMealTab foods={foods} feedback={feedback} stallFeedback={stallFeedback} setFeedback={updateFeedback} setStallFeedback={updateStallFeedback} memory={memory} onMemoryPatch={updateMemory} onMealSelected={(foodId) => addHistory(foodId, "draw", "ate")} favorites={favorites} onToggleFavorite={toggleFavorite} onSharedFeedback={syncSharedFeedback} />}
      </div>
      <BottomTabs tab={tab} setTab={setTab} />
      {onboardingOpen && <OnboardingSheet onComplete={finishOnboarding} onSkip={finishOnboarding} />}
      {activityOpen && <ActivitySheet activities={canteenActivities} onClose={() => setActivityOpen(false)} onExplore={exploreActivity} />}
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
