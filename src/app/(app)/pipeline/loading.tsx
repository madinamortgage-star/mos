export default function Loading() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-stroke px-8 py-5">
        <div className="h-3 w-28 rounded bg-beige-200" />
        <div className="mt-2 h-7 w-44 rounded bg-beige-200" />
      </div>
      <div className="border-b border-stroke px-8 py-3">
        <div className="h-8 w-64 rounded bg-beige-200" />
      </div>
      <div className="flex flex-1 animate-pulse gap-4 overflow-hidden p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-beige-100/70 p-3">
            <div className="h-5 w-32 rounded bg-beige-200" />
            {Array.from({ length: 3 }).map((__, j) => (
              <div key={j} className="h-20 rounded-lg bg-white" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
