"use client";

export interface ToastItem {
  id: number;
  text: string;
  xp?: string;
}

export function Toasts({ items }: { items: ToastItem[] }) {
  return (
    <div className="toast-wrap">
      {items.map(t => (
        <div key={t.id} className="toast">
          <span>{t.text}</span>
          {t.xp && <span className="xp">{t.xp}</span>}
        </div>
      ))}
    </div>
  );
}

export function useToasts() {
  // Re-exported for convenience; state lives in parent
}
