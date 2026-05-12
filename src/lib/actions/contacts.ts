"use server";

/**
 * Contact mutations (Server Actions).
 *
 * Reads live in `src/lib/db/contacts.ts`; writes live here. Placeholder-aware:
 * without Supabase keys, returns a friendly message instead of hitting the DB.
 *
 * TODO(Phase 3+): update / delete / bulk actions, owner reassignment, and an
 * `activities` row written alongside each change.
 */

import { revalidatePath } from "next/cache";
import { getOrgContext } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CreateContactState = { error?: string; ok?: boolean };

const LIFECYCLES = new Set([
  "lead",
  "prospect",
  "active",
  "client",
  "past_client",
  "partner",
  "archived",
]);

export async function createContactAction(
  _prevState: CreateContactState,
  formData: FormData,
): Promise<CreateContactState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase isn't configured yet — add your keys to .env.local to create contacts." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase client unavailable." };

  const { currentOrg } = await getOrgContext();
  if (!currentOrg) return { error: "No active organization." };

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const lifecycleRaw = String(formData.get("lifecycle") ?? "lead").trim();
  const lifecycle = LIFECYCLES.has(lifecycleRaw) ? lifecycleRaw : "lead";

  if (!firstName && !lastName && !email) {
    return { error: "Enter at least a name or an email." };
  }

  const { error } = await supabase.from("contacts").insert({
    org_id: currentOrg.id,
    first_name: firstName || null,
    last_name: lastName || null,
    email: email || null,
    phone: phone || null,
    lifecycle,
  });
  if (error) return { error: error.message };

  revalidatePath("/contacts");
  return { ok: true };
}
