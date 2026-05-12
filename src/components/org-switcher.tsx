"use client";

import { useTransition } from "react";
import { setActiveOrgAction } from "@/lib/actions/org";
import type { Org } from "@/lib/org";

/**
 * Basic placeholder org switcher — a `<select>` that persists the choice in a
 * cookie. A real version would be a dropdown with org avatars, a "create
 * organization" entry, and an invite flow (later phase).
 */
export function OrgSwitcher({ orgs, currentOrg }: { orgs: Org[]; currentOrg: Org | null }) {
  const [pending, startTransition] = useTransition();

  if (orgs.length === 0) {
    return (
      <div className="mx-4 mb-3 text-xs text-brown-500 border border-dashed border-stroke rounded-md px-3 py-2">
        No organization yet
      </div>
    );
  }

  return (
    <div className="mx-4 mb-3">
      <label htmlFor="org-switcher" className="sr-only">
        Organization
      </label>
      <select
        id="org-switcher"
        value={currentOrg?.id ?? orgs[0].id}
        disabled={pending || orgs.length < 2}
        onChange={(e) => {
          const id = e.target.value;
          startTransition(() => setActiveOrgAction(id));
        }}
        className="w-full bg-white border border-stroke rounded-md px-2.5 py-1.5 text-sm text-ink-900 disabled:opacity-70"
      >
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {/* TODO: "+ Create organization" entry and teammate invites in a later phase. */}
    </div>
  );
}
