import { formatCompactMoney } from "@/lib/loans/format";
import type { LoanRow } from "@/lib/db/types";
import { LoanCard } from "./loan-card";

export type BoardColumn = {
  id: string;
  name: string;
  color?: string | null;
  loans: LoanRow[];
};

export function PipelineColumn({
  column,
  borrowerNames,
  onOpenLoan,
}: {
  column: BoardColumn;
  borrowerNames: Record<string, string>;
  onOpenLoan: (loan: LoanRow) => void;
}) {
  const total = column.loans.reduce((sum, l) => sum + (l.amount ?? 0), 0);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-beige-100/70">
      <div className="flex items-center gap-2 border-b border-stroke px-3 py-2.5">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: column.color || "var(--navy-600)" }}
        />
        <span className="truncate text-sm font-semibold text-ink-900">{column.name}</span>
        <span className="ml-auto rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-brown-600">
          {column.loans.length}
        </span>
      </div>
      <div className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-wide text-brown-500">
        Volume <span className="font-mono text-brown-700">{formatCompactMoney(total)}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
        {column.loans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stroke bg-white/40 px-3 py-6 text-center text-xs text-brown-400">
            No loans
          </div>
        ) : (
          column.loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              borrowerName={loan.contact_id ? borrowerNames[loan.contact_id] : undefined}
              onClick={() => onOpenLoan(loan)}
            />
          ))
        )}
      </div>
    </div>
  );
}
