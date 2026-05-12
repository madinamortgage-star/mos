import { ContactsBoard } from "@/components/contacts/contacts-board";
import { ContactsFilters } from "@/components/contacts/contacts-filters";
import { NewContactButton } from "@/components/contacts/new-contact-button";
import { PageHeader } from "@/components/page-header";
import { listContacts } from "@/lib/db/contacts";
import type { ContactLifecycle, ContactRow, ContactStatus, PriorityLevel } from "@/lib/db/types";
import { getOrgContext } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const LIFECYCLES = new Set<ContactLifecycle>([
  "lead",
  "prospect",
  "active",
  "client",
  "past_client",
  "partner",
  "archived",
]);
const STATUSES = new Set<ContactStatus>(["new", "hot", "warm", "cool", "cold"]);
const PRIORITIES = new Set<PriorityLevel>(["high", "medium", "low"]);

type SearchParams = {
  q?: string;
  lifecycle?: string;
  status?: string;
  priority?: string;
};

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const configured = isSupabaseConfigured();
  const { currentOrg } = await getOrgContext();

  const search = sp.q?.trim() || undefined;
  const lifecycle =
    sp.lifecycle && LIFECYCLES.has(sp.lifecycle as ContactLifecycle)
      ? (sp.lifecycle as ContactLifecycle)
      : undefined;
  const status =
    sp.status && STATUSES.has(sp.status as ContactStatus) ? (sp.status as ContactStatus) : undefined;
  const priority =
    sp.priority && PRIORITIES.has(sp.priority as PriorityLevel) ? (sp.priority as PriorityLevel) : undefined;

  let contacts: ContactRow[] = [];
  let loadError: string | null = null;
  if (configured && currentOrg) {
    try {
      contacts = await listContacts({ orgId: currentOrg.id, search, lifecycle, status, priority });
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to load contacts.";
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader crumb="Workspace" title="Contacts" right={<NewContactButton disabled={!configured} />} />

      {!configured && (
        <div className="border-b border-stroke bg-beige-100 px-8 py-2 text-xs text-brown-700">
          Placeholder mode — add Supabase keys to <code className="font-mono">.env.local</code> and apply the
          migrations to see live contacts.
        </div>
      )}

      <ContactsFilters total={contacts.length} query={search ?? ""} lifecycle={lifecycle ?? ""} />

      <div className="min-h-0 flex-1 overflow-auto">
        {loadError ? (
          <div className="m-8 rounded-lg border border-red-400/40 bg-red-50 p-4 text-sm text-red-600">
            Couldn’t load contacts: {loadError}
          </div>
        ) : (
          <ContactsBoard contacts={contacts} placeholderMode={!configured} />
        )}
      </div>
    </div>
  );
}
