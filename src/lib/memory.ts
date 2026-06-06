import type { UserMemory } from "@/types";
import { scopedStorageKey } from "@/lib/storage-scope";

export const MEMORY_STORAGE_KEY = "seu-eat-memory";

export const defaultMemory = (): UserMemory => ({
  preferTags: [],
  avoidTags: [],
  recentFoods: [],
  avoidFoods: [],
  preferredCanteens: [],
  sessionContext: [],
  updatedAt: new Date().toISOString(),
});

const unique = (values: string[] = []) => Array.from(new Set(values.filter(Boolean)));

export function mergeMemoryPatch(base: UserMemory, patch: Partial<UserMemory>): UserMemory {
  return {
    budgetMax: patch.budgetMax ?? base.budgetMax,
    preferTags: unique([...(base.preferTags ?? []), ...(patch.preferTags ?? [])]),
    avoidTags: unique([...(base.avoidTags ?? []), ...(patch.avoidTags ?? [])]),
    recentFoods: unique([...(patch.recentFoods ?? []), ...(base.recentFoods ?? [])]).slice(0, 5),
    avoidFoods: unique([...(base.avoidFoods ?? []), ...(patch.avoidFoods ?? [])]),
    preferredCanteens: unique([...(base.preferredCanteens ?? []), ...(patch.preferredCanteens ?? [])]),
    sessionContext: unique([...(base.sessionContext ?? []), ...(patch.sessionContext ?? [])]).slice(-6),
    updatedAt: new Date().toISOString(),
  };
}

export function removeMemoryValue(memory: UserMemory, field: keyof UserMemory, value: string): UserMemory {
  const current = memory[field];
  if (!Array.isArray(current)) return memory;
  return {
    ...memory,
    [field]: current.filter((item) => item !== value),
    updatedAt: new Date().toISOString(),
  };
}

export function readMemory(scope?: string): UserMemory {
  if (typeof window === "undefined") return defaultMemory();
  const key = scopedStorageKey(MEMORY_STORAGE_KEY, scope);
  const raw = window.localStorage.getItem(key) ?? window.localStorage.getItem(MEMORY_STORAGE_KEY);
  if (!raw) return defaultMemory();
  try {
    return { ...defaultMemory(), ...JSON.parse(raw) };
  } catch {
    return defaultMemory();
  }
}

export function writeMemory(memory: UserMemory, scope?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedStorageKey(MEMORY_STORAGE_KEY, scope), JSON.stringify(memory));
}
