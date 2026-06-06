import { scopedStorageKey } from "@/lib/storage-scope";

export const DEVICE_ID_STORAGE_KEY = "seu-eat-device-id";

export function readDeviceId(scope?: string) {
  if (typeof window === "undefined") return "";
  const key = scopedStorageKey(DEVICE_ID_STORAGE_KEY, scope);
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, next);
  return next;
}
