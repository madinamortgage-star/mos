export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-beige-200 text-2xl text-brown-500">
        {icon ?? "○"}
      </div>
      <div className="text-base font-semibold text-ink-900">{title}</div>
      {description && <div className="mt-1 max-w-sm text-sm text-brown-600">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
