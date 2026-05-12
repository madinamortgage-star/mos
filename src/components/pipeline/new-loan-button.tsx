"use client";

import { useActionState, useEffect, useState } from "react";
import { createLoanAction, type CreateLoanState } from "@/lib/actions/loans";
import { LOAN_PURPOSE_OPTIONS, LOAN_STATUS_OPTIONS } from "@/lib/loans/format";

const initialState: CreateLoanState = {};

const inputCls =
  "mt-1 w-full rounded-md border border-stroke px-2.5 py-1.5 text-sm outline-none focus:border-stroke-strong";

export function NewLoanButton({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createLoanAction, initialState);

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
        + New loan
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
            <div className="text-lg font-bold text-ink-900">New loan</div>
            {disabled && (
              <p className="mt-2 rounded-md border border-stroke bg-beige-100 p-2 text-xs text-brown-700">
                Supabase isn&apos;t configured (or there&apos;s no pipeline yet) — connect it and apply the
                migrations / seed to actually save loans.
              </p>
            )}

            <form action={formAction} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-brown-700">Loan number</span>
                  <input name="loan_number" className={inputCls} autoComplete="off" />
                </label>
                <label className="block">
                  <span className="text-xs text-brown-700">Amount</span>
                  <input name="amount" inputMode="decimal" placeholder="650000" className={inputCls} autoComplete="off" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-brown-700">Lender</span>
                <input name="lender" className={inputCls} autoComplete="off" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-brown-700">Purpose</span>
                  <select name="loan_purpose" defaultValue="purchase" className={`${inputCls} bg-white`}>
                    {LOAN_PURPOSE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-brown-700">Status</span>
                  <select name="status" defaultValue="lead" className={`${inputCls} bg-white`}>
                    {LOAN_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

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
                  {pending ? "Saving…" : "Create loan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
