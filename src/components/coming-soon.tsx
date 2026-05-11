export function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="mx-8 my-6 p-8 bg-white border border-stroke rounded-lg shadow-sm">
      <div className="text-[11px] tracking-[0.14em] uppercase text-red-600 font-semibold">
        Scaffold
      </div>
      <h2 className="text-xl font-bold text-ink-900 mt-1">{feature}</h2>
      <p className="text-sm text-brown-700 mt-2 max-w-xl">
        This page is wired into the protected app shell. The legacy prototype
        for {feature.toLowerCase()} lives under{" "}
        <code className="font-mono">/legacy</code> and will be ported to live
        Supabase data in an upcoming phase.
      </p>
    </div>
  );
}
