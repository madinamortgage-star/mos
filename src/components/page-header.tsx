export function PageHeader({
  crumb,
  title,
  right,
}: {
  crumb: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between border-b border-stroke px-8 py-5">
      <div>
        <div className="text-[11px] tracking-[0.14em] uppercase text-brown-500 font-medium">
          {crumb}
        </div>
        <h1 className="text-2xl font-bold text-ink-900 tracking-tight">{title}</h1>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
