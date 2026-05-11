import { getUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function HomePage() {
  const user = await getUser();
  const configured = isSupabaseConfigured();

  return (
    <div className="px-8 py-10 max-w-[1100px]">
      <div className="text-[11px] tracking-[0.14em] uppercase text-brown-500 font-medium">
        Today
      </div>
      <h1 className="text-4xl font-bold text-ink-900 tracking-tight mt-1">
        Good morning{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
      </h1>
      <p className="text-brown-600 text-base mt-2 max-w-xl">
        You have 5 priority calls, 2 files in underwriting, and 1 rush
        pre-approval to rate-lock today.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-7">
        <a
          href="/prospecting"
          className="text-left p-6 bg-navy-900 text-beige-100 rounded-xl shadow-lg"
        >
          <div className="text-[11px] tracking-[0.16em] uppercase text-beige-200 font-semibold">
            Start here
          </div>
          <div className="text-xl font-bold mt-2">Prospecting →</div>
          <div className="text-beige-200/70 text-sm mt-1.5">
            Today&apos;s 5 calls · follow-ups day
          </div>
        </a>
        <a
          href="/pipeline"
          className="text-left p-6 bg-white border border-stroke rounded-xl shadow-sm"
        >
          <div className="text-[11px] tracking-[0.16em] uppercase text-red-600 font-semibold">
            Pipeline
          </div>
          <div className="text-xl font-bold mt-2">17 active loans →</div>
          <div className="text-brown-600 text-sm mt-1.5">
            $9.8M volume · $196K projected revenue
          </div>
        </a>
      </div>

      <div className="mt-7 p-4 bg-white border border-stroke rounded-lg text-sm text-brown-700">
        {configured ? (
          <>
            Supabase is configured. Real data wiring lands in the next phase.
          </>
        ) : (
          <>
            <b>Placeholder mode.</b> Supabase env vars are empty — paste your
            keys into <code className="font-mono">.env.local</code> to enable
            auth and live data.
          </>
        )}
      </div>
    </div>
  );
}
