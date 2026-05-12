import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-confirmation callback.
 *
 * Hit by:
 *   • email-signup confirmation links (`emailRedirectTo` in signUpAction)
 *   • TODO(Google OAuth): `supabase.auth.signInWithOAuth({ provider: "google",
 *     options: { redirectTo: `${NEXT_PUBLIC_SITE_URL}/auth/callback` } })`
 *
 * TODO(Supabase redirect URLs): add `<site-url>/auth/callback` for every
 * environment (localhost, Vercel preview, production) under Supabase →
 * Authentication → URL Configuration → Redirect URLs.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
