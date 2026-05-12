"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import {
  PROSPECT_REASON_META,
  PROSPECT_REASON_ORDER,
  type ProspectGroup,
  type ProspectItem,
  type ProspectReason,
} from "@/lib/prospecting/queue";
import { ProspectCard } from "./prospect-card";
import { ProspectDrawer } from "./prospect-drawer";

type ReasonFilter = "all" | ProspectReason;

function Stat({ label, value, tone }: { label: string; value: number; tone?: "danger" | "good" }) {
  const valueClass = tone === "danger" ? "text-red-600" : tone === "good" ? "text-green-700" : "text-ink-900";
  return (
    <div className="rounded-lg border border-stroke bg-white px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-brown-500">{label}</div>
      <div className={`mt-1 text-lg font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

export function ProspectQueue({ groups, placeholderMode }: { groups: ProspectGroup[]; placeholderMode: boolean }) {
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [q, setQ] = useState("");
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const totalItems = allItems.length;
  const needle = q.trim().toLowerCase();

  const matches = (it: ProspectItem) =>
    (!needle || `${it.name} ${it.phone ?? ""} ${it.email ?? ""} ${it.reasonDetail}`.toLowerCase().includes(needle)) &&
    (reasonFilter === "all" || it.reason === reasonFilter);

  const visibleGroups = groups
    .map((g) => ({ ...g, items: g.items.filter((it) => matches(it) && !done.has(it.id)) }))
    .filter((g) => g.items.length > 0);

  const completedItems = allItems.filter((it) => done.has(it.id));
  const pendingCount = totalItems - completedItems.length;
  const overduePending = allItems.filter((it) => it.reason === "overdue_followup" && !done.has(it.id)).length;
  const hotPending = allItems.filter(
    (it) => (it.reason === "hot_lead" || it.reason === "refi_opportunity") && !done.has(it.id),
  ).length;

  const openItem = allItems.find((it) => it.id === openId) ?? null;

  const logCall = (id: string, _disposition: string) => {
    // TODO(mutation): persist via Server Action — insert activities(type='call')
    // + update contacts.last_contacted_at. For now this is client-only.
    setDone((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (openId === id) setOpenId(null);
  };

  if (totalItems === 0) {
    return (
      <EmptyState
        icon="✓"
        title="Your call queue is clear"
        description={
          placeholderMode
            ? "Add your Supabase keys, apply the migrations, and (optionally) run supabase/seed.sql. Then this queue rebuilds from follow-up dates, hot leads, expiring rate locks, and past clients likely to refinance."
            : "No prospects need a call right now. The queue rebuilds from follow-up dates, hot leads, expiring rate locks, and past clients likely to refinance."
        }
      />
    );
  }

  if (pendingCount === 0) {
    return (
      <EmptyState
        icon="✓"
        title="You're done for today"
        description={`${completedItems.length} call${completedItems.length === 1 ? "" : "s"} logged. Tomorrow's queue will rebuild automatically.`}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-stroke px-8 py-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, reason…"
          className="w-72 rounded-md border border-stroke bg-white px-3 py-1.5 text-sm outline-none focus:border-stroke-strong"
        />
        <div className="flex flex-wrap items-center gap-1">
          {(["all", ...PROSPECT_REASON_ORDER] as ReasonFilter[]).map((r) => {
            const on = reasonFilter === r;
            const label = r === "all" ? "All" : PROSPECT_REASON_META[r].label;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setReasonFilter(r)}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  on ? "bg-navy-900 text-beige-100" : "text-brown-700 hover:bg-beige-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Calls due" value={pendingCount} />
          <Stat label="Overdue" value={overduePending} tone="danger" />
          <Stat label="Hot / refi" value={hotPending} />
          <Stat label="Logged today" value={completedItems.length} tone="good" />
        </div>

        {visibleGroups.length === 0 ? (
          <EmptyState title="No prospects match" description="Clear the search or the reason filter." />
        ) : (
          <div className="space-y-5">
            {visibleGroups.map((g) => {
              const meta = PROSPECT_REASON_META[g.reason];
              return (
                <section key={g.reason}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
                    <h2 className="text-sm font-semibold text-ink-900">{meta.label}</h2>
                    <span className="rounded-full bg-beige-200 px-1.5 py-0.5 text-[11px] font-medium text-brown-600">
                      {g.items.length}
                    </span>
                    <span className="text-xs text-brown-400">{meta.description}</span>
                  </div>
                  <ul className="space-y-2">
                    {g.items.map((it) => (
                      <ProspectCard key={it.id} item={it} onLogCall={logCall} onOpen={() => setOpenId(it.id)} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        {completedItems.length > 0 && (
          <section className="mt-6">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-brown-500">Logged today</h2>
              <span className="rounded-full bg-beige-200 px-1.5 py-0.5 text-[11px] font-medium text-brown-600">
                {completedItems.length}
              </span>
            </div>
            <ul className="space-y-2">
              {completedItems.map((it) => (
                <ProspectCard key={it.id} item={it} done onLogCall={logCall} onOpen={() => setOpenId(it.id)} />
              ))}
            </ul>
          </section>
        )}
      </div>

      <ProspectDrawer item={openItem} onClose={() => setOpenId(null)} onLogCall={logCall} />
    </div>
  );
}
