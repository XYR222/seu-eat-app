export function Chip({
  children,
  tone = "neutral",
  onClick,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "amber";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.98]",
        tone === "green" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "red" && "border-red-200 bg-red-50 text-red-700",
        tone === "amber" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "neutral" && "border-stone-200 bg-white text-stone-600",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
