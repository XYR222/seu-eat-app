import { foodItems } from "@/data/foods";
import { Chip } from "@/components/ui/Chip";
import type { UserMemory } from "@/types";

export function MemorySummary({
  memory,
  onRemove,
  onClear,
}: {
  memory: UserMemory;
  onRemove: (field: keyof UserMemory, value: string) => void;
  onClear: () => void;
}) {
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
    <section className="rounded-[1.35rem] border border-emerald-100 bg-white/82 p-3.5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-emerald-800">AI 已参考</p>
          <p className="text-[11px] leading-5 text-stone-500">来自你的询问和反馈，只保存饮食偏好。</p>
        </div>
        <button className="rounded-full px-2 py-1 text-xs font-bold text-stone-500 transition hover:bg-stone-100" onClick={onClear} type="button">
          清空
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.length === 0 ? (
          <span className="text-xs text-stone-500">还没有长期偏好。试试输入“15元以内，清淡，不要太咸”。</span>
        ) : (
          chips.map((chip) => (
            <Chip key={`${chip.field}-${chip.value}`} tone={chip.tone} onClick={() => chip.field !== "budgetMax" && onRemove(chip.field, chip.raw ?? chip.value)}>
              {chip.value} {chip.field !== "budgetMax" ? "×" : ""}
            </Chip>
          ))
        )}
      </div>
    </section>
  );
}
