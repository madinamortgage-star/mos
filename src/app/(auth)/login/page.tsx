import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Auth UI placeholder. Wire to Supabase Auth (email/password + OAuth) in a
// later phase. Currently shows a banner when Supabase is unconfigured.
export default function LoginPage() {
  const configured = isSupabaseConfigured();

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
          <code className="font-mono">.env.local</code> to enable auth.
        </div>
      )}

      <form className="space-y-4" action="#">
        <label className="block">
          <span className="text-sm text-brown-700">Email</span>
          <input
            type="email"
            className="mt-1 w-full border border-stroke rounded-md px-3 py-2 text-sm"
            placeholder="you@example.com"
            disabled
          />
        </label>
        <label className="block">
          <span className="text-sm text-brown-700">Password</span>
          <input
            type="password"
            className="mt-1 w-full border border-stroke rounded-md px-3 py-2 text-sm"
            disabled
          />
        </label>
        <button
          type="submit"
          disabled
          className="w-full bg-navy-900 text-beige-100 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
        >
          Sign in
        </button>
      </form>

      <div className="text-sm text-brown-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-navy-700 font-medium">
          Sign up
        </Link>
      </div>
    </div>
  );
}
