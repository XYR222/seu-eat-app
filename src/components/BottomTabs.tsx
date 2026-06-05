import type { TabId } from "@/components/AppShell";

export function BottomTabs({ tab, setTab }: { tab: TabId; setTab: (tab: TabId) => void }) {
  const tabs: Array<[TabId, string, string, string]> = [
    ["ai", "AI", "AI帮选", "问一句"],
    ["explore", "⌕", "逛食堂", "自己找"],
    ["draw", "◇", "抽一餐", "不纠结"],
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 px-3 pb-3 pt-2">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2 rounded-3xl border border-stone-200/80 bg-white/92 p-2 shadow-[0_-12px_40px_rgba(41,37,30,0.12)] backdrop-blur">
        {tabs.map(([id, icon, label, hint]) => (
          <button
            key={id}
            className={[
              "flex min-h-14 flex-col items-center justify-center rounded-2xl border px-2 py-2 text-xs transition active:scale-[0.98]",
              tab === id ? "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm" : "border-transparent text-stone-500 hover:bg-stone-50",
            ].join(" ")}
            onClick={() => setTab(id)}
            type="button"
          >
            <span className={["flex h-6 min-w-6 items-center justify-center rounded-full text-[11px] font-black leading-none", tab === id ? "bg-emerald-700 px-1.5 text-white" : "bg-stone-100 px-1.5 text-stone-500"].join(" ")}>{icon}</span>
            <span className="mt-1 font-black leading-none">{label}</span>
            <span className="mt-0.5 text-[10px] font-semibold leading-none opacity-70">{hint}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
