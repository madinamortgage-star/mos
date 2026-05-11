"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons/Icons";
import type { Partner } from "@/types";

interface Props {
  onToast: (text: string, xp?: string) => void;
}

const GROUPS = [
  { key: "vip",  title: "VIP Partners",    cls: "g-fund" },
  { key: "act",  title: "Active",          cls: "g-pre" },
  { key: "new",  title: "New / Growing",   cls: "g-app" },
  { key: "cold", title: "Cold / Dormant",  cls: "g-proc" },
];

function fmtK(n: number) { return "$" + Math.round(n / 1000) + "K"; }

export function PartnersPage({ onToast }: Props) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set(["vip", "act"]));
  const [selected, setSelected] = useState<Partner | null>(null);

  useEffect(() => {
    fetch("/api/partners")
      .then(r => r.json())
      .then((data: Partner[]) => { setPartners(data); setLoading(false); });
  }, []);

  async function markCalled(partner: Partner) {
    await fetch(`/api/partners/${partner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callDone: true }),
    });
    setPartners(ps => ps.map(p => p.id === partner.id ? { ...p, callDone: true } : p));
    onToast(`Called ${partner.contact ?? partner.name}`);
  }

  if (selected) {
    return <PartnerDetail partner={selected} onBack={() => setSelected(null)} onToast={onToast} />;
  }

  const filtered = partners.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.contact ?? "").toLowerCase().includes(q);
  });

  if (loading) return <div style={{ padding: "32px", color: "var(--brown-500)" }}>Loading partners…</div>;

  return (
    <div className="pipeline">
      <div className="pipe-toolbar">
        <div className="search">
          <Icon name="mag" size={14} className="mag" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners…" />
        </div>
      </div>

      <div className="board">
        {GROUPS.map(group => {
          const rows = filtered.filter(p => p.group === group.key);
          const isOpen = open.has(group.key);
          const totalValue = rows.reduce((sum, p) => sum + (p.annualValue ?? 0), 0);

          return (
            <div key={group.key} className={"group " + (isOpen ? "open" : "")}>
              <div className={"group-head " + group.cls}
                onClick={() => setOpen(o => { const n = new Set(o); n.has(group.key) ? n.delete(group.key) : n.add(group.key); return n; })}>
                <div className="bar" />
                <Icon name="chev" size={12} className="chev" />
                <span className="title">{group.title}</span>
                <span className="count">{rows.length}</span>
                <div className="sum">
                  {totalValue > 0 && <span>Annual value <span className="mono">{fmtK(totalValue)}</span></span>}
                </div>
              </div>

              {isOpen && (
                <div className="group-body">
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th className="sticky col-item">Partner</th>
                          <th className="col-phone">Phone</th>
                          <th className="col-phone">Email</th>
                          <th style={{ width: 60, textAlign: "center" }}>Deals 12mo</th>
                          <th className="col-money">Annual Value</th>
                          <th>Last Contact</th>
                          <th>Next Contact</th>
                          <th>Notes</th>
                          <th style={{ width: 100 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(p => (
                          <tr key={p.id}>
                            <td className="sticky">
                              <div className="name-cell">
                                <div className="av" style={{ background: "linear-gradient(135deg,#D7B97C,#8A6E3E)" }}>
                                  {(p.contact ?? p.name).split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </div>
                                <div>
                                  <div className="name" onClick={() => setSelected(p)} style={{ cursor: "pointer" }}>{p.name}</div>
                                  {p.contact && <div className="sub">{p.contact}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="col-phone">{p.phone ?? "—"}</td>
                            <td className="col-email" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{p.email ?? "—"}</td>
                            <td style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600 }}>{p.deals12}</td>
                            <td className="col-money">{p.annualValue > 0 ? fmtK(p.annualValue) : "—"}</td>
                            <td className="date-cell">{p.lastContact ?? "—"}</td>
                            <td className="date-cell">{p.nextContact ?? "—"}</td>
                            <td><div className="note-cell">{p.notes}</div></td>
                            <td>
                              {p.callDone ? (
                                <span style={{ color: "var(--ok)", fontSize: 12, fontWeight: 600 }}>✓ Called</span>
                              ) : (
                                <button className="mark-done" style={{ fontSize: 11.5, padding: "5px 10px" }} onClick={() => markCalled(p)}>
                                  Mark called
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PartnerDetail({ partner, onBack, onToast }: { partner: Partner; onBack: () => void; onToast: (t: string) => void }) {
  const [note, setNote] = useState("");

  async function logActivity() {
    if (!note.trim()) return;
    await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId: partner.id, kind: "note", title: "Note added", subtitle: note }),
    });
    setNote("");
    onToast("Activity logged for " + partner.name);
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 900 }}>
      <button className="pill-btn" onClick={onBack} style={{ marginBottom: 20 }}>
        <Icon name="arrow-left" size={13} /> Back to Partners
      </button>

      <div style={{ background: "white", border: "1px solid var(--stroke)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px", background: "var(--navy-900)", color: "#F5ECD7" }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{partner.name}</div>
          {partner.contact && <div style={{ color: "#D8B17A", fontSize: 14 }}>Contact: {partner.contact}</div>}
          <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
            {partner.phone && <a href={`tel:${partner.phone}`} style={{ color: "#BFAD88", fontFamily: "var(--mono)", fontSize: 13 }}>{partner.phone}</a>}
            {partner.email && <a href={`mailto:${partner.email}`} style={{ color: "#BFAD88", fontSize: 13 }}>{partner.email}</a>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--stroke)" }}>
          <Stat label="Deals (12mo)" value={String(partner.deals12)} />
          <Stat label="Total Transactions" value={String(partner.totalTx)} />
          <Stat label="Annual Value" value={partner.annualValue > 0 ? "$" + partner.annualValue.toLocaleString() : "—"} />
        </div>

        <div style={{ padding: "20px 28px" }}>
          {partner.notes && (
            <div style={{ marginBottom: 16, padding: "12px 14px", background: "#FFF8E0", borderLeft: "2px solid var(--warn)", borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--brown-900)", fontStyle: "italic" }}>
              {partner.notes}
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--brown-500)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Log Activity</div>
          <div style={{ display: "flex", gap: 8 }}>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Add a note or log an activity…"
              style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--stroke)", fontFamily: "inherit", fontSize: 13, resize: "vertical" }} />
            <button className="pill-btn primary" onClick={logActivity} style={{ alignSelf: "flex-end" }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "16px 20px", background: "var(--beige-50)" }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown-500)", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 600, color: "var(--ink-900)" }}>{value}</div>
    </div>
  );
}
