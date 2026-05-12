import type { BoardGroup } from "@/components/board/board-types";
import { MondayBoard } from "@/components/board/monday-board";
import { NewContactButton } from "@/components/contacts/new-contact-button";
import { PageHeader } from "@/components/page-header";
import { PAST_CONTACT_STATUSES, contactStatusGroupColor, contactToBoardItem } from "@/lib/board/build";
import { listContacts } from "@/lib/db/contacts";
import type { ContactRow, ContactStatus } from "@/lib/db/types";
import { getOrgContext } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const GROUP_TITLE: Record<ContactStatus, string> = {
  hot: "Hot — refi-likely",
  warm: "Warm — stay in touch",
  cool: "Cool",
  cold: "Cold — long-term nurture",
  new: "Recently added",
};

const DEFAULT_COLLAPSED: ReadonlySet<ContactStatus> = new Set<ContactStatus>(["cold", "new"]);

export default async function PastClientsPage() {
  const configured = isSupabaseConfigured();
  const { currentOrg } = await getOrgContext();

  let contacts: ContactRow[] = [];
  let loadError: string | null = null;

  if (configured && currentOrg) {
    try {
      contacts = await listContacts({ orgId: currentOrg.id, lifecycle: "past_client", limit: 500 });
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load past clients.";
    }
  }

  const groups: BoardGroup[] = PAST_CONTACT_STATUSES.map((status) => ({
    key: status,
    title: GROUP_TITLE[status],
    color: contactStatusGroupColor(status),
    defaultCollapsed: DEFAULT_COLLAPSED.has(status),
    items: contacts.filter((c) => c.status === status).map((c) => contactToBoardItem(c, status)),
  }));

  const refiLikely = contacts.filter((c) => c.status === "hot").length;
  const withFollowUp = contacts.filter((c) => Boolean(c.next_follow_up_at)).length;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        crumb="Retention & reactivation"
        title="Past Clients"
        right={<NewContactButton disabled={!configured} />}
      />

      {!configured && (
        <div className="border-b border-stroke bg-beige-100 px-8 py-2 text-xs text-brown-700">
          Placeholder mode — add Supabase keys to <code className="font-mono">.env.local</code> and apply the
          migrations (and optionally <code className="font-mono">supabase/seed.sql</code>) to see live clients.
        </div>
      )}

      <div className="min-h-0 flex-1">
        {loadError ? (
          <div className="m-8 rounded-lg border border-red-400/40 bg-red-50 p-4 text-sm text-red-600">
            Couldn’t load past clients: {loadError}
          </div>
        ) : (
          <MondayBoard
            groups={groups}
            summaryCards={[
              { label: "Past clients", value: String(contacts.length) },
              { label: "Refi-likely (hot)", value: String(refiLikely) },
              { label: "With follow-up", value: String(withFollowUp) },
            ]}
            searchPlaceholder="Search name, email, tags…"
            emptyTitle="No past clients yet"
            emptyDescription="Contacts appear here once their lifecycle is set to Past Client."
            placeholderMode={!configured}
          />
        )}
      </div>
    </div>
  );
}
