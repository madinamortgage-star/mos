"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CONTACT_LIFECYCLE_FILTERS } from "@/lib/contacts/format";

/**
 * Search + lifecycle filter bar. Drives the server query via URL params so the
 * page re-fetches through `listContacts` (which uses the `search_tsv` full-text
 * column). Reads current values from props rather than `useSearchParams`, so no
 * Suspense boundary is required.
 */
export function ContactsFilters({
  total,
  query,
  lifecycle,
}: {
  total: number;
  query: string;
  lifecycle: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(query);

  function navigate(nextQ: string, nextLifecycle: string) {
    const sp = new URLSearchParams();
    if (nextQ.trim()) sp.set("q", nextQ.trim());
    if (nextLifecycle) sp.set("lifecycle", nextLifecycle);
    const qs = sp.toString();
    startTransition(() => router.push(`/contacts${qs ? `?${qs}` : ""}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-stroke px-8 py-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(q, lifecycle);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${total} contact${total === 1 ? "" : "s"}…`}
          className="w-64 rounded-md border border-stroke bg-white px-3 py-1.5 text-sm outline-none focus:border-stroke-strong"
        />
      </form>

      <div className="flex flex-wrap items-center gap-1">
        {CONTACT_LIFECYCLE_FILTERS.map((o) => {
          const on = lifecycle === o.value;
          return (
            <button
              key={o.value || "all"}
              type="button"
              onClick={() => navigate(q, o.value)}
              className={`rounded-full px-2.5 py-1 text-xs ${
                on ? "bg-navy-900 text-beige-100" : "text-brown-700 hover:bg-beige-200"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {q && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            navigate("", lifecycle);
          }}
          className="text-xs text-brown-500 hover:text-ink-900"
        >
          Clear search
        </button>
      )}
      {pending && <span className="text-xs text-brown-500">Loading…</span>}
    </div>
  );
}
