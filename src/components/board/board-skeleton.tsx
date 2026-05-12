export function BoardSkeleton({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-stroke px-8 py-5">
        <div className="h-3 w-28 rounded bg-beige-200" />
        <div className="mt-2 h-7 w-44 rounded bg-beige-200" aria-label={title} />
      </div>
      <div className="border-b border-stroke px-8 py-3">
        <div className="h-8 w-72 rounded bg-beige-200" />
      </div>
      <div className="animate-pulse space-y-3 p-6">
        {Array.from({ length: 3 }).map((_, g) => (
          <div key={g} className="rounded-xl border border-stroke bg-beige-100/60 p-4">
            <div className="mb-3 h-5 w-40 rounded bg-beige-200" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((__, c) => (
                <div key={c} className="h-24 rounded-lg bg-white" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
