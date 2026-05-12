"use server";

/**
 * Auth Server Actions: email/password sign-in, sign-up, and sign-out.
 *
 * In placeholder mode (no Supabase keys) these return a friendly error instead
 * of throwing — the UI stays usable. They activate automatically once
 * `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AuthState } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const NOT_CONFIGURED: AuthState = {
  error: "Supabase isn't configured yet — add your keys to .env.local (see README).",
};

function siteUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SITE_URL || undefined;
}

export async function signInAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase client unavailable." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signUpAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase client unavailable." };

  const base = siteUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      // TODO(Supabase redirect URLs): this must point at your deployed callback
      // and the URL must be listed under Supabase → Authentication → URL
      // Configuration → Redirect URLs (localhost, Vercel preview, production).
      emailRedirectTo: base ? `${base}/auth/callback` : undefined,
    },
  });
  if (error) return { error: error.message };

  // When "Confirm email" is enabled in Supabase there is no session yet.
  if (!data.session) {
    return { message: "Check your email to confirm your account, then sign in." };
  }

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

// TODO(Google OAuth): add a `signInWithGoogleAction` here, e.g.
//   const { data } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: { redirectTo: `${siteUrl()}/auth/callback` },
//   });
//   if (data.url) redirect(data.url);
// Also enable Google in Supabase → Authentication → Providers and add the
// callback URL to the Google OAuth consent screen.
