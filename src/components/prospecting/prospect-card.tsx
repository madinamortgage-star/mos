"use client";

import { useState } from "react";
import {
  PROSPECT_REASON_META,
  prospectPriorityBadgeClass,
  prospectPriorityLabel,
  type ProspectItem,
} from "@/lib/prospecting/queue";

export const CALL_DISPOSITIONS = ["Connected", "Left voicemail", "No pickup", "Wrong number", "Not interested"];

export function ProspectCard({
  item,
  done,
  onLogCall,
  onOpen,
}: {
  item: ProspectItem;
  done?: boolean;
  onLogCall: (id: string, disposition: string) => void;
  onOpen: () => void;
}) {
  const [showDisp, setShowDisp] = useState(false);
  const reasonMeta = PROSPECT_REASON_META[item.reason];

  return (
    <li
      className={`rounded-lg border border-stroke bg-white p-3.5 shadow-sm ${
        done ? "opacity-60" : "hover:border-stroke-strong"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-900">{item.name}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${reasonMeta.badgeClass}`}>
              {reasonMeta.label}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${prospectPriorityBadgeClass(item.priority)}`}>
              {prospectPriorityLabel(item.priority)}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-brown-500">
            {item.phone && <span className="font-mono">{item.phone}</span>}
            {item.phone && item.email && <span aria-hidden>·</span>}
            {item.email && <span className="truncate">{item.email}</span>}
            <span aria-hidden>·</span>
            <span>Last contact: {item.lastTouchLabel}</span>
          </div>
          <div className="mt-1.5 text-sm text-brown-700">{item.reasonDetail}</div>
        </button>

        <div className="relative shrink-0">
          {done ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-700/10 px-2.5 py-1 text-xs font-medium text-green-800">
              ✓ Logged
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowDisp((v) => !v)}
              className="rounded-md bg-navy-900 px-2.5 py-1 text-xs font-semibold text-beige-100 hover:bg-navy-800"
            >
              Log call ▾
            </button>
          )}
          {showDisp && !done && (
            <div className="absolute right-0 z-10 mt-1 w-44 rounded-md border border-stroke bg-white p-1 shadow-lg">
              {CALL_DISPOSITIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setShowDisp(false);
                    onLogCall(item.id, d);
                  }}
                  className="block w-full rounded px-2 py-1 text-left text-xs text-ink-900 hover:bg-beige-100"
                >
                  {d}
                </button>
              ))}
              {/* TODO(mutation): logging a call should run a Server Action that
                  inserts an `activities` row (type 'call', body = disposition)
                  and sets contacts.last_contacted_at = now(). For now it just
                  moves the prospect to "Logged today" client-side. */}
            </div>
          )}
        </div>
      </div>

      {item.phone && !done && (
        <a href={`tel:${item.phone}`} className="mt-2 inline-block text-xs font-medium text-navy-700 hover:underline">
          Call {item.phone} →
        </a>
      )}
    </li>
  );
}
