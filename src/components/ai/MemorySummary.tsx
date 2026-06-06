import { foodItems } from "@/data/foods";
import { Chip } from "@/components/ui/Chip";
import type { UserMemory } from "@/types";
import { useState } from "react";

export function MemorySummary({
  memory,
  onRemove,
  onClear,
}: {
  memory: UserMemory;
  onRemove: (field: keyof UserMemory, value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  type MemoryChip = {
    field: keyof UserMemory;
    value: string;
    raw?: string;
    tone: "green" | "red" | "amber";
  };
  const chips: MemoryChip[] = [
    ...(memory.budgetMax ? [{ field: "budgetMax" as const, value: `${memory.budgetMax}元以内`, tone: "green" as const }] : []),
    ...memory.preferTags.map((value) => ({ field: "preferTags" as const, value, raw: value, tone: "green" as const })),
    ...memory.avoidTags.map((value) => ({ field: "avoidTags" as const, value: `避开${value}`, raw: value, tone: "red" as const })),
    ...memory.recentFoods.map((value) => ({
      field: "recentFoods" as const,
      value: `最近吃过${foodItems.find((food) => food.id === value)?.name ?? value}`,
      raw: value,
      tone: "amber" as const,
    })),
  ];

  return (
    <section className="dn-card p-3.5">
      <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen((current) => !current)} type="button">
        <div>
          <p className="text-xs font-black text-[#526100]">AI 已参考</p>
          <p className="dn-muted mt-1 text-[11px] leading-5">{chips.length ? `已参考 ${chips.length} 条饮食偏好，点击${open ? "收起" : "展开"}查看。` : "还没有长期偏好，AI 会从询问和反馈中自然学习。"}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#b9dc00]/60 bg-[#dcff3e]/70 px-3 py-1.5 text-xs font-black text-[#526100]">{open ? "收起" : `${chips.length} 条`}</span>
      </button>
      {open && (
        <div className="mt-3 border-t border-[#4c4c35]/10 pt-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="dn-muted text-[11px] leading-5">来自你的询问和反馈，只保存饮食偏好。</p>
            <button className="rounded-full px-2 py-1 text-xs font-bold text-stone-500 transition hover:bg-stone-100" onClick={onClear} type="button">
              清空
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {chips.length === 0 ? (
              <span className="text-xs text-stone-500">试试输入“15元以内，清淡，不要太咸”。</span>
            ) : (
              chips.map((chip) => (
                <Chip key={`${chip.field}-${chip.value}`} tone={chip.tone} onClick={() => chip.field !== "budgetMax" && onRemove(chip.field, chip.raw ?? chip.value)}>
                  {chip.value} {chip.field !== "budgetMax" ? "×" : ""}
                </Chip>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
