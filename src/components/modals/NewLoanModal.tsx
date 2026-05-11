"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons/Icons";
import type { Contact } from "@/types";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export function NewLoanModal({ onClose, onSaved }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({
    contactId: "", firstName: "", lastName: "",
    amount: "", stage: "lead", status: "warm", notes: "",
    lender: "", processor: "", product: "30-yr Conventional",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/contacts").then(r => r.json()).then(setContacts);
  }, []);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleContactSelect(id: string) {
    const c = contacts.find(c => c.id === id);
    if (c) set("contactId", id);
    setForm(f => ({ ...f, contactId: id, firstName: c?.firstName ?? "", lastName: c?.lastName ?? "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName) { setError("Borrower name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        amount: form.amount ? parseFloat(form.amount.replace(/[^0-9.]/g, "")) : undefined,
        contactId: form.contactId || undefined,
      };
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save loan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="contact-modal" style={{ maxWidth: 560, height: "auto", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        <div className="contact-top">
          <div className="row1">
            <div className="c-name">New Loan</div>
            <button className="close-x" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
        </div>

        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Link to existing contact or enter manually */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brown-700)", letterSpacing: "0.04em" }}>Link to existing contact</label>
              <select value={form.contactId} onChange={e => handleContactSelect(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 7, border: "1px solid var(--stroke)", fontFamily: "inherit", fontSize: 13, background: "white", color: "var(--ink-900)" }}>
                <option value="">— Enter manually below —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="First name *" value={form.firstName} onChange={v => set("firstName", v)} />
              <Field label="Last name *" value={form.lastName} onChange={v => set("lastName", v)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Loan amount" value={form.amount} onChange={v => set("amount", v)} placeholder="$612,000" />
              <SelectField label="Product" value={form.product} onChange={v => set("product", v)}
                options={["30-yr Conventional", "15-yr Conventional", "FHA", "VA", "Jumbo", "HELOC", "Cash-out Refi"]} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <SelectField label="Stage" value={form.stage} onChange={v => set("stage", v)}
                options={["lead", "app", "pre", "proc", "uw", "fund"]}
                labels={{ lead: "Lead", app: "Application", pre: "Pre-Approved", proc: "Processing", uw: "Underwriting", fund: "Funded" }} />
              <SelectField label="Status" value={form.status} onChange={v => set("status", v)}
                options={["hot", "warm", "cool", "stall", "ok"]}
                labels={{ hot: "Hot", warm: "Warm", cool: "Cool", stall: "Stalled", ok: "On Track" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Processor" value={form.processor} onChange={v => set("processor", v)} placeholder="e.g. M. Liu" />
              <Field label="Lender" value={form.lender} onChange={v => set("lender", v)} placeholder="e.g. UWM" />
            </div>
            <TextareaField label="Notes" value={form.notes} onChange={v => set("notes", v)} />

            {error && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--red-50)", border: "1px solid rgba(148,69,71,0.2)", color: "var(--red-600)", fontSize: 13 }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
              <button type="button" className="pill-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="pill-btn primary" disabled={saving}>
                <Icon name="plus" size={13} /> {saving ? "Saving…" : "Create loan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brown-700)", letterSpacing: "0.04em" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: "8px 10px", borderRadius: 7, border: "1px solid var(--stroke)", fontFamily: "inherit", fontSize: 13, background: "white", color: "var(--ink-900)" }} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brown-700)", letterSpacing: "0.04em" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: "8px 10px", borderRadius: 7, border: "1px solid var(--stroke)", fontFamily: "inherit", fontSize: 13, background: "white", color: "var(--ink-900)" }}>
        {options.map(o => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brown-700)", letterSpacing: "0.04em" }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
        style={{ padding: "8px 10px", borderRadius: 7, border: "1px solid var(--stroke)", fontFamily: "inherit", fontSize: 13, background: "white", color: "var(--ink-900)", resize: "vertical" }} />
    </div>
  );
}
