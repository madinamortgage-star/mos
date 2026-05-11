/**
 * Supabase env helpers.
 *
 * The project is configured to boot WITHOUT real Supabase credentials so the UI
 * can be developed in isolation. Once you paste real values into `.env.local`
 * (or set them in Vercel), `isSupabaseConfigured()` flips to `true` and the
 * real clients are used.
 *
 * Paste your values into:
 *   - .env.local                  (for local dev)
 *   - Vercel → Project Settings   (for preview + production)
 *
 * Variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY     (server-only — never read from client code)
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

/** Server-only. Throws if read from a client bundle. */
export function getServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must never be read in the browser.");
  }
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}
