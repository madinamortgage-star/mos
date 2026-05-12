"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { BoardDrawer } from "./board-drawer";
import { BoardGroupSection } from "./board-group";
import type { BoardGroup, BoardItem, BoardSummaryCard } from "./board-types";

function matchesQuery(item: BoardItem, needle: string): boolean {
  if (!needle) return true;
  const hay = [
    item.title,
    item.subtitle ?? "",
    item.hint ?? "",
    item.badges.map((b) => b.label).join(" "),
    item.meta.map((m) => m.value).join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export function MondayBoard({
  groups,
  summaryCards = [],
  searchPlaceholder = "Search…",
  emptyTitle,
  emptyDescription,
  placeholderMode,
}: {
  groups: BoardGroup[];
  summaryCards?: BoardSummaryCard[];
  searchPlaceholder?: string;
  emptyTitle: string;
  emptyDescription: string;
  placeholderMode: boolean;
}) {
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(groups.filter((g) => g.defaultCollapsed).map((g) => g.key)),
  );
  const [openId, setOpenId] = useState<string | null>(null);

  const needle = q.trim().toLowerCase();
  const filteredGroups = useMemo(
    () => groups.map((g) => ({ ...g, items: g.items.filter((i) => matchesQuery(i, needle)) })),
    [groups, needle],
  );

  const totalItems = groups.reduce((n, g) => n + g.items.length, 0);
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const openItem = allItems.find((i) => i.id === openId) ?? null;

  if (totalItems === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={
          placeholderMode
            ? "Add your Supabase keys, apply the migrations, and (optionally) run supabase/seed.sql. Until then this board runs in placeholder mode."
            : emptyDescription
        }
      />
    );
  }

  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-stroke px-8 py-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-72 rounded-md border border-stroke bg-white px-3 py-1.5 text-sm outline-none focus:border-stroke-strong"
        />
        <div className="ml-auto text-xs text-brown-500">
          {totalItems} item{totalItems === 1 ? "" : "s"}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {summaryCards.length > 0 && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {summaryCards.map((c) => (
              <div key={c.label} className="rounded-lg border border-stroke bg-white px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-brown-500">{c.label}</div>
                <div className="mt-1 text-lg font-bold text-ink-900">{c.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {filteredGroups.map((g) => (
            <BoardGroupSection
              key={g.key}
              group={g}
              collapsed={collapsed.has(g.key)}
              onToggle={() => toggle(g.key)}
              onOpenItem={(item) => setOpenId(item.id)}
            />
          ))}
        </div>
      </div>

      <BoardDrawer item={openItem} onClose={() => setOpenId(null)} />
    </div>
  );
}
