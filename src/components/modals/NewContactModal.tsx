"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icons";

interface Props {
  onClose: () => void;
  onSaved: (contact: { firstName: string; lastName: string }) => void;
  defaultPipeline?: string;
}

const PIPELINE_OPTIONS = [
  { key: "sales",   label: "Sales / Loan" },
  { key: "partner", label: "Partner" },
  { key: "recruit", label: "Recruiting" },
  { key: "onboard", label: "Onboarding" },
  { key: "investor",label: "Investor" },
  { key: "vendor",  label: "Vendor" },
];

export function NewContactModal({ onClose, onSaved, defaultPipeline = "sales" }: Props) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    company: "", source: "Referral", pipeline: defaultPipeline,
    stage: "New", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName) { setError("First and last name are required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const contact = await res.json();
      onSaved(contact);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="contact-modal"
        style={{ maxWidth: 560, height: "auto", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="contact-top">
          <div className="row1">
            <div className="c-name">New Contact</div>
            <button className="close-x" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="First name *" value={form.firstName} onChange={v => set("firstName", v)} />
              <Field label="Last name *" value={form.lastName} onChange={v => set("lastName", v)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Email" value={form.email} onChange={v => set("email", v)} type="email" />
              <Field label="Phone" value={form.phone} onChange={v => set("phone", v)} type="tel" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Company" value={form.company} onChange={v => set("company", v)} />
              <SelectField label="Source" value={form.source} onChange={v => set("source", v)}
                options={["Referral", "Web Form", "Cold Outreach", "Event", "LinkedIn", "Partner", "Existing Client", "Inbound Call"]} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <SelectField label="Pipeline" value={form.pipeline} onChange={v => set("pipeline", v)}
                options={PIPELINE_OPTIONS.map(p => p.key)} labels={PIPELINE_OPTIONS.reduce((a, p) => ({ ...a, [p.key]: p.label }), {})} />
              <Field label="Stage" value={form.stage} onChange={v => set("stage", v)} />
            </div>
            <TextareaField label="Notes" value={form.notes} onChange={v => set("notes", v)} />

            {error && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--red-50)", border: "1px solid rgba(148,69,71,0.2)", color: "var(--red-600)", fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
              <button type="button" className="pill-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="pill-btn primary" disabled={saving}>
                <Icon name="plus" size={13} /> {saving ? "Saving…" : "Save contact"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brown-700)", letterSpacing: "0.04em" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
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
