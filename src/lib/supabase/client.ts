/**
 * Browser-side Supabase client.
 *
 * Use this inside Client Components (`"use client"`).
 * For Server Components / Route Handlers / Server Actions, use `./server.ts`.
 *
 * If Supabase env vars are not yet set, this returns `null`. Callers should
 * guard against that — see `isSupabaseConfigured()` in `./env.ts`.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let cached: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
