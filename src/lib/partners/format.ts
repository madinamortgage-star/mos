/**
 * Pure presentation helpers for partners. No server-only imports.
 */

import type { PartnerStatus, PartnerType } from "@/lib/db/types";

export const PARTNER_TYPE_META: Record<PartnerType, { label: string; className: string }> = {
  agent: { label: "Agent", className: "bg-navy-500/10 text-navy-700" },
  lender: { label: "Lender", className: "bg-purple-500/10 text-purple-700" },
  title: { label: "Title", className: "bg-amber-500/10 text-amber-700" },
  escrow: { label: "Escrow", className: "bg-green-700/10 text-green-800" },
  financial_advisor: { label: "Financial advisor", className: "bg-navy-600/10 text-navy-700" },
  builder: { label: "Builder", className: "bg-brown-500/10 text-brown-700" },
  attorney: { label: "Attorney", className: "bg-red-500/10 text-red-600" },
  other: { label: "Other", className: "bg-beige-200 text-brown-700" },
};

export const PARTNER_STATUS_META: Record<PartnerStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-600/10 text-green-700 ring-1 ring-green-600/30" },
  prospect: { label: "Prospect", className: "bg-navy-500/10 text-navy-700 ring-1 ring-navy-500/30" },
  inactive: { label: "Inactive", className: "bg-ink-300/20 text-ink-500 ring-1 ring-ink-300/40" },
};

export const PARTNER_TYPE_OPTIONS: { value: PartnerType; label: string }[] = (
  Object.keys(PARTNER_TYPE_META) as PartnerType[]
).map((value) => ({ value, label: PARTNER_TYPE_META[value].label }));

export const PARTNER_STATUS_OPTIONS: { value: PartnerStatus; label: string }[] = (
  Object.keys(PARTNER_STATUS_META) as PartnerStatus[]
).map((value) => ({ value, label: PARTNER_STATUS_META[value].label }));

export function partnerTypeLabel(t: PartnerType): string {
  return PARTNER_TYPE_META[t]?.label ?? t;
}
export function partnerStatusLabel(s: PartnerStatus): string {
  return PARTNER_STATUS_META[s]?.label ?? s;
}
