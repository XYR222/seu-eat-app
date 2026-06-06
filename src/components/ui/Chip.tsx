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
        "rounded-full border px-3 py-1.5 text-xs font-black shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition active:scale-[0.98]",
        onClick ? "hover:-translate-y-0.5" : "cursor-default",
        tone === "green" && "border-[#b9dc00]/70 bg-[#dcff3e] text-[#526100]",
        tone === "red" && "border-red-200 bg-red-50 text-red-700",
        tone === "amber" && "border-[#dfb836]/40 bg-[#ffe270]/70 text-[#8a5b00]",
        tone === "neutral" && "border-[#4c4c35]/15 bg-white/88 text-[#4c4c35]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
