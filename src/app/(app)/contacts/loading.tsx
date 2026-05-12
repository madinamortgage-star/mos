export default function Loading() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-stroke px-8 py-5">
        <div className="h-3 w-24 rounded bg-beige-200" />
        <div className="mt-2 h-7 w-40 rounded bg-beige-200" />
      </div>
      <div className="border-b border-stroke px-8 py-3">
        <div className="h-8 w-64 rounded bg-beige-200" />
      </div>
      <div className="animate-pulse space-y-2 p-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 rounded bg-beige-100" />
        ))}
      </div>
    </div>
  );
}
