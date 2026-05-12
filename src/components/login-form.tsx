"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/lib/actions/auth";
import type { AuthState } from "@/lib/auth";

const initialState: AuthState = {};

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.16em] uppercase text-brown-600 font-semibold">
          Welcome back
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mt-1">Sign in to MOS</h1>
      </div>

      {!configured && (
        <div className="text-sm bg-beige-100 border border-stroke rounded-md p-3 text-brown-700">
          Supabase isn&apos;t configured yet. Paste your keys into{" "}
          <code className="font-mono">.env.local</code> to enable sign-in.
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <label className="block">
          <span className="text-sm text-brown-700">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-1 w-full border border-stroke rounded-md px-3 py-2 text-sm bg-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-brown-700">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full border border-stroke rounded-md px-3 py-2 text-sm bg-white"
          />
        </label>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.message && <p className="text-sm text-green-700">{state.message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-navy-900 text-beige-100 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* TODO(Google OAuth): add a "Continue with Google" button that calls a
          server action invoking supabase.auth.signInWithOAuth({ provider:
          "google", options: { redirectTo: `${NEXT_PUBLIC_SITE_URL}/auth/callback` } }). */}

      <div className="text-sm text-brown-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-navy-700 font-medium">
          Sign up
        </Link>
      </div>
    </div>
  );
}
