import { Chip } from "@/components/ui/Chip";
import { MetricPill } from "@/components/ui/MetricPill";
import type { CanteenActivity } from "@/types";

export function ActivitySheet({
  activities,
  onClose,
  onExplore,
}: {
  activities: CanteenActivity[];
  onClose: () => void;
  onExplore: (activity: CanteenActivity) => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-stone-950/35 px-3 pb-3 backdrop-blur-[2px]" onClick={onClose}>
      <div className="mx-auto max-h-[86vh] w-full max-w-[430px] overflow-auto rounded-[1.8rem] border border-white/70 bg-[#f9faf3] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#4c4c35]/16" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="dn-eyebrow text-orange-600">食堂动态</p>
            <h2 className="mt-1 text-2xl font-black text-[#2a2a1a]">近期活动</h2>
            <p className="dn-muted mt-1 text-xs leading-5">优惠、新菜、窗口提醒和高峰信息。</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-black text-[#4c4c35] shadow-sm" onClick={onClose} type="button">
            x
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {activities.map((activity) => (
            <article className="dn-card p-4" key={activity.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <MetricPill tone={activity.type === "限时优惠" ? "amber" : activity.type === "窗口变动" ? "red" : "green"}>{activity.type}</MetricPill>
                  <h3 className="mt-2 text-base font-black text-[#2a2a1a]">{activity.title}</h3>
                  <p className="dn-muted mt-1 text-xs font-bold">
                    {activity.canteen}
                    {activity.stall ? ` / ${activity.stall}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#4c4c35] ring-1 ring-[#4c4c35]/12">{activity.period}</span>
              </div>
              <p className="dn-muted mt-3 text-sm leading-6">{activity.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activity.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
              <button className="dn-primary-button mt-3 px-4 py-2 text-xs font-black" onClick={() => onExplore(activity)} type="button">
                去看看
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
