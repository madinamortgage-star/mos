"use client";

import Link from "next/link";
import { contactDisplayName, contactInitials, formatDate } from "@/lib/contacts/format";
import type { ContactRow } from "@/lib/db/types";
import { LifecycleBadge, PriorityBadge, StatusBadge, TagList } from "./badges";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stroke/60 py-1.5 last:border-0">
      <span className="text-xs text-brown-500">{label}</span>
      <span className="text-right text-sm text-ink-900">{value || "—"}</span>
    </div>
  );
}

export function ContactDrawer({ contact, onClose }: { contact: ContactRow | null; onClose: () => void }) {
  if (!contact) return null;
  const c = contact;
  const location = [c.address, c.city, c.state, c.postal_code].filter(Boolean).join(", ");

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
          <Link href={`/contacts/${c.id}`} className="text-xs font-medium text-navy-700">
            Open full profile →
          </Link>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-700 text-sm font-semibold text-beige-100">
              {contactInitials(c)}
            </span>
            <div className="min-w-0">
              <div className="text-lg font-bold text-ink-900">{contactDisplayName(c)}</div>
              <div className="font-mono text-xs text-brown-500">{c.id}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <LifecycleBadge value={c.lifecycle} />
                <StatusBadge value={c.status} />
                <PriorityBadge value={c.priority} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {(
              [
                ["Next follow-up", formatDate(c.next_follow_up_at)],
                ["Last contacted", formatDate(c.last_contacted_at)],
                ["Created", formatDate(c.created_at)],
                ["Updated", formatDate(c.updated_at)],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-stroke bg-white px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-brown-500">{label}</div>
                <div className="mt-0.5 text-sm text-ink-900">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-stroke bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-ink-900">Contact information</div>
            <Field label="Email" value={c.email} />
            <Field label="Phone" value={c.phone} />
            <Field label="Mobile" value={c.mobile_phone} />
            <Field label="Source" value={c.source} />
            <Field label="Location" value={location} />
            <Field label="Birthday" value={formatDate(c.birthday)} />
            <Field label="Tags" value={<TagList tags={c.tags} />} />
          </div>

          <div className="mt-5 rounded-lg border border-dashed border-stroke bg-white/60 p-4 text-sm text-brown-600">
            Activity timeline, notes, tasks and files for this contact appear on
            the full profile and land fully in a later phase.
          </div>
        </div>
      </div>
    </div>
  );
}
