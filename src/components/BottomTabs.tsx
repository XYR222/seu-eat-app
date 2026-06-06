import type { TabId } from "@/components/AppShell";

export function BottomTabs({ tab, setTab }: { tab: TabId; setTab: (tab: TabId) => void }) {
  const tabs: Array<[TabId, string, string, string]> = [
    ["ai", "AI", "AI帮选", "问一句"],
    ["explore", "⌕", "逛食堂", "自己找"],
    ["draw", "◇", "抽一餐", "不纠结"],
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3 pt-2">
      <div className="dn-bottom-tabs mx-auto grid grid-cols-3 gap-2 p-2">
        {tabs.map(([id, icon, label, hint]) => (
          <button
            key={id}
            className={[
              "flex min-h-14 flex-col items-center justify-center rounded-[1.05rem] border px-2 py-2 text-xs transition active:scale-[0.98]",
              tab === id ? "dn-tab-active shadow-sm" : "border-transparent text-stone-500 hover:bg-[#f4f4ea]",
            ].join(" ")}
            onClick={() => setTab(id)}
            type="button"
          >
            <span className={["flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-black leading-none", tab === id ? "bg-[#526100] text-white" : "bg-[#f4f4ea] text-stone-500"].join(" ")}>{icon}</span>
            <span className="mt-1 font-black leading-none">{label}</span>
            <span className="mt-0.5 text-[10px] font-semibold leading-none opacity-70">{hint}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
