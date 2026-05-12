/**
 * Pure presentation helpers for loans / the pipeline board. No server-only
 * imports — safe to use from Server and Client Components.
 */

import type { LoanPurpose, LoanRow, LoanStatus, LoanTemperature } from "@/lib/db/types";

const MONEY_FMT = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function formatMoney(n?: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return MONEY_FMT.format(Math.round(n));
}

/** Compact money for column headers etc. — "$1.2M" / "$815K" / "$0". */
export function formatCompactMoney(n?: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

export function formatRate(n?: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n}%`;
}

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return SHORT_DATE.format(d);
}

export function loanTitle(loan: Pick<LoanRow, "id" | "loan_number">, borrowerName?: string | null): string {
  if (borrowerName?.trim()) return borrowerName.trim();
  if (loan.loan_number?.trim()) return loan.loan_number.trim();
  return `Loan ${loan.id.slice(0, 8)}`;
}

// --- badge metadata ----------------------------------------------------------

export const LOAN_STATUS_META: Record<LoanStatus, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-navy-500/10 text-navy-700 ring-1 ring-navy-500/30" },
  application: { label: "Application", className: "bg-navy-600/10 text-navy-700 ring-1 ring-navy-600/30" },
  processing: { label: "Processing", className: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30" },
  underwriting: { label: "Underwriting", className: "bg-amber-600/10 text-amber-800 ring-1 ring-amber-600/30" },
  approved: { label: "Approved", className: "bg-green-600/10 text-green-700 ring-1 ring-green-600/30" },
  clear_to_close: { label: "Clear to Close", className: "bg-green-700/10 text-green-800 ring-1 ring-green-700/30" },
  funded: { label: "Funded", className: "bg-green-900/10 text-green-900 ring-1 ring-green-900/30" },
  closed: { label: "Closed", className: "bg-ink-300/20 text-ink-700 ring-1 ring-ink-300/40" },
  denied: { label: "Denied", className: "bg-red-600/10 text-red-600 ring-1 ring-red-600/30" },
  withdrawn: { label: "Withdrawn", className: "bg-brown-500/10 text-brown-700 ring-1 ring-brown-500/30" },
};

export const LOAN_TEMPERATURE_META: Record<LoanTemperature, { label: string; dot: string; text: string }> = {
  hot: { label: "Hot", dot: "bg-red-600", text: "text-red-600" },
  warm: { label: "Warm", dot: "bg-amber-500", text: "text-amber-700" },
  cool: { label: "Cool", dot: "bg-navy-500", text: "text-navy-600" },
  stalled: { label: "Stalled", dot: "bg-brown-500", text: "text-brown-600" },
  ok: { label: "On track", dot: "bg-green-600", text: "text-green-700" },
};

export const LOAN_PURPOSE_META: Record<LoanPurpose, { label: string; className: string }> = {
  purchase: { label: "Purchase", className: "bg-navy-500/10 text-navy-700" },
  refinance: { label: "Refinance", className: "bg-purple-500/10 text-purple-700" },
  cash_out_refinance: { label: "Cash-out Refi", className: "bg-purple-600/10 text-purple-800" },
  heloc: { label: "HELOC", className: "bg-amber-500/10 text-amber-700" },
  construction: { label: "Construction", className: "bg-brown-500/10 text-brown-700" },
  reverse: { label: "Reverse", className: "bg-ink-300/20 text-ink-700" },
  other: { label: "Other", className: "bg-beige-200 text-brown-700" },
};

export const LOAN_PURPOSE_OPTIONS: { value: LoanPurpose; label: string }[] = (
  Object.keys(LOAN_PURPOSE_META) as LoanPurpose[]
).map((value) => ({ value, label: LOAN_PURPOSE_META[value].label }));

export const LOAN_STATUS_OPTIONS: { value: LoanStatus; label: string }[] = (
  Object.keys(LOAN_STATUS_META) as LoanStatus[]
).map((value) => ({ value, label: LOAN_STATUS_META[value].label }));
