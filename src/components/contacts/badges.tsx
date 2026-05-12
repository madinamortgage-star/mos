import { LIFECYCLE_META, PRIORITY_META, STATUS_META } from "@/lib/contacts/format";
import type { ContactLifecycle, ContactStatus, PriorityLevel } from "@/lib/db/types";

const dash = <span className="text-ink-300">—</span>;

export function LifecycleBadge({ value }: { value: ContactLifecycle | null | undefined }) {
  if (!value) return dash;
  const m =
    LIFECYCLE_META[value] ?? { label: value, className: "bg-ink-300/20 text-ink-500 ring-1 ring-ink-300/40" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${m.className}`}>
      {m.label}
    </span>
  );
}

export function StatusBadge({ value }: { value: ContactStatus | null | undefined }) {
  if (!value) return dash;
  const m = STATUS_META[value] ?? { label: value, dot: "bg-ink-300", text: "text-ink-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${m.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function PriorityBadge({ value }: { value: PriorityLevel | null | undefined }) {
  if (!value) return dash;
  const m = PRIORITY_META[value] ?? { label: value, dot: "bg-ink-300", text: "text-ink-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${m.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function TagList({ tags }: { tags: string[] | null | undefined }) {
  if (!tags || tags.length === 0) return dash;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center rounded bg-beige-200 px-1.5 py-0.5 text-[11px] text-brown-700">
          {t}
        </span>
      ))}
    </div>
  );
}
