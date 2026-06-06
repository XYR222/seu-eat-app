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
        {eyebrow && <p className="text-xs font-black uppercase text-[#5e6e00]">{eyebrow}</p>}
        <h2 className="text-lg font-black text-[#2a2a1a]">{title}</h2>
        {subtitle && <p className="dn-muted mt-1 text-xs leading-5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
