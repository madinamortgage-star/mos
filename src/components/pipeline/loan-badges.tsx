import { LOAN_PURPOSE_META, LOAN_STATUS_META, LOAN_TEMPERATURE_META } from "@/lib/loans/format";
import type { LoanPurpose, LoanStatus, LoanTemperature } from "@/lib/db/types";

const dash = <span className="text-ink-300">—</span>;

export function LoanStatusBadge({ value }: { value: LoanStatus | null | undefined }) {
  if (!value) return dash;
  const m = LOAN_STATUS_META[value] ?? { label: value, className: "bg-ink-300/20 text-ink-700 ring-1 ring-ink-300/40" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${m.className}`}>
      {m.label}
    </span>
  );
}

export function LoanTemperatureBadge({ value }: { value: LoanTemperature | null | undefined }) {
  if (!value) return dash;
  const m = LOAN_TEMPERATURE_META[value] ?? { label: value, dot: "bg-ink-300", text: "text-ink-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${m.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function LoanPurposeBadge({ value }: { value: LoanPurpose | null | undefined }) {
  if (!value) return dash;
  const m = LOAN_PURPOSE_META[value] ?? { label: value, className: "bg-beige-200 text-brown-700" };
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] ${m.className}`}>{m.label}</span>
  );
}
