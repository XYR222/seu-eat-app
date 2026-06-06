import { describe, expect, it } from "vitest";
import { scopedStorageKey } from "./storage-scope";

describe("storage scope", () => {
  it("scopes personal storage keys by guest id", () => {
    expect(scopedStorageKey("seu-eat-memory", "guest-a")).toBe("seu-eat-memory::guest-a");
    expect(scopedStorageKey("seu-eat-memory", "guest-b")).toBe("seu-eat-memory::guest-b");
  });

  it("falls back to a default scope when guest id is absent", () => {
    expect(scopedStorageKey("seu-eat-memory", "")).toBe("seu-eat-memory::default");
    expect(scopedStorageKey("seu-eat-memory", null)).toBe("seu-eat-memory::default");
  });
});
