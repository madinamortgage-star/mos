"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PROSPECT_REASON_META,
  prospectPriorityBadgeClass,
  prospectPriorityLabel,
  type ProspectItem,
} from "@/lib/prospecting/queue";
import { CALL_DISPOSITIONS } from "./prospect-card";

type Panel = "none" | "call" | "note" | "followup";

export function ProspectDrawer({
  item,
  onClose,
  onLogCall,
}: {
  item: ProspectItem | null;
  onClose: () => void;
  onLogCall: (id: string, disposition: string) => void;
}) {
  const [panel, setPanel] = useState<Panel>("none");

  useEffect(() => {
    setPanel("none");
  }, [item?.id]);

  if (!item) return null;
  const reasonMeta = PROSPECT_REASON_META[item.reason];
  const close = () => {
    setPanel("none");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink-900/30" onClick={close}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-beige-50 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-stroke bg-beige-50 px-5 py-3">
          <button onClick={close} className="text-sm text-brown-600 hover:text-ink-900">
            ← Close
          </button>
          <div className="flex-1" />
          <Link href={`/contacts/${item.contactId}`} className="text-xs font-medium text-navy-700">
            Open contact →
          </Link>
        </div>

        <div className="px-5 py-5">
          <div className="text-lg font-bold text-ink-900">{item.name}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${reasonMeta.badgeClass}`}>
              {reasonMeta.label}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${prospectPriorityBadgeClass(item.priority)}`}>
              {prospectPriorityLabel(item.priority)}
            </span>
          </div>
          {(item.phone || item.email) && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {item.phone && (
                <a href={`tel:${item.phone}`} className="font-mono text-navy-700 hover:underline">
                  {item.phone}
                </a>
              )}
              {item.email && (
                <a href={`mailto:${item.email}`} className="text-navy-700 hover:underline">
                  {item.email}
                </a>
              )}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPanel((p) => (p === "call" ? "none" : "call"))}
              className="rounded-md border border-stroke bg-white px-2 py-1.5 text-xs font-medium text-ink-900 hover:bg-beige-100"
            >
              Log call
            </button>
            <button
              type="button"
              onClick={() => setPanel((p) => (p === "note" ? "none" : "note"))}
              className="rounded-md border border-stroke bg-white px-2 py-1.5 text-xs font-medium text-ink-900 hover:bg-beige-100"
            >
              Add note
            </button>
            <button
              type="button"
              onClick={() => setPanel((p) => (p === "followup" ? "none" : "followup"))}
              className="rounded-md border border-stroke bg-white px-2 py-1.5 text-xs font-medium text-ink-900 hover:bg-beige-100"
            >
              Schedule follow-up
            </button>
          </div>

          {panel === "call" && (
            <div className="mt-3 rounded-lg border border-stroke bg-white p-3">
              <div className="mb-2 text-xs font-medium text-brown-700">How did the call go?</div>
              <div className="flex flex-wrap gap-1.5">
                {CALL_DISPOSITIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      onLogCall(item.id, d);
                      close();
                    }}
                    className="rounded-md border border-stroke px-2 py-1 text-xs text-ink-900 hover:bg-beige-100"
                  >
                    {d}
                  </button>
                ))}
              </div>
              {/* TODO(mutation): Server Action — insert activities(type='call', body=disposition)
                  and update contacts.last_contacted_at. */}
            </div>
          )}

          {panel === "note" && (
            <div className="mt-3 rounded-lg border border-stroke bg-white p-3">
              <textarea
                rows={3}
                placeholder="Add a note about this prospect…"
                className="w-full rounded-md border border-stroke px-2 py-1.5 text-sm outline-none focus:border-stroke-strong"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-brown-500">Saving notes lands in a later phase.</span>
                <button
                  type="button"
                  onClick={() => setPanel("none")}
                  className="rounded-md bg-navy-900 px-2.5 py-1 text-xs font-semibold text-beige-100"
                >
                  Save note
                </button>
              </div>
              {/* TODO(mutation): Server Action — insert notes(...) + activities(type='note'). */}
            </div>
          )}

          {panel === "followup" && (
            <div className="mt-3 rounded-lg border border-stroke bg-white p-3">
              <label className="block text-xs text-brown-700">
                Next follow-up date
                <input type="date" className="mt-1 w-full rounded-md border border-stroke px-2 py-1.5 text-sm" />
              </label>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-brown-500">Scheduling reminders lands in a later phase.</span>
                <button
                  type="button"
                  onClick={() => setPanel("none")}
                  className="rounded-md bg-navy-900 px-2.5 py-1 text-xs font-semibold text-beige-100"
                >
                  Set
                </button>
              </div>
              {/* TODO(mutation + cron): Server Action — update contacts.next_follow_up_at; later a
                  Supabase scheduled function / Edge Function sends the reminder email. */}
            </div>
          )}

          <div className="mt-4 rounded-lg border border-stroke bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-ink-900">Details</div>
            {item.meta.map((m, i) => (
              <div
                key={`${m.label}-${i}`}
                className="flex justify-between gap-4 border-b border-stroke/60 py-1.5 last:border-0"
              >
                <span className="text-xs text-brown-500">{m.label}</span>
                <span className="max-w-[60%] text-right text-sm text-ink-900">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
