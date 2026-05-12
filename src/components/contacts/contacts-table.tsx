"use client";

import { contactDisplayName, contactInitials, formatDate } from "@/lib/contacts/format";
import type { ContactRow } from "@/lib/db/types";
import { LifecycleBadge, PriorityBadge, StatusBadge, TagList } from "./badges";

const HEADERS = [
  "Name",
  "Phone",
  "Lifecycle",
  "Status",
  "Priority",
  "Tags",
  "Source",
  "Location",
  "Next follow-up",
  "Updated",
];

export function ContactsTable({ rows, onOpen }: { rows: ContactRow[]; onOpen: (c: ContactRow) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-stroke text-left text-[11px] uppercase tracking-wide text-brown-500">
            {HEADERS.map((h, i) => (
              <th key={h} className={`py-2 font-medium ${i === 0 ? "px-8" : "px-3"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const location = [c.city, c.state].filter(Boolean).join(", ");
            return (
              <tr
                key={c.id}
                onClick={() => onOpen(c)}
                className="cursor-pointer border-b border-stroke/60 hover:bg-beige-100"
              >
                <td className="px-8 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-700 text-[11px] font-semibold text-beige-100">
                      {contactInitials(c)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink-900">{contactDisplayName(c)}</div>
                      {c.email && <div className="truncate text-xs text-brown-500">{c.email}</div>}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-brown-600">
                  {c.phone ?? c.mobile_phone ?? "—"}
                </td>
                <td className="px-3 py-2.5">
                  <LifecycleBadge value={c.lifecycle} />
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge value={c.status} />
                </td>
                <td className="px-3 py-2.5">
                  <PriorityBadge value={c.priority} />
                </td>
                <td className="px-3 py-2.5">
                  <TagList tags={c.tags} />
                </td>
                <td className="px-3 py-2.5 text-brown-600">{c.source ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-brown-600">{location || "—"}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-brown-600">{formatDate(c.next_follow_up_at)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-brown-500">{formatDate(c.updated_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
