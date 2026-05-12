"use client";

export function BoardErrorState({
  error,
  reset,
  title,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="text-lg font-semibold text-ink-900">Something went wrong loading {title}</div>
      <div className="max-w-md text-sm text-brown-600">{error.message || "An unexpected error occurred."}</div>
      <button
        onClick={reset}
        className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-beige-100 hover:bg-navy-800"
      >
        Try again
      </button>
    </div>
  );
}
