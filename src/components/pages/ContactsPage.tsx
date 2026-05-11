"use client";

import { useState, useEffect, useMemo } from "react";
import { Icon } from "@/components/icons/Icons";
import type { Contact, ContactPipeline } from "@/types";

interface Props {
  onToast: (text: string) => void;
}

const PIPELINES = [
  { key: "sales",   label: "Sales",       color: "#944547", icon: "flame"     },
  { key: "recruit", label: "Recruiting",  color: "#3E6E73", icon: "user"      },
  { key: "investor",label: "Investor",    color: "#6B7FB3", icon: "briefcase" },
  { key: "onboard", label: "Onboarding",  color: "#B58B3E", icon: "check"     },
  { key: "partner", label: "Partnership", color: "#8A6E8C", icon: "handshake" },
  { key: "vendor",  label: "Vendor",      color: "#5A4632", icon: "doc"       },
];

const STATUS_COLORS: Record<string, string> = {
  "Active": "#4E7A4E", "Qualified": "#3E6E73", "Hot": "#944547",
  "Warm": "#B58B3E", "Cold": "#6F5A44", "Nurture": "#8A6E8C",
  "On Hold": "#8A745A", "Closed": "#2F4A2F", "Lost": "#3B2E22",
};

export function ContactsPage({ onToast }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activePipeline, setActivePipeline] = useState("sales");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/contacts?pipeline=${activePipeline}`)
      .then(r => r.json())
      .then((data: Contact[]) => { setContacts(data); setLoading(false); });
  }, [activePipeline]);

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  }, [contacts, search]);

  function getPipelineStage(c: Contact) {
    return c.pipelines?.find(p => p.pipeline === activePipeline)?.stage ?? "—";
  }
  function getPipelineDeal(c: Contact) {
    return c.pipelines?.find(p => p.pipeline === activePipeline)?.dealValue ?? null;
  }

  async function updateContactStatus(id: string, status: string) {
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setContacts(cs => cs.map(c => c.id === id ? { ...c, status } : c));
    onToast("Status updated");
  }

  const activePl = PIPELINES.find(p => p.key === activePipeline)!;

  return (
    <div className="crm-wrap">
      {/* Pipeline tabs */}
      <div className="crm-pipelines">
        {PIPELINES.map(pl => (
          <button
            key={pl.key}
            className={"crm-pl-tab" + (activePipeline === pl.key ? " active" : "")}
            onClick={() => setActivePipeline(pl.key)}
            style={{ "--pl-color": pl.color } as React.CSSProperties}
          >
            <Icon name={pl.icon} size={14} />
            {pl.label}
            <span className="crm-pl-count">{pl.key === activePipeline ? filtered.length : "—"}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="crm-toolbar">
        <div className="crm-search">
          <Icon name="mag" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activePl.label} contacts…`} />
        </div>
        <button className="pill-btn"><Icon name="filter" size={13} /> Filter</button>
        <button className="pill-btn"><Icon name="doc" size={13} /> Export</button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: "32px", color: "var(--brown-500)" }}>Loading contacts…</div>
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table tbl">
            <thead>
              <tr>
                <th className="sticky col-item">Name</th>
                <th>Status</th>
                <th>Stage</th>
                <th className="col-email">Email</th>
                <th className="col-phone">Phone</th>
                <th>Company</th>
                <th>Source</th>
                <th className="num">Deal Value</th>
                <th>Tags</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => setEditing(c.id)} style={{ cursor: "pointer" }}>
                  <td className="sticky">
                    <div className="name-cell">
                      <div className="av">{c.firstName[0]}{c.lastName[0]}</div>
                      <div>
                        <div className="name">{c.firstName} {c.lastName}</div>
                        {c.title && <div className="sub">{c.title}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={c.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => { e.stopPropagation(); updateContactStatus(c.id, e.target.value); }}
                      style={{ padding: "4px 8px", borderRadius: 6, border: "none", fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: "white", background: STATUS_COLORS[c.status] ?? "var(--brown-500)", cursor: "pointer" }}
                    >
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><span className="pill-stage">{getPipelineStage(c)}</span></td>
                  <td className="col-email">{c.email ?? "—"}</td>
                  <td className="col-phone">{c.phone ?? "—"}</td>
                  <td>{c.company ?? "—"}</td>
                  <td>{c.source ?? "—"}</td>
                  <td className="num">{getPipelineDeal(c) ? "$" + (getPipelineDeal(c) as number).toLocaleString() : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(c.tags ?? []).map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </td>
                  <td><div className="note-cell">{c.notes}</div></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "32px", color: "var(--brown-500)", fontStyle: "italic" }}>
                    No contacts in this pipeline yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline edit drawer (basic) */}
      {editing && (
        <ContactEditDrawer
          contact={contacts.find(c => c.id === editing)!}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setContacts(cs => cs.map(c => c.id === updated.id ? updated : c));
            setEditing(null);
            onToast("Contact updated");
          }}
        />
      )}
    </div>
  );
}

function ContactEditDrawer({
  contact, onClose, onSaved
}: {
  contact: Contact;
  onClose: () => void;
  onSaved: (c: Contact) => void;
}) {
  const [form, setForm] = useState({
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    company: contact.company ?? "",
    notes: contact.notes ?? "",
    status: contact.status,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    setSaving(false);
    onSaved({ ...contact, ...updated });
  }

  return (
    <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 380, background: "white", borderLeft: "1px solid var(--stroke)", boxShadow: "var(--shadow-lg)", zIndex: 40, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--stroke)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{contact.firstName} {contact.lastName}</div>
        <button onClick={onClose} style={{ color: "var(--brown-500)", padding: 4, borderRadius: 6 }}><Icon name="x" size={16} /></button>
      </div>
      <div style={{ padding: "20px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="First name" value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} />
        <Field label="Last name"  value={form.lastName}  onChange={v => setForm(f => ({ ...f, lastName: v }))} />
        <Field label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
        <Field label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
        <Field label="Company" value={form.company} onChange={v => setForm(f => ({ ...f, company: v }))} />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brown-700)" }}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4}
            style={{ padding: "8px 10px", borderRadius: 7, border: "1px solid var(--stroke)", fontFamily: "inherit", fontSize: 13, resize: "vertical" }} />
        </div>
      </div>
      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--stroke)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="pill-btn" onClick={onClose}>Cancel</button>
        <button className="pill-btn primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--brown-700)" }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: "8px 10px", borderRadius: 7, border: "1px solid var(--stroke)", fontFamily: "inherit", fontSize: 13 }} />
    </div>
  );
}
