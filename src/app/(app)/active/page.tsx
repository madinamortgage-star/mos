import type { BoardGroup } from "@/components/board/board-types";
import { MondayBoard } from "@/components/board/monday-board";
import { PageHeader } from "@/components/page-header";
import { NewLoanButton } from "@/components/pipeline/new-loan-button";
import { ACTIVE_LOAN_STATUSES, loanStatusGroupColor, loanToBoardItem } from "@/lib/board/build";
import { contactDisplayName } from "@/lib/contacts/format";
import { getContactsByIds } from "@/lib/db/contacts";
import { listLoans } from "@/lib/db/loans";
import type { LoanRow } from "@/lib/db/types";
import { LOAN_STATUS_META, formatCompactMoney } from "@/lib/loans/format";
import { getOrgContext } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function ActiveLeadsPage() {
  const configured = isSupabaseConfigured();
  const { currentOrg } = await getOrgContext();

  let loans: LoanRow[] = [];
  const borrowerNames: Record<string, string> = {};
  let loadError: string | null = null;

  if (configured && currentOrg) {
    try {
      const all = await listLoans({ orgId: currentOrg.id, limit: 500 });
      loans = all.filter((l) => ACTIVE_LOAN_STATUSES.includes(l.status));
      const ids = [...new Set(loans.map((l) => l.contact_id).filter((id): id is string => Boolean(id)))];
      const contacts = await getContactsByIds(currentOrg.id, ids);
      for (const [id, c] of contacts) borrowerNames[id] = contactDisplayName(c);
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load active leads.";
    }
  }

  const groups: BoardGroup[] = ACTIVE_LOAN_STATUSES.map((status) => ({
    key: status,
    title: LOAN_STATUS_META[status].label,
    color: loanStatusGroupColor(status),
    items: loans
      .filter((l) => l.status === status)
      .map((l) => loanToBoardItem(l, l.contact_id ? borrowerNames[l.contact_id] : undefined, status)),
  }));

  const totalVolume = loans.reduce((s, l) => s + (l.amount ?? 0), 0);
  const totalRevenue = loans.reduce((s, l) => s + (l.expected_revenue ?? 0), 0);
  const totalCommission = loans.reduce((s, l) => s + (l.commission ?? 0), 0);

  return (
    <div className="flex h-full flex-col">
      <PageHeader crumb="Active workspace" title="Active Leads" right={<NewLoanButton disabled={!configured} />} />

      {!configured && (
        <div className="border-b border-stroke bg-beige-100 px-8 py-2 text-xs text-brown-700">
          Placeholder mode — add Supabase keys to <code className="font-mono">.env.local</code> and apply the
          migrations (and optionally <code className="font-mono">supabase/seed.sql</code>) to see live leads.
        </div>
      )}

      <div className="min-h-0 flex-1">
        {loadError ? (
          <div className="m-8 rounded-lg border border-red-400/40 bg-red-50 p-4 text-sm text-red-600">
            Couldn’t load active leads: {loadError}
          </div>
        ) : (
          <MondayBoard
            groups={groups}
            summaryCards={[
              { label: "Active loans", value: String(loans.length) },
              { label: "Pipeline volume", value: formatCompactMoney(totalVolume) },
              { label: "Projected revenue", value: formatCompactMoney(totalRevenue) },
              { label: "Commission", value: formatCompactMoney(totalCommission) },
            ]}
            searchPlaceholder="Search borrower, lender, loan #…"
            emptyTitle="No active leads yet"
            emptyDescription="Add a loan to get started, or check the Loan Pipeline board."
            placeholderMode={!configured}
          />
        )}
      </div>
    </div>
  );
}
