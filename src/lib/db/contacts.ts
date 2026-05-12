/**
 * Contacts data layer.
 *
 * SERVER-ONLY — uses the Supabase server client (which reads `next/headers`).
 * Import only from Server Components / Route Handlers / Server Actions.
 *
 * Placeholder-aware: when Supabase isn't configured these return empty/null so
 * Phase 3 pages can render the shell without a backend.
 *
 * TODO(Phase 3): add embedded selects as the UI needs them, e.g.
 *   .select("*, company:companies(name), owner:profiles(full_name, avatar_url)")
 * and add insert/update/delete helpers + activity logging.
 */

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  ContactLifecycle,
  ContactRow,
  ContactStatus,
  PriorityLevel,
  Uuid,
} from "./types";

const DEFAULT_LIMIT = 200;

export type ListContactsOptions = {
  orgId: Uuid;
  search?: string;
  lifecycle?: ContactLifecycle;
  status?: ContactStatus;
  priority?: PriorityLevel;
  ownerId?: Uuid;
  /** Filter to contacts that share at least one of these tags. */
  tags?: string[];
  limit?: number;
};

export async function listContacts(opts: ListContactsOptions): Promise<ContactRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("contacts")
    .select("*")
    .eq("org_id", opts.orgId)
    .order("updated_at", { ascending: false })
    .limit(opts.limit ?? DEFAULT_LIMIT);

  if (opts.lifecycle) query = query.eq("lifecycle", opts.lifecycle);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.priority) query = query.eq("priority", opts.priority);
  if (opts.ownerId) query = query.eq("owner_id", opts.ownerId);
  if (opts.tags && opts.tags.length > 0) query = query.overlaps("tags", opts.tags);
  if (opts.search && opts.search.trim()) {
    // Matches the generated `search_tsv` column (built with the 'simple' config).
    query = query.textSearch("search_tsv", opts.search.trim(), {
      type: "websearch",
      config: "simple",
    });
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as ContactRow[];
}

export async function getContact(orgId: Uuid, id: Uuid): Promise<ContactRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as ContactRow;
}

export async function countContacts(orgId: Uuid): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = await createClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);

  if (error || count == null) return 0;
  return count;
}
