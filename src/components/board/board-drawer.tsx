"use client";

import Link from "next/link";
import type { BoardItem } from "./board-types";

export function BoardDrawer({ item, onClose }: { item: BoardItem | null; onClose: () => void }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink-900/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-beige-50 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-stroke bg-beige-50 px-5 py-3">
          <button onClick={onClose} className="text-sm text-brown-600 hover:text-ink-900">
            ← Close
          </button>
          <div className="flex-1" />
          {item.detailHref && (
            <Link href={item.detailHref} className="text-xs font-medium text-navy-700">
              {item.detailLabel ?? "Open record"} →
            </Link>
          )}
        </div>

        <div className="px-5 py-5">
          <div className="text-lg font-bold text-ink-900">{item.title}</div>
          {item.subtitle && <div className="text-xs text-brown-500">{item.subtitle}</div>}
          {item.badges.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
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

          {item.amountLabel && (
            <div className="mt-4 rounded-lg border border-stroke bg-white px-3 py-2">
              <div className="text-[11px] uppercase tracking-wide text-brown-500">Amount</div>
              <div className="mt-0.5 font-mono text-sm text-ink-900">{item.amountLabel}</div>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-stroke bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-ink-900">Details</div>
            {item.meta.map((row, i) => (
              <div
                key={`${row.label}-${i}`}
                className="flex justify-between gap-4 border-b border-stroke/60 py-1.5 last:border-0"
              >
                <span className="text-xs text-brown-500">{row.label}</span>
                <span className="max-w-[60%] text-right text-sm text-ink-900">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-dashed border-stroke bg-white/60 p-4 text-sm text-brown-600">
            Stage moves, tasks, documents and the activity timeline for this record land in a later phase.
          </div>
        </div>
      </div>
    </div>
  );
}
