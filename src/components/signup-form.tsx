"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";
import type { AuthState } from "@/lib/auth";

const initialState: AuthState = {};

export function SignupForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] tracking-[0.16em] uppercase text-brown-600 font-semibold">
          Get started
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mt-1">Create your MOS account</h1>
      </div>

      {!configured && (
        <div className="text-sm bg-beige-100 border border-stroke rounded-md p-3 text-brown-700">
          Supabase isn&apos;t configured yet. Paste your keys into{" "}
          <code className="font-mono">.env.local</code> to enable signup.
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <label className="block">
          <span className="text-sm text-brown-700">Full name</span>
          <input
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Alex Reyes"
            className="mt-1 w-full border border-stroke rounded-md px-3 py-2 text-sm bg-white"
          />
        </label>
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
            minLength={8}
            autoComplete="new-password"
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
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <div className="text-sm text-brown-600">
        Already have an account?{" "}
        <Link href="/login" className="text-navy-700 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
