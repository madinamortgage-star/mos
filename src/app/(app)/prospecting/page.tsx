import { PageHeader } from "@/components/page-header";
import { ProspectQueue } from "@/components/prospecting/prospect-queue";
import { listContacts } from "@/lib/db/contacts";
import { listLoans } from "@/lib/db/loans";
import type { ContactRow, LoanRow } from "@/lib/db/types";
import { getOrgContext } from "@/lib/org";
import { buildProspectQueue } from "@/lib/prospecting/queue";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function ProspectingPage() {
  const configured = isSupabaseConfigured();
  const { currentOrg } = await getOrgContext();

  let contacts: ContactRow[] = [];
  let loans: LoanRow[] = [];
  let loadError: string | null = null;

  if (configured && currentOrg) {
    try {
      [contacts, loans] = await Promise.all([
        listContacts({ orgId: currentOrg.id, limit: 500 }),
        listLoans({ orgId: currentOrg.id, limit: 500 }),
      ]);
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load the call queue.";
    }
  }

  // Built server-side so "now" is the server's clock and the client just renders strings.
  const groups = buildProspectQueue(contacts, loans, Date.now());

  return (
    <div className="flex h-full flex-col">
      <PageHeader crumb="Daily call system" title="Prospecting" />

      {!configured && (
        <div className="border-b border-stroke bg-beige-100 px-8 py-2 text-xs text-brown-700">
          Placeholder mode — add Supabase keys to <code className="font-mono">.env.local</code> and apply the
          migrations (and optionally <code className="font-mono">supabase/seed.sql</code>) to build a live call queue.
        </div>
      )}

      <div className="min-h-0 flex-1">
        {loadError ? (
          <div className="m-8 rounded-lg border border-red-400/40 bg-red-50 p-4 text-sm text-red-600">
            Couldn’t load the call queue: {loadError}
          </div>
        ) : (
          <ProspectQueue groups={groups} placeholderMode={!configured} />
        )}
      </div>
    </div>
  );
}
