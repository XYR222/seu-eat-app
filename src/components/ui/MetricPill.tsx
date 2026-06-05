export function MetricPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "amber" | "dark";
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black leading-none",
        tone === "green" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "red" && "border-red-200 bg-red-50 text-red-700",
        tone === "amber" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "dark" && "border-stone-800 bg-stone-900 text-white",
        tone === "neutral" && "border-stone-200 bg-white/80 text-stone-600",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
