import Link from "next/link";
import { LifecycleBadge, PriorityBadge, StatusBadge, TagList } from "@/components/contacts/badges";
import { PageHeader } from "@/components/page-header";
import { contactDisplayName, contactInitials, formatDate } from "@/lib/contacts/format";
import { listActivities } from "@/lib/db/activities";
import { getContact } from "@/lib/db/contacts";
import { getOrgContext } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const configured = isSupabaseConfigured();
  const { currentOrg } = await getOrgContext();

  const contact = configured && currentOrg ? await getContact(currentOrg.id, id) : null;
  const activities =
    contact && currentOrg ? await listActivities({ orgId: currentOrg.id, contactId: id, limit: 30 }) : [];

  const location = contact
    ? [contact.address, contact.city, contact.state, contact.postal_code].filter(Boolean).join(", ")
    : "";

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        crumb="Contacts"
        title={contact ? contactDisplayName(contact) : "Contact"}
        right={
          <Link href="/contacts" className="text-sm text-navy-700 hover:underline">
            ← All contacts
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-8">
        {!configured ? (
          <div className="rounded-lg border border-stroke bg-beige-100 p-6 text-sm text-brown-700">
            Placeholder mode — connect Supabase and apply the migrations to view contact{" "}
            <span className="font-mono">{id}</span>.
          </div>
        ) : !contact ? (
          <div className="rounded-lg border border-stroke bg-white p-6 text-sm text-brown-700">
            Contact not found, or it doesn’t belong to your organization.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-lg border border-stroke bg-white p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-700 font-semibold text-beige-100">
                    {contactInitials(contact)}
                  </span>
                  <div>
                    <div className="text-xl font-bold text-ink-900">{contactDisplayName(contact)}</div>
                    <div className="font-mono text-xs text-brown-500">{contact.id}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <LifecycleBadge value={contact.lifecycle} />
                      <StatusBadge value={contact.status} />
                      <PriorityBadge value={contact.priority} />
                    </div>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  {(
                    [
                      ["Email", contact.email],
                      ["Phone", contact.phone],
                      ["Mobile", contact.mobile_phone],
                      ["Source", contact.source],
                      ["Location", location],
                      ["Birthday", formatDate(contact.birthday)],
                      ["Next follow-up", formatDate(contact.next_follow_up_at)],
                      ["Last contacted", formatDate(contact.last_contacted_at)],
                      ["Created", formatDate(contact.created_at)],
                      ["Updated", formatDate(contact.updated_at)],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3 border-b border-stroke/50 py-1.5">
                      <dt className="text-brown-500">{label}</dt>
                      <dd className="text-right text-ink-900">{value || "—"}</dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-3 py-1.5 sm:col-span-2">
                    <dt className="text-brown-500">Tags</dt>
                    <dd>
                      <TagList tags={contact.tags} />
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-dashed border-stroke bg-white/60 p-4 text-sm text-brown-600">
                Notes, tasks, files and pipeline links for this contact land in a later phase.
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-ink-900">Activity</div>
              {activities.length === 0 ? (
                <div className="rounded-lg border border-dashed border-stroke bg-white/60 p-4 text-sm text-brown-600">
                  No activity logged yet.
                </div>
              ) : (
                <ol className="space-y-3">
                  {activities.map((a) => (
                    <li key={a.id} className="rounded-lg border border-stroke bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-brown-500">
                          {a.activity_type}
                        </span>
                        <span className="text-xs text-brown-400">{formatDate(a.occurred_at)}</span>
                      </div>
                      {a.subject && <div className="mt-1 text-sm font-medium text-ink-900">{a.subject}</div>}
                      {a.body && <div className="mt-0.5 text-sm text-brown-700">{a.body}</div>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
