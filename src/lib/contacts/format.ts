/**
 * Pure presentation helpers for contacts. No server-only imports — safe to use
 * from both Server and Client Components.
 */

import type { ContactLifecycle, ContactStatus, PriorityLevel } from "@/lib/db/types";

type NameParts = {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

export function contactDisplayName(c: NameParts): string {
  const full = c.full_name?.trim();
  if (full) return full;
  const joined = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  if (joined) return joined;
  return c.email ?? "Unnamed contact";
}

export function contactInitials(c: NameParts): string {
  const name = contactDisplayName(c);
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return "?";
}

/** Deterministic date formatting (fixed locale + UTC) to avoid hydration drift. */
const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return DATE_FMT.format(d);
}

// --- badge metadata ----------------------------------------------------------

export const LIFECYCLE_META: Record<ContactLifecycle, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-navy-500/10 text-navy-700 ring-1 ring-navy-500/30" },
  prospect: { label: "Prospect", className: "bg-brown-500/10 text-brown-700 ring-1 ring-brown-500/30" },
  active: { label: "Active", className: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30" },
  client: { label: "Client", className: "bg-green-600/10 text-green-700 ring-1 ring-green-600/30" },
  past_client: { label: "Past Client", className: "bg-green-900/10 text-green-900 ring-1 ring-green-900/30" },
  partner: { label: "Partner", className: "bg-purple-500/10 text-purple-700 ring-1 ring-purple-500/30" },
  archived: { label: "Archived", className: "bg-ink-300/20 text-ink-500 ring-1 ring-ink-300/40" },
};

export const STATUS_META: Record<ContactStatus, { label: string; dot: string; text: string }> = {
  new: { label: "New", dot: "bg-navy-500", text: "text-navy-700" },
  hot: { label: "Hot", dot: "bg-red-600", text: "text-red-600" },
  warm: { label: "Warm", dot: "bg-amber-500", text: "text-amber-700" },
  cool: { label: "Cool", dot: "bg-navy-500", text: "text-navy-600" },
  cold: { label: "Cold", dot: "bg-ink-300", text: "text-ink-500" },
};

export const PRIORITY_META: Record<PriorityLevel, { label: string; dot: string; text: string }> = {
  high: { label: "High", dot: "bg-red-500", text: "text-red-600" },
  medium: { label: "Medium", dot: "bg-amber-500", text: "text-amber-700" },
  low: { label: "Low", dot: "bg-ink-300", text: "text-ink-500" },
};

export const CONTACT_LIFECYCLE_FILTERS: { value: "" | ContactLifecycle; label: string }[] = [
  { value: "", label: "All" },
  { value: "lead", label: "Leads" },
  { value: "prospect", label: "Prospects" },
  { value: "active", label: "Active" },
  { value: "client", label: "Clients" },
  { value: "past_client", label: "Past clients" },
  { value: "partner", label: "Partners" },
];
