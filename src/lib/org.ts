/**
 * Organization (tenant) helpers.
 *
 * Placeholder mode (no Supabase keys): returns a single demo org so the app
 * shell renders. With real keys, reads the caller's memberships from
 * `org_members` joined to `organizations`.
 *
 * The "active org" is stored in a cookie and resolved against the user's
 * memberships (falling back to the first one) — see `resolveCurrentOrg`.
 */

import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

export type Org = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export const ACTIVE_ORG_COOKIE = "mos_active_org";

const PLACEHOLDER_ORG: Org = {
  id: "placeholder-org",
  name: "Demo Workspace",
  slug: "demo-workspace",
  role: "owner",
};

export async function getUserOrgs(): Promise<Org[]> {
  if (!isSupabaseConfigured()) return [PLACEHOLDER_ORG];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("org_members")
    .select("role, organizations ( id, name, slug )")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  // Without generated DB types, supabase-js infers the embedded relation as an
  // array even though `org_members.org_id -> organizations.id` is to-one. At
  // runtime it's a single object; normalise both shapes here.
  type MemberRow = {
    role: string;
    organizations: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
  };

  const orgs: Org[] = [];
  for (const row of data as unknown as MemberRow[]) {
    const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    if (!org) continue;
    orgs.push({ id: org.id, name: org.name, slug: org.slug, role: row.role });
  }
  return orgs;
}

export async function getActiveOrgId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? null;
}

/** Pick the active org from the user's memberships, defaulting to the first. */
export function resolveCurrentOrg(orgs: Org[], activeId: string | null): Org | null {
  if (orgs.length === 0) return null;
  return orgs.find((o) => o.id === activeId) ?? orgs[0];
}

/** Convenience: the user's orgs + the resolved active org in one call. */
export async function getOrgContext(): Promise<{ orgs: Org[]; currentOrg: Org | null }> {
  const orgs = await getUserOrgs();
  const activeId = await getActiveOrgId();
  return { orgs, currentOrg: resolveCurrentOrg(orgs, activeId) };
}
