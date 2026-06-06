import { describe, expect, it } from "vitest";
import { GUEST_ACCOUNTS, buildClearGuestCookieValue, buildGuestCookieValue, getGuestAccount, isGuestAccountId, normalizeGuestNextPath } from "./guest-auth";

describe("guest auth", () => {
  it("provides four demo guest accounts", () => {
    expect(GUEST_ACCOUNTS).toHaveLength(4);
    expect(GUEST_ACCOUNTS.map((account) => account.id)).toEqual(["guest-a", "guest-b", "guest-c", "guest-d"]);
  });

  it("falls back to the first guest when the id is unknown", () => {
    expect(getGuestAccount("missing").id).toBe("guest-a");
  });

  it("validates known guest ids", () => {
    expect(isGuestAccountId("guest-a")).toBe(true);
    expect(isGuestAccountId("missing")).toBe(false);
    expect(isGuestAccountId(null)).toBe(false);
  });

  it("only accepts internal next paths", () => {
    expect(normalizeGuestNextPath("/")).toBe("/");
    expect(normalizeGuestNextPath("/?tab=draw")).toBe("/?tab=draw");
    expect(normalizeGuestNextPath("https://example.com")).toBe("/");
    expect(normalizeGuestNextPath("//example.com")).toBe("/");
    expect(normalizeGuestNextPath(null)).toBe("/");
  });

  it("builds scoped guest cookies", () => {
    expect(buildGuestCookieValue("guest-a", 60)).toBe("seu-eat-guest=guest-a; Path=/; Max-Age=60; SameSite=Lax");
    expect(buildClearGuestCookieValue()).toBe("seu-eat-guest=; Path=/; Max-Age=0; SameSite=Lax");
  });
});
