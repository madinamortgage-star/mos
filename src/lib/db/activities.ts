/**
 * Activities (timeline) data layer.
 *
 * SERVER-ONLY — uses the Supabase server client. See note in `contacts.ts`.
 * Placeholder-aware: returns empty when Supabase isn't configured.
 *
 * TODO(Phase 3): a `logActivity()` writer used by every mutation (and ideally a
 * DB trigger for `stage_change` / `field_change` so the timeline can't drift),
 * plus pagination.
 */

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ActivityRow, ActivityType, Uuid } from "./types";

const DEFAULT_LIMIT = 100;

export type ListActivitiesOptions = {
  orgId: Uuid;
  contactId?: Uuid;
  loanId?: Uuid;
  partnerId?: Uuid;
  companyId?: Uuid;
  types?: ActivityType[];
  limit?: number;
};

export async function listActivities(opts: ListActivitiesOptions): Promise<ActivityRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("activities")
    .select("*")
    .eq("org_id", opts.orgId)
    .order("occurred_at", { ascending: false })
    .limit(opts.limit ?? DEFAULT_LIMIT);

  if (opts.contactId) query = query.eq("contact_id", opts.contactId);
  if (opts.loanId) query = query.eq("loan_id", opts.loanId);
  if (opts.partnerId) query = query.eq("partner_id", opts.partnerId);
  if (opts.companyId) query = query.eq("company_id", opts.companyId);
  if (opts.types && opts.types.length > 0) query = query.in("activity_type", opts.types);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as ActivityRow[];
}
