import { describe, expect, it } from "vitest";
import { getUnreadActivityIds } from "./activity-store";

describe("activity store", () => {
  it("returns activity ids that have not been seen", () => {
    expect(getUnreadActivityIds(["act-1", "act-2"], ["act-1"])).toEqual(["act-2"]);
  });

  it("treats all activities as unread when no seen ids exist", () => {
    expect(getUnreadActivityIds(["act-1", "act-2"], [])).toEqual(["act-1", "act-2"]);
  });
});
