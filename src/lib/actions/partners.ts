"use server";

/**
 * Partner mutations (Server Actions).
 *
 * Reads live in `src/lib/db/partners.ts`; writes live here. Placeholder-aware:
 * without Supabase keys, returns a friendly message instead of hitting the DB.
 *
 * TODO(Phase 3+): update / delete, link to a company, log an `activities` row
 * on each touch, and a "log referral" action once referral tracking has a
 * first-class link.
 */

import { revalidatePath } from "next/cache";
import type { PartnerStatus, PartnerType } from "@/lib/db/types";
import { getOrgContext } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CreatePartnerState = { error?: string; ok?: boolean };

const TYPES = new Set<PartnerType>([
  "agent",
  "lender",
  "title",
  "escrow",
  "financial_advisor",
  "builder",
  "attorney",
  "other",
]);
const STATUSES = new Set<PartnerStatus>(["prospect", "active", "inactive"]);

export async function createPartnerAction(
  _prevState: CreatePartnerState,
  formData: FormData,
): Promise<CreatePartnerState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase isn't configured yet — add your keys to .env.local to create partners." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase client unavailable." };

  const { currentOrg } = await getOrgContext();
  if (!currentOrg) return { error: "No active organization." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const tier = String(formData.get("tier") ?? "").trim();
  const typeRaw = String(formData.get("partner_type") ?? "other").trim();
  const partnerType: PartnerType = TYPES.has(typeRaw as PartnerType) ? (typeRaw as PartnerType) : "other";
  const statusRaw = String(formData.get("status") ?? "prospect").trim();
  const status: PartnerStatus = STATUSES.has(statusRaw as PartnerStatus) ? (statusRaw as PartnerStatus) : "prospect";

  if (!name) return { error: "A partner name is required." };

  const { error } = await supabase.from("partners").insert({
    org_id: currentOrg.id,
    name,
    email: email || null,
    phone: phone || null,
    tier: tier || null,
    partner_type: partnerType,
    status,
  });
  if (error) return { error: error.message };

  revalidatePath("/partners");
  return { ok: true };
}
