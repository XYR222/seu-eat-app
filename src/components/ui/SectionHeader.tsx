export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-xs font-black uppercase text-emerald-700">{eyebrow}</p>}
        <h2 className="text-lg font-black text-stone-950">{title}</h2>
        {subtitle && <p className="mt-1 text-xs leading-5 text-stone-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
