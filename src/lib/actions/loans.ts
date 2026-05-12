"use server";

/**
 * Loan mutations (Server Actions).
 *
 * Reads live in `src/lib/db/loans.ts`; writes live here. Placeholder-aware:
 * without Supabase keys, returns a friendly message instead of hitting the DB.
 *
 * TODO(Phase 3+): move-stage (drag & drop) with an `activities` 'stage_change'
 * row, update / delete, borrower picker, owner assignment.
 */

import { revalidatePath } from "next/cache";
import { listPipelineStages, listPipelines } from "@/lib/db/pipelines";
import type { LoanPurpose, LoanStatus } from "@/lib/db/types";
import { getOrgContext } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CreateLoanState = { error?: string; ok?: boolean };

const PURPOSES = new Set<LoanPurpose>([
  "purchase",
  "refinance",
  "cash_out_refinance",
  "heloc",
  "construction",
  "reverse",
  "other",
]);

const STATUSES = new Set<LoanStatus>([
  "lead",
  "application",
  "processing",
  "underwriting",
  "approved",
  "clear_to_close",
  "funded",
  "closed",
  "denied",
  "withdrawn",
]);

export async function createLoanAction(
  _prevState: CreateLoanState,
  formData: FormData,
): Promise<CreateLoanState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase isn't configured yet — add your keys to .env.local to create loans." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase client unavailable." };

  const { currentOrg } = await getOrgContext();
  if (!currentOrg) return { error: "No active organization." };

  // Drop the new loan into the default pipeline's first stage (best effort).
  const pipelines = await listPipelines(currentOrg.id);
  const pipeline = pipelines.find((p) => p.is_default) ?? pipelines[0] ?? null;
  let stageId: string | null = null;
  if (pipeline) {
    const stages = await listPipelineStages(currentOrg.id, pipeline.id);
    stageId = stages[0]?.id ?? null;
  }

  const loanNumber = String(formData.get("loan_number") ?? "").trim();
  const lender = String(formData.get("lender") ?? "").trim();
  const amountCleaned = String(formData.get("amount") ?? "").replace(/[^0-9.]/g, "");
  const amount = amountCleaned ? Number(amountCleaned) : null;
  const purposeRaw = String(formData.get("loan_purpose") ?? "").trim();
  const loanPurpose = PURPOSES.has(purposeRaw as LoanPurpose) ? (purposeRaw as LoanPurpose) : null;
  const statusRaw = String(formData.get("status") ?? "lead").trim();
  const status: LoanStatus = STATUSES.has(statusRaw as LoanStatus) ? (statusRaw as LoanStatus) : "lead";

  if (!loanNumber && !lender && amount == null) {
    return { error: "Enter at least a loan number, lender, or amount." };
  }

  const { error } = await supabase.from("loans").insert({
    org_id: currentOrg.id,
    pipeline_id: pipeline?.id ?? null,
    stage_id: stageId,
    loan_number: loanNumber || null,
    lender: lender || null,
    amount: amount != null && !Number.isNaN(amount) ? amount : null,
    loan_purpose: loanPurpose,
    status,
  });
  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  return { ok: true };
}
