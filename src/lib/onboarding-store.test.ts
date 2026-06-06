import { describe, expect, it } from "vitest";
import { buildOnboardingProfile, onboardingProfileToMemoryPatch } from "@/lib/onboarding-store";

describe("onboarding store", () => {
  it("converts onboarding answers into a memory patch", () => {
    const profile = buildOnboardingProfile({
      budgetMax: 15,
      preferTags: ["清淡", "热汤", "清淡"],
      avoidTags: ["偏辣"],
      classArea: "教学楼附近",
      dormArea: "桃园宿舍",
    });

    const patch = onboardingProfileToMemoryPatch(profile);

    expect(patch.budgetMax).toBe(15);
    expect(patch.preferTags).toEqual(["清淡", "热汤"]);
    expect(patch.avoidTags).toEqual(["偏辣"]);
    expect(patch.preferredCanteens).toEqual(["桃园食堂", "橘园食堂"]);
    expect(patch.sessionContext).toContain("平时上课区域：教学楼附近");
  });

  it("maps Taoyuan and Juyuan dorms to their matching canteens", () => {
    expect(buildOnboardingProfile({ preferTags: [], avoidTags: [], dormArea: "桃园宿舍" }).preferredCanteens).toEqual(["桃园食堂"]);
    expect(buildOnboardingProfile({ preferTags: [], avoidTags: [], dormArea: "橘园宿舍" }).preferredCanteens).toEqual(["橘园食堂"]);
  });

  it("marks skipped onboarding without inventing preferences", () => {
    const profile = buildOnboardingProfile({ preferTags: [], avoidTags: [] }, true);
    const patch = onboardingProfileToMemoryPatch(profile);

    expect(profile.skipped).toBe(true);
    expect(patch.preferTags).toEqual([]);
    expect(patch.avoidTags).toEqual([]);
    expect(patch.sessionContext).toEqual(["已跳过初始偏好询问"]);
  });
});
