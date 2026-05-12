import type { BoardGroup } from "@/components/board/board-types";
import { MondayBoard } from "@/components/board/monday-board";
import { PageHeader } from "@/components/page-header";
import { NewLoanButton } from "@/components/pipeline/new-loan-button";
import { PREAPPROVED_LOAN_STATUSES, loanStatusGroupColor, loanToBoardItem } from "@/lib/board/build";
import { contactDisplayName } from "@/lib/contacts/format";
import { getContactsByIds } from "@/lib/db/contacts";
import { listLoans } from "@/lib/db/loans";
import type { LoanRow } from "@/lib/db/types";
import { LOAN_STATUS_META, formatCompactMoney } from "@/lib/loans/format";
import { getOrgContext } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// TODO(domain): "pre-approved" maps here to loan_status in {approved, clear_to_close},
// the closest fit in the current loan_status enum. If the business wants a
// distinct "pre-approval issued" state, add it (status or a pipeline-stage flag)
// and update PREAPPROVED_LOAN_STATUSES.

export default async function PreApprovedPage() {
  const configured = isSupabaseConfigured();
  const { currentOrg } = await getOrgContext();

  let loans: LoanRow[] = [];
  const borrowerNames: Record<string, string> = {};
  let loadError: string | null = null;

  if (configured && currentOrg) {
    try {
      const all = await listLoans({ orgId: currentOrg.id, limit: 500 });
      loans = all.filter((l) => PREAPPROVED_LOAN_STATUSES.includes(l.status));
      const ids = [...new Set(loans.map((l) => l.contact_id).filter((id): id is string => Boolean(id)))];
      const contacts = await getContactsByIds(currentOrg.id, ids);
      for (const [id, c] of contacts) borrowerNames[id] = contactDisplayName(c);
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load pre-approved loans.";
    }
  }

  const groups: BoardGroup[] = PREAPPROVED_LOAN_STATUSES.map((status) => ({
    key: status,
    title: LOAN_STATUS_META[status].label,
    color: loanStatusGroupColor(status),
    items: loans
      .filter((l) => l.status === status)
      .map((l) => loanToBoardItem(l, l.contact_id ? borrowerNames[l.contact_id] : undefined, status)),
  }));

  const totalVolume = loans.reduce((s, l) => s + (l.amount ?? 0), 0);
  const totalRevenue = loans.reduce((s, l) => s + (l.expected_revenue ?? 0), 0);
  const rateLockSoon = loans.filter((l) => {
    if (!l.rate_lock_expires_at) return false;
    const d = new Date(l.rate_lock_expires_at);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() - Date.now() <= 14 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        crumb="Monday-style board"
        title="Pre-Approved Loans"
        right={<NewLoanButton disabled={!configured} />}
      />

      {!configured && (
        <div className="border-b border-stroke bg-beige-100 px-8 py-2 text-xs text-brown-700">
          Placeholder mode — add Supabase keys to <code className="font-mono">.env.local</code> and apply the
          migrations (and optionally <code className="font-mono">supabase/seed.sql</code>) to see live data.
        </div>
      )}

      <div className="min-h-0 flex-1">
        {loadError ? (
          <div className="m-8 rounded-lg border border-red-400/40 bg-red-50 p-4 text-sm text-red-600">
            Couldn’t load pre-approved loans: {loadError}
          </div>
        ) : (
          <MondayBoard
            groups={groups}
            summaryCards={[
              { label: "Pre-approved loans", value: String(loans.length) },
              { label: "Approved volume", value: formatCompactMoney(totalVolume) },
              { label: "Projected revenue", value: formatCompactMoney(totalRevenue) },
              { label: "Rate locks ≤ 14d", value: String(rateLockSoon) },
            ]}
            searchPlaceholder="Search borrower, lender, loan #…"
            emptyTitle="No pre-approved loans yet"
            emptyDescription="Loans reach this board once their status is Approved or Clear to Close."
            placeholderMode={!configured}
          />
        )}
      </div>
    </div>
  );
}
