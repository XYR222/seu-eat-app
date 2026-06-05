import type { TabId } from "@/components/AppShell";

export function BottomTabs({ tab, setTab }: { tab: TabId; setTab: (tab: TabId) => void }) {
  const tabs: Array<[TabId, string, string]> = [
    ["ai", "⌘", "AI帮选"],
    ["explore", "⌕", "逛食堂"],
    ["draw", "◈", "抽一餐"],
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 px-4 pb-3 pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {tabs.map(([id, icon, label]) => (
          <button
            key={id}
            className={`rounded-lg px-3 py-2 text-xs font-black ${tab === id ? "bg-emerald-50 text-emerald-700" : "text-stone-500"}`}
            onClick={() => setTab(id)}
            type="button"
          >
            <span className="block text-lg leading-none">{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
