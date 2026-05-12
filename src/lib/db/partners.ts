/**
 * Partners data layer.
 *
 * SERVER-ONLY — uses the Supabase server client. Placeholder-aware: returns
 * empty/null when Supabase isn't configured.
 *
 * TODO(Phase 3+): create/update/delete helpers, an `activities` row written on
 * each touch, and — once referral tracking has a first-class column or table
 * (e.g. `loans.referring_partner_id` or a `referrals` table) — exact referral
 * stats here instead of deriving them in `lib/partners/stats.ts`.
 */

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { PartnerRow, PartnerStatus, PartnerType, Uuid } from "./types";

export type ListPartnersOptions = {
  orgId: Uuid;
  status?: PartnerStatus;
  type?: PartnerType;
  limit?: number;
};

export async function listPartners(opts: ListPartnersOptions): Promise<PartnerRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("partners")
    .select("*")
    .eq("org_id", opts.orgId)
    .order("name", { ascending: true })
    .limit(opts.limit ?? 300);

  if (opts.status) query = query.eq("status", opts.status);
  if (opts.type) query = query.eq("partner_type", opts.type);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as PartnerRow[];
}

export async function getPartner(orgId: Uuid, id: Uuid): Promise<PartnerRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as PartnerRow;
}
