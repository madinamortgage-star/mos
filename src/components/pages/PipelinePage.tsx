"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons/Icons";
import type { Loan } from "@/types";

interface Props {
  onOpenContact: (loanId: string) => void;
}

const STAGES = [
  { key: "lead", label: "Lead",         num: "01", cls: "g-new" },
  { key: "app",  label: "App",          num: "02", cls: "g-app" },
  { key: "pre",  label: "Pre-Approval", num: "03", cls: "g-pre" },
  { key: "proc", label: "Processing",   num: "04", cls: "g-proc" },
  { key: "uw",   label: "Underwriting", num: "05", cls: "g-proc" },
  { key: "fund", label: "Funded",       num: "06", cls: "g-fund" },
];

function fmt$(n: number) { return "$" + n.toLocaleString(); }
function fmtK(n: number) { return "$" + Math.round(n / 1000) + "K"; }

const STATUS_CLS: Record<string, string> = {
  hot: "s-hot", warm: "s-warm", cool: "s-cool", stall: "s-stall", ok: "s-ok",
};

export function PipelinePage({ onOpenContact }: Props) {
  const [loans, setLoans] = useState<(Loan & { contact?: { id: string; phone?: string; email?: string } })[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set(["lead", "pre"]));
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/loans")
      .then(r => r.json())
      .then(data => { setLoans(data); setLoading(false); });
  }, []);

  async function updateStage(loanId: string, stage: string) {
    await fetch(`/api/loans/${loanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    setLoans(ls => ls.map(l => l.id === loanId ? { ...l, stage: stage as Loan["stage"] } : l));
  }

  const filtered = loans.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
      (l.notes ?? "").toLowerCase().includes(q) ||
      (l.lender ?? "").toLowerCase().includes(q);
  });

  // Stage tracker totals
  const stageTotals = STAGES.map(s => ({
    ...s,
    count: filtered.filter(l => l.stage === s.key).length,
    amount: filtered.filter(l => l.stage === s.key).reduce((sum, l) => sum + (l.amount ?? 0), 0),
  }));

  if (loading) return <div style={{ padding: "32px", color: "var(--brown-500)" }}>Loading pipeline…</div>;

  return (
    <div className="pipeline">
      {/* Stage tracker */}
      <div className="stage-tracker">
        {stageTotals.map(s => (
          <div key={s.key} className={"stage-step" + (open.has(s.key) ? " current" : "")}
            onClick={() => setOpen(o => { const n = new Set(o); n.has(s.key) ? n.delete(s.key) : n.add(s.key); return n; })}>
            <div className="s-lbl">{s.label} <span className="num">{s.num}</span></div>
            <div className="s-val">{s.count} <span className="amt">{s.amount > 0 ? fmtK(s.amount) : ""}</span></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="pipe-toolbar">
        <div className="search">
          <Icon name="mag" size={14} className="mag" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, lender, notes…" />
        </div>
        <button className="chip" onClick={() => setOpen(new Set(STAGES.map(s => s.key)))}>Expand all</button>
        <button className="chip" onClick={() => setOpen(new Set())}>Collapse all</button>
      </div>

      {/* Groups */}
      <div className="board">
        {STAGES.map(s => {
          const rows = filtered.filter(l => l.stage === s.key);
          const isOpen = open.has(s.key);
          const totalAmt = rows.reduce((sum, l) => sum + (l.amount ?? 0), 0);
          const totalRev = rows.reduce((sum, l) => sum + (l.revenue ?? 0), 0);
          return (
            <div key={s.key} className={"group " + (isOpen ? "open" : "")}>
              <div className={"group-head " + s.cls} onClick={() => setOpen(o => { const n = new Set(o); n.has(s.key) ? n.delete(s.key) : n.add(s.key); return n; })}>
                <div className="bar" />
                <Icon name="chev" size={12} className="chev" />
                <span className="title">{s.label}</span>
                <span className="count">{rows.length}</span>
                <div className="sum">
                  {totalAmt > 0 && <span>Volume <span className="mono">{fmtK(totalAmt)}</span></span>}
                  {totalRev > 0 && <span>Rev <span className="mono">{fmtK(totalRev)}</span></span>}
                </div>
              </div>
              {isOpen && rows.length > 0 && (
                <div className="group-body">
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th className="sticky col-item">Borrower</th>
                          <th>Status</th>
                          <th className="num">Loan Amt</th>
                          <th>Processor</th>
                          <th>Lender</th>
                          <th className="num">Revenue</th>
                          <th>Notes</th>
                          <th>Date</th>
                          <th>Stage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(loan => (
                          <tr key={loan.id} className={hover === loan.id ? "hovered" : ""}
                            onMouseEnter={() => setHover(loan.id)}
                            onMouseLeave={() => setHover(null)}>
                            <td className="sticky">
                              <div className="name-cell">
                                <div className="av">{loan.firstName[0]}{loan.lastName[0]}</div>
                                <div>
                                  <div className="name" onClick={() => onOpenContact(loan.id)} style={{ cursor: "pointer" }}>
                                    {loan.firstName} {loan.lastName}
                                  </div>
                                  <div className="sub">{loan.externalId}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={"status-cell " + (STATUS_CLS[loan.status] ?? "")}>
                                {loan.statusLabel ?? loan.status}
                              </span>
                            </td>
                            <td className="num">{loan.amount ? fmt$(loan.amount) : "—"}</td>
                            <td>{loan.processor ?? "—"}</td>
                            <td>{loan.lender ?? "—"}</td>
                            <td className="num">{loan.revenue ? fmtK(loan.revenue) : "—"}</td>
                            <td><div className="note-cell">{loan.notes}</div></td>
                            <td><div className="date-cell">{loan.date}</div></td>
                            <td>
                              <select value={loan.stage}
                                onChange={e => updateStage(loan.id, e.target.value)}
                                style={{ padding: "3px 6px", fontSize: 11, borderRadius: 5, border: "1px solid var(--stroke)", fontFamily: "inherit", background: "white" }}>
                                {STAGES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {isOpen && rows.length === 0 && (
                <div className="add-row" style={{ color: "var(--brown-400)", fontStyle: "italic" }}>No loans in this stage</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
