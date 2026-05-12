import type { BoardItem } from "./board-types";

export function BoardCard({ item, onClick }: { item: BoardItem; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-lg border border-stroke bg-white p-3 text-left shadow-sm transition hover:border-stroke-strong hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink-900">{item.title}</div>
          {item.subtitle && <div className="truncate text-xs text-brown-500">{item.subtitle}</div>}
        </div>
        {item.amountLabel && <div className="shrink-0 font-mono text-sm text-ink-900">{item.amountLabel}</div>}
      </div>

      {item.badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {item.badges.map((b, i) => (
            <span
              key={`${b.label}-${i}`}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${b.className}`}
            >
              {b.label}
            </span>
          ))}
        </div>
      )}

      {item.hint && <div className="truncate text-[11px] text-brown-500">{item.hint}</div>}
    </button>
  );
}
