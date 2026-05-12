"use client";

import { useActionState, useEffect, useState } from "react";
import { createContactAction, type CreateContactState } from "@/lib/actions/contacts";

const initialState: CreateContactState = {};

const LIFECYCLE_OPTIONS: { value: string; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospect" },
  { value: "active", label: "Active" },
  { value: "client", label: "Client" },
  { value: "past_client", label: "Past client" },
  { value: "partner", label: "Partner" },
];

const inputCls = "mt-1 w-full rounded-md border border-stroke px-2.5 py-1.5 text-sm outline-none focus:border-stroke-strong";

export function NewContactButton({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createContactAction, initialState);

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-beige-100 hover:bg-navy-800"
      >
        + New contact
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/30 p-6 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-stroke bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-bold text-ink-900">New contact</div>
            {disabled && (
              <p className="mt-2 rounded-md border border-stroke bg-beige-100 p-2 text-xs text-brown-700">
                Supabase isn&apos;t configured — connect it (and apply the migrations) to actually save contacts.
              </p>
            )}

            <form action={formAction} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-brown-700">First name</span>
                  <input name="first_name" className={inputCls} autoComplete="off" />
                </label>
                <label className="block">
                  <span className="text-xs text-brown-700">Last name</span>
                  <input name="last_name" className={inputCls} autoComplete="off" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-brown-700">Email</span>
                <input name="email" type="email" className={inputCls} autoComplete="off" />
              </label>
              <label className="block">
                <span className="text-xs text-brown-700">Phone</span>
                <input name="phone" className={inputCls} autoComplete="off" />
              </label>
              <label className="block">
                <span className="text-xs text-brown-700">Lifecycle</span>
                <select name="lifecycle" defaultValue="lead" className={`${inputCls} bg-white`}>
                  {LIFECYCLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              {state.error && <p className="text-sm text-red-600">{state.error}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-stroke px-3 py-1.5 text-sm text-brown-700 hover:bg-beige-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-beige-100 disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Create contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
