"use client";

import Link from "next/link";
import { formatDate, formatMoney, formatRate, loanTitle } from "@/lib/loans/format";
import type { LoanRow } from "@/lib/db/types";
import { LoanPurposeBadge, LoanStatusBadge, LoanTemperatureBadge } from "./loan-badges";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stroke/60 py-1.5 last:border-0">
      <span className="text-xs text-brown-500">{label}</span>
      <span className="text-right text-sm text-ink-900">{value || "—"}</span>
    </div>
  );
}

export function LoanDrawer({
  loan,
  borrowerName,
  onClose,
}: {
  loan: LoanRow | null;
  borrowerName?: string | null;
  onClose: () => void;
}) {
  if (!loan) return null;

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
          {loan.contact_id && (
            <Link href={`/contacts/${loan.contact_id}`} className="text-xs font-medium text-navy-700">
              Open borrower →
            </Link>
          )}
        </div>

        <div className="px-5 py-5">
          <div className="text-lg font-bold text-ink-900">{loanTitle(loan, borrowerName)}</div>
          <div className="font-mono text-xs text-brown-500">{loan.id}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <LoanStatusBadge value={loan.status} />
            {loan.loan_purpose && <LoanPurposeBadge value={loan.loan_purpose} />}
            {loan.temperature && <LoanTemperatureBadge value={loan.temperature} />}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {(
              [
                ["Loan amount", formatMoney(loan.amount)],
                ["Property value", formatMoney(loan.property_value)],
                ["Interest rate", formatRate(loan.interest_rate)],
                ["Down payment", formatMoney(loan.down_payment)],
                ["Expected revenue", formatMoney(loan.expected_revenue)],
                ["Commission", formatMoney(loan.commission)],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-stroke bg-white px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-brown-500">{label}</div>
                <div className="mt-0.5 font-mono text-sm text-ink-900">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-stroke bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-ink-900">Loan details</div>
            <Field label="Borrower" value={borrowerName ?? (loan.contact_id ? "Linked contact" : null)} />
            <Field label="Lender" value={loan.lender} />
            <Field label="Loan type" value={loan.loan_type} />
            <Field label="Loan number" value={loan.loan_number} />
            <Field label="Application date" value={formatDate(loan.application_date)} />
            <Field label="Est. close date" value={formatDate(loan.estimated_close_date)} />
            <Field label="Funded date" value={formatDate(loan.funded_date)} />
            <Field label="Rate lock expires" value={formatDate(loan.rate_lock_expires_at)} />
            <Field label="Next follow-up" value={formatDate(loan.next_follow_up_at)} />
            <Field label="Created" value={formatDate(loan.created_at)} />
            <Field label="Updated" value={formatDate(loan.updated_at)} />
          </div>

          {loan.notes && (
            <div className="mt-5 rounded-lg border border-stroke bg-white p-4">
              <div className="mb-1 text-sm font-semibold text-ink-900">Notes</div>
              <div className="text-sm text-brown-700">{loan.notes}</div>
            </div>
          )}

          <div className="mt-5 rounded-lg border border-dashed border-stroke bg-white/60 p-4 text-sm text-brown-600">
            Drag-and-drop stage changes, tasks, documents and the activity
            timeline for this loan land in a later phase.
          </div>
        </div>
      </div>
    </div>
  );
}
