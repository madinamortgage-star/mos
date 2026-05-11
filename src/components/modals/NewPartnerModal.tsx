"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icons";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export function NewPartnerModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: "", contact: "", phone: "", email: "",
    birthday: "", category: "realtor", group: "new", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setError("Company/name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save partner.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="contact-modal" style={{ maxWidth: 520, height: "auto", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        <div className="contact-top">
          <div className="row1">
            <div className="c-name">New Partner</div>
            <button className="close-x" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
        </div>

        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Company / Name *" value={form.name} onChange={v => set("name", v)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Primary contact" value={form.contact} onChange={v => set("contact", v)} />
              <Field label="Phone" value={form.phone} onChange={v => set("phone", v)} type="tel" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Email" value={form.email} onChange={v => set("email", v)} type="email" />
              <Field label="Birthday" value={form.birthday} onChange={v => set("birthday", v)} placeholder="e.g. Mar 14" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <SelectField label="Category" value={form.category} onChange={v => set("category", v)}
                options={["realtor", "cpa", "financial-advisor", "title", "insurance", "other"]}
                labels={{ realtor: "Realtor", cpa: "CPA", "financial-advisor": "Financial Advisor", title: "Title", insurance: "Insurance", other: "Other" }} />
              <SelectField label="Group" value={form.group} onChange={v => set("group", v)}
                options={["vip", "act", "new", "cold"]}
                labels={{ vip: "VIP", act: "Active", new: "New / Growing", cold: "Cold" }} />
            </div>
            <TextareaField label="Notes" value={form.notes} onChange={v => set("notes", v)} />

            {error && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--red-50)", border: "1px solid rgba(148,69,71,0.2)", color: "var(--red-600)", fontSize: 13 }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
              <button type="button" className="pill-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="pill-btn primary" disabled={saving}>
                <Icon name="plus" size={13} /> {saving ? "Saving…" : "Add partner"}
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
