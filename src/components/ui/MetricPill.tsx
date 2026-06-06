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
        tone === "green" && "border-[#b9dc00]/70 bg-[#dcff3e]/80 text-[#526100]",
        tone === "red" && "border-red-200 bg-red-50 text-red-700",
        tone === "amber" && "border-[#dfb836]/40 bg-[#ffe270]/80 text-[#8a5b00]",
        tone === "dark" && "border-[#4c4c35] bg-[#4c4c35] text-white",
        tone === "neutral" && "border-[#4c4c35]/14 bg-white/80 text-[#4c4c35]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
