import { Chip } from "@/components/ui/Chip";
import { MetricPill } from "@/components/ui/MetricPill";
import { buildOnboardingProfile, type OnboardingDraft, type OnboardingProfile } from "@/lib/onboarding-store";
import { useState } from "react";

const budgets = [
  { label: "15 元以内", value: 15 },
  { label: "20 元以内", value: 20 },
  { label: "不太限制", value: undefined },
];
const preferTags = ["清淡", "热汤", "出餐快", "量大", "高蛋白", "性价比高"];
const avoidTags = ["偏辣", "偏咸", "油腻", "面食", "容易卖完"];
const classAreas = ["教学楼附近", "图书馆附近", "体育馆附近"];
const dormAreas = ["桃园宿舍", "橘园宿舍"];

function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function OnboardingSheet({ onComplete, onSkip }: { onComplete: (profile: OnboardingProfile) => void; onSkip: (profile: OnboardingProfile) => void }) {
  const [draft, setDraft] = useState<OnboardingDraft>({ preferTags: [], avoidTags: [] });

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-stone-950/35 px-3 pb-3 backdrop-blur-[2px]">
      <div className="mx-auto max-h-[88vh] w-full max-w-[430px] overflow-auto rounded-[1.8rem] border border-white/70 bg-[#f9faf3] p-5 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#4c4c35]/16" />
        <header className="dn-hero-card dn-hero-card--lime min-h-0">
          <div className="relative z-10 max-w-[70%]">
            <p className="dn-eyebrow">AI 先认识你一下</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-[#2a2a1a]">以后推荐会更懂你</h2>
            <p className="dn-muted mt-2 text-xs leading-5">这些只会保存为当前游客的饮食偏好，也可以直接跳过。</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pipi/pipi-wave.png" alt="" className="dn-pipi-shadow absolute bottom-0 right-2 h-24 w-24 object-contain" />
        </header>

        <section className="mt-4 space-y-3">
          <div className="dn-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-black text-[#2a2a1a]">大概预算</p>
              <MetricPill tone="green">可跳过</MetricPill>
            </div>
            <div className="flex flex-wrap gap-2">
              {budgets.map((item) => (
                <Chip key={item.label} tone={draft.budgetMax === item.value ? "green" : "neutral"} onClick={() => setDraft((current) => ({ ...current, budgetMax: item.value }))}>
                  {item.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="dn-card p-3">
            <p className="text-sm font-black text-[#2a2a1a]">平时更喜欢</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {preferTags.map((tag) => (
                <Chip key={tag} tone={draft.preferTags.includes(tag) ? "green" : "neutral"} onClick={() => setDraft((current) => ({ ...current, preferTags: toggle(current.preferTags, tag) }))}>
                  {tag}
                </Chip>
              ))}
            </div>
          </div>

          <div className="dn-card p-3">
            <p className="text-sm font-black text-[#2a2a1a]">尽量避开</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {avoidTags.map((tag) => (
                <Chip key={tag} tone={draft.avoidTags.includes(tag) ? "red" : "neutral"} onClick={() => setDraft((current) => ({ ...current, avoidTags: toggle(current.avoidTags, tag) }))}>
                  {tag}
                </Chip>
              ))}
            </div>
          </div>

          <div className="dn-card p-3">
            <p className="text-sm font-black text-[#2a2a1a]">常在区域</p>
            <p className="dn-muted mt-1 text-xs">住宿在桃园会优先考虑桃园食堂，橘园同理；湖滨暂不自动推导。</p>
            <div className="mt-3 space-y-2">
              <div>
                <p className="mb-1 text-xs font-black text-[#526100]">平时上课</p>
                <div className="flex flex-wrap gap-2">
                  {classAreas.map((area) => (
                    <Chip key={area} tone={draft.classArea === area ? "green" : "neutral"} onClick={() => setDraft((current) => ({ ...current, classArea: area }))}>
                      {area}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-black text-[#526100]">住宿附近</p>
                <div className="flex flex-wrap gap-2">
                  {dormAreas.map((area) => (
                    <Chip key={area} tone={draft.dormArea === area ? "green" : "neutral"} onClick={() => setDraft((current) => ({ ...current, dormArea: area }))}>
                      {area}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="dn-secondary-button py-3 text-sm font-black" onClick={() => onSkip(buildOnboardingProfile({ preferTags: [], avoidTags: [] }, true))} type="button">
            先跳过
          </button>
          <button className="dn-primary-button py-3 text-sm font-black" onClick={() => onComplete(buildOnboardingProfile(draft))} type="button">
            保存偏好
          </button>
        </div>
      </div>
    </div>
  );
}
