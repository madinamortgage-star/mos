/**
 * Auth helpers used by protected route layouts.
 *
 * While Supabase is unconfigured (placeholder mode), `requireUser()` returns a
 * stub user so the protected UI is reachable for development. Once real
 * credentials are pasted into `.env.local`, this enforces a real session and
 * redirects unauthenticated visitors to `/login`.
 */

import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

export type AppUser = {
  id: string;
  email: string | null;
  // Real Supabase users carry far more — extend this as you add columns.
};

/** Return value of the auth Server Actions, surfaced in the auth forms. */
export type AuthState = {
  error?: string;
  message?: string;
};

const PLACEHOLDER_USER: AppUser = {
  id: "placeholder-user",
  email: "demo@mos.local",
};

export async function getUser(): Promise<AppUser | null> {
  if (!isSupabaseConfigured()) return PLACEHOLDER_USER;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

export async function requireUser(): Promise<AppUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
