import { formatCompactMoney } from "@/lib/loans/format";
import { BoardCard } from "./board-card";
import type { BoardGroup, BoardItem } from "./board-types";

export function BoardGroupSection({
  group,
  collapsed,
  onToggle,
  onOpenItem,
}: {
  group: BoardGroup;
  collapsed: boolean;
  onToggle: () => void;
  onOpenItem: (item: BoardItem) => void;
}) {
  const moneyItems = group.items.filter((i) => i.amount != null);
  const total = moneyItems.reduce((sum, i) => sum + (i.amount ?? 0), 0);

  return (
    <section className="rounded-xl border border-stroke bg-beige-100/60">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
      >
        <span className="text-xs text-brown-400">{collapsed ? "▸" : "▾"}</span>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: group.color || "var(--navy-600)" }} />
        <span className="truncate text-sm font-semibold text-ink-900">{group.title}</span>
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-brown-600">
          {group.items.length}
        </span>
        {moneyItems.length > 0 && (
          <span className="ml-auto text-[11px] uppercase tracking-wide text-brown-500">
            Volume <span className="font-mono text-brown-700">{formatCompactMoney(total)}</span>
          </span>
        )}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4">
          {group.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stroke bg-white/40 px-3 py-6 text-center text-xs text-brown-400">
              No items
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {group.items.map((item) => (
                <BoardCard key={item.id} item={item} onClick={() => onOpenItem(item)} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
