/**
 * Loans data layer.
 *
 * SERVER-ONLY — uses the Supabase server client. See note in `contacts.ts`.
 * Placeholder-aware: returns empty/null when Supabase isn't configured.
 *
 * TODO(Phase 3): embedded selects (borrower contact, stage, owner profile),
 * board grouping by stage, and create/update/move-stage helpers that also write
 * an `activities` row of type 'stage_change'.
 */

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { LoanRow, LoanStatus, Uuid } from "./types";

const DEFAULT_LIMIT = 300;

export type ListLoansOptions = {
  orgId: Uuid;
  pipelineId?: Uuid;
  stageId?: Uuid;
  status?: LoanStatus;
  ownerId?: Uuid;
  contactId?: Uuid;
  limit?: number;
};

export async function listLoans(opts: ListLoansOptions): Promise<LoanRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("loans")
    .select("*")
    .eq("org_id", opts.orgId)
    .order("updated_at", { ascending: false })
    .limit(opts.limit ?? DEFAULT_LIMIT);

  if (opts.pipelineId) query = query.eq("pipeline_id", opts.pipelineId);
  if (opts.stageId) query = query.eq("stage_id", opts.stageId);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.ownerId) query = query.eq("owner_id", opts.ownerId);
  if (opts.contactId) query = query.eq("contact_id", opts.contactId);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as LoanRow[];
}

export async function getLoan(orgId: Uuid, id: Uuid): Promise<LoanRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as LoanRow;
}

/** Loans for a pipeline, bucketed by `stage_id` (key `"unassigned"` for null). */
export async function listLoansGroupedByStage(
  orgId: Uuid,
  pipelineId: Uuid,
): Promise<Record<string, LoanRow[]>> {
  const loans = await listLoans({ orgId, pipelineId });
  const grouped: Record<string, LoanRow[]> = {};
  for (const loan of loans) {
    const key = loan.stage_id ?? "unassigned";
    (grouped[key] ??= []).push(loan);
  }
  return grouped;
}
