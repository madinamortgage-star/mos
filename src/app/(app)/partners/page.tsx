import type { BoardGroup } from "@/components/board/board-types";
import { MondayBoard } from "@/components/board/monday-board";
import { PageHeader } from "@/components/page-header";
import { NewPartnerButton } from "@/components/partners/new-partner-button";
import { PARTNER_STATUS_GROUP_ORDER, partnerStatusGroupColor, partnerToBoardItem } from "@/lib/board/build";
import { getCompaniesByIds } from "@/lib/db/companies";
import { listContacts } from "@/lib/db/contacts";
import { listLoans } from "@/lib/db/loans";
import { listPartners } from "@/lib/db/partners";
import type { ContactRow, LoanRow, PartnerRow } from "@/lib/db/types";
import { formatCompactMoney } from "@/lib/loans/format";
import { getOrgContext } from "@/lib/org";
import { PARTNER_STATUS_META } from "@/lib/partners/format";
import { EMPTY_PARTNER_STATS, computePartnerStats } from "@/lib/partners/stats";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function PartnersPage() {
  const configured = isSupabaseConfigured();
  const { currentOrg } = await getOrgContext();

  let partners: PartnerRow[] = [];
  let contacts: ContactRow[] = [];
  let loans: LoanRow[] = [];
  const companyNames: Record<string, string> = {};
  let loadError: string | null = null;

  if (configured && currentOrg) {
    try {
      [partners, contacts, loans] = await Promise.all([
        listPartners({ orgId: currentOrg.id, limit: 500 }),
        listContacts({ orgId: currentOrg.id, limit: 500 }),
        listLoans({ orgId: currentOrg.id, limit: 500 }),
      ]);
      const companyIds = [
        ...new Set(partners.map((p) => p.company_id).filter((id): id is string => Boolean(id))),
      ];
      const companies = await getCompaniesByIds(currentOrg.id, companyIds);
      for (const [id, c] of companies) companyNames[id] = c.name;
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load partners.";
    }
  }

  // TODO(referral tracking): derived from contacts.partner_id + their loans.
  // A `loans.referring_partner_id` column or a `referrals` table would make
  // these exact + indexable; see lib/partners/stats.ts.
  const stats = computePartnerStats(partners, contacts, loans);

  const groups: BoardGroup[] = PARTNER_STATUS_GROUP_ORDER.map((status) => ({
    key: status,
    title: `${PARTNER_STATUS_META[status].label} partners`,
    color: partnerStatusGroupColor(status),
    defaultCollapsed: status === "inactive",
    items: partners
      .filter((p) => p.status === status)
      .map((p) =>
        partnerToBoardItem(
          p,
          p.company_id ? companyNames[p.company_id] : undefined,
          stats.get(p.id) ?? EMPTY_PARTNER_STATS,
          status,
        ),
      ),
  }));

  const allStats = [...stats.values()];
  const totalReferrals = allStats.reduce((n, s) => n + s.referralCount, 0);
  const activeLoansReferred = allStats.reduce((n, s) => n + s.activeLoansReferred, 0);
  const closedVolumeReferred = allStats.reduce((n, s) => n + s.closedVolume, 0);

  return (
    <div className="flex h-full flex-col">
      <PageHeader crumb="Workspace" title="Partners" right={<NewPartnerButton disabled={!configured} />} />

      {!configured && (
        <div className="border-b border-stroke bg-beige-100 px-8 py-2 text-xs text-brown-700">
          Placeholder mode — add Supabase keys to <code className="font-mono">.env.local</code> and apply the
          migrations (and optionally <code className="font-mono">supabase/seed.sql</code>) to see live partners.
        </div>
      )}

      <div className="min-h-0 flex-1">
        {loadError ? (
          <div className="m-8 rounded-lg border border-red-400/40 bg-red-50 p-4 text-sm text-red-600">
            Couldn’t load partners: {loadError}
          </div>
        ) : (
          <MondayBoard
            groups={groups}
            summaryCards={[
              { label: "Partners", value: String(partners.length) },
              { label: "Total referrals", value: String(totalReferrals) },
              { label: "Active loans referred", value: String(activeLoansReferred) },
              { label: "Closed volume referred", value: formatCompactMoney(closedVolumeReferred) },
            ]}
            searchPlaceholder="Search partner, email, type…"
            emptyTitle="No partners yet"
            emptyDescription="Add referral partners — agents, lenders, title/escrow, advisors — to track referrals and stay in touch."
            placeholderMode={!configured}
          />
        )}
      </div>
    </div>
  );
}
