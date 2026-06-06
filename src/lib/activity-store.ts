import { scopedStorageKey } from "@/lib/storage-scope";

export const ACTIVITY_SEEN_STORAGE_KEY = "seu-eat-activity-seen";

function readJsonArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function getUnreadActivityIds(activityIds: string[], seenIds: string[]) {
  const seen = new Set(seenIds);
  return activityIds.filter((id) => !seen.has(id));
}

export function readSeenActivityIds(scope?: string) {
  return readJsonArray(scopedStorageKey(ACTIVITY_SEEN_STORAGE_KEY, scope));
}

export function writeSeenActivityIds(ids: string[], scope?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedStorageKey(ACTIVITY_SEEN_STORAGE_KEY, scope), JSON.stringify(Array.from(new Set(ids))));
}
