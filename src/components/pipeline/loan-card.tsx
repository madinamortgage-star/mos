import { formatDate, formatMoney, loanTitle } from "@/lib/loans/format";
import type { LoanRow } from "@/lib/db/types";
import { LoanPurposeBadge, LoanStatusBadge, LoanTemperatureBadge } from "./loan-badges";

export function LoanCard({
  loan,
  borrowerName,
  onClick,
}: {
  loan: LoanRow;
  borrowerName?: string | null;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-stroke bg-white p-3 text-left shadow-sm transition hover:border-stroke-strong hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink-900">{loanTitle(loan, borrowerName)}</div>
          {loan.lender && <div className="truncate text-xs text-brown-500">{loan.lender}</div>}
        </div>
        <div className="shrink-0 font-mono text-sm text-ink-900">{formatMoney(loan.amount)}</div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <LoanStatusBadge value={loan.status} />
        {loan.loan_purpose && <LoanPurposeBadge value={loan.loan_purpose} />}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-brown-500">
        <span className="flex items-center gap-1.5">
          {loan.temperature ? <LoanTemperatureBadge value={loan.temperature} /> : <span className="text-ink-300">—</span>}
        </span>
        {loan.next_follow_up_at && <span>Follow up {formatDate(loan.next_follow_up_at)}</span>}
      </div>
    </button>
  );
}
