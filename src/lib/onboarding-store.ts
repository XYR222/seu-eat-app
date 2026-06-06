import { scopedStorageKey } from "@/lib/storage-scope";
import type { UserMemory } from "@/types";

export const ONBOARDING_STORAGE_KEY = "seu-eat-onboarding-v1";

export type OnboardingProfile = {
  budgetMax?: number;
  preferTags: string[];
  avoidTags: string[];
  classArea?: string;
  dormArea?: string;
  preferredCanteens: string[];
  skipped?: boolean;
  completedAt: string;
};

export type OnboardingDraft = {
  budgetMax?: number;
  preferTags: string[];
  avoidTags: string[];
  classArea?: string;
  dormArea?: string;
};

const areaToCanteens: Record<string, string[]> = {
  教学楼附近: ["桃园食堂", "橘园食堂"],
  图书馆附近: ["橘园食堂", "湖滨餐厅"],
  体育馆附近: ["湖滨餐厅"],
  桃园宿舍: ["桃园食堂"],
  橘园宿舍: ["橘园食堂"],
};

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

export function buildOnboardingProfile(draft: OnboardingDraft, skipped = false): OnboardingProfile {
  const preferredCanteens = unique([...(draft.classArea ? areaToCanteens[draft.classArea] ?? [] : []), ...(draft.dormArea ? areaToCanteens[draft.dormArea] ?? [] : [])]);
  return {
    budgetMax: draft.budgetMax,
    preferTags: unique(draft.preferTags),
    avoidTags: unique(draft.avoidTags),
    classArea: draft.classArea,
    dormArea: draft.dormArea,
    preferredCanteens,
    skipped,
    completedAt: new Date().toISOString(),
  };
}

export function onboardingProfileToMemoryPatch(profile: OnboardingProfile): Partial<UserMemory> {
  return {
    budgetMax: profile.budgetMax,
    preferTags: profile.preferTags,
    avoidTags: profile.avoidTags,
    preferredCanteens: profile.preferredCanteens,
    sessionContext: unique([
      profile.classArea ? `平时上课区域：${profile.classArea}` : "",
      profile.dormArea ? `住宿区域：${profile.dormArea}` : "",
      profile.skipped ? "已跳过初始偏好询问" : "已完成初始偏好询问",
    ]),
  };
}

export function readOnboardingProfile(scope?: string): OnboardingProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(scopedStorageKey(ONBOARDING_STORAGE_KEY, scope));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return null;
  }
}

export function writeOnboardingProfile(profile: OnboardingProfile, scope?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedStorageKey(ONBOARDING_STORAGE_KEY, scope), JSON.stringify(profile));
}
