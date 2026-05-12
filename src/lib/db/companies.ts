/**
 * Companies data layer.
 *
 * SERVER-ONLY — uses the Supabase server client. Placeholder-aware: returns
 * empty when Supabase isn't configured.
 */

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { CompanyRow, Uuid } from "./types";

export async function listCompanies(orgId: Uuid, limit = 300): Promise<CompanyRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("org_id", orgId)
    .order("name", { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data as CompanyRow[];
}

/** Fetch companies by id, keyed by id. Used to resolve names for partners/contacts. */
export async function getCompaniesByIds(orgId: Uuid, ids: Uuid[]): Promise<Map<Uuid, CompanyRow>> {
  const out = new Map<Uuid, CompanyRow>();
  if (ids.length === 0 || !isSupabaseConfigured()) return out;
  const supabase = await createClient();
  if (!supabase) return out;

  const { data, error } = await supabase.from("companies").select("*").eq("org_id", orgId).in("id", ids);
  if (error || !data) return out;
  for (const row of data as CompanyRow[]) out.set(row.id, row);
  return out;
}
