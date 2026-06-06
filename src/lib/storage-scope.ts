export function scopedStorageKey(baseKey: string, scope: string | null | undefined) {
  return `${baseKey}::${scope || "default"}`;
}
