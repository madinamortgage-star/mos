"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons/Icons";
import type { Loan } from "@/types";

// Board page handles preapproved, active leads, and past clients views.
// Each has different groupings but the same table structure.

interface Props {
  boardType: "preapproved" | "active" | "past";
  onOpenContact: (loanId: string) => void;
}

function fmtK(n: number) { return "$" + Math.round(n / 1000) + "K"; }

const STAGE_GROUPS: Record<string, Array<{ key: string; title: string; cls: string; stages: string[] }>> = {
  preapproved: [
    { key: "ratewatch",  title: "Rate Watch",                cls: "g-fund",    stages: [] },
    { key: "pending",    title: "Leads (App Pending)",       cls: "g-app",     stages: [] },
    { key: "working",    title: "Being Worked",              cls: "g-contact", stages: [] },
    { key: "preapproved",title: "Pre-Approved / Shopping",   cls: "g-pre",     stages: ["pre"] },
  ],
  active: [
    { key: "new",       title: "New Leads",          cls: "g-new",     stages: ["lead"] },
    { key: "contacted", title: "Contacted",          cls: "g-contact", stages: ["lead"] },
    { key: "app",       title: "Application Started",cls: "g-app",     stages: ["app"] },
    { key: "working",   title: "Being Worked",       cls: "g-proc",    stages: ["app"] },
    { key: "preapp",    title: "Pre-Approved",       cls: "g-pre",     stages: ["pre"] },
    { key: "lost",      title: "Inactive / Lost",    cls: "g-fund",    stages: [] },
  ],
  past: [
    { key: "refi",      title: "Refi Eligible",      cls: "g-fund",    stages: ["fund"] },
    { key: "life",      title: "Life Event Watch",    cls: "g-contact", stages: [] },
    { key: "referral",  title: "Top Referral Sources",cls: "g-new",     stages: [] },
    { key: "nurture",   title: "Nurture / Anniversary",cls: "g-app",    stages: [] },
    { key: "dormant",   title: "Dormant (12mo+)",     cls: "g-proc",    stages: [] },
  ],
};

export function BoardPage({ boardType, onOpenContact }: Props) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/loans")
      .then(r => r.json())
      .then((data: Loan[]) => {
        setLoans(data);
        // Default open first two groups
        const groups = STAGE_GROUPS[boardType];
        setOpen(new Set(groups.slice(0, 2).map(g => g.key)));
        setLoading(false);
      });
  }, [boardType]);

  const groups = STAGE_GROUPS[boardType];

  const filtered = loans.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${l.firstName} ${l.lastName}`.toLowerCase().includes(q);
  });

  // Distribute loans to groups by stage
  function getGroupLoans(group: typeof groups[0]) {
    if (group.stages.length === 0) return []; // groups without stage mapping show empty (seeded data needed)
    return filtered.filter(l => group.stages.includes(l.stage));
  }

  if (loading) return <div style={{ padding: "32px", color: "var(--brown-500)" }}>Loading…</div>;

  return (
    <div className="pipeline">
      {/* Toolbar */}
      <div className="pipe-toolbar" style={{ marginBottom: 14 }}>
        <div className="search">
          <Icon name="mag" size={14} className="mag" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name…" />
        </div>
      </div>

      {/* Groups */}
      <div className="board">
        {groups.map(group => {
          const rows = getGroupLoans(group);
          const isOpen = open.has(group.key);
          const totalAmt = rows.reduce((sum, l) => sum + (l.amount ?? 0), 0);

          return (
            <div key={group.key} className={"group " + (isOpen ? "open" : "")}>
              <div className={"group-head " + group.cls}
                onClick={() => setOpen(o => { const n = new Set(o); n.has(group.key) ? n.delete(group.key) : n.add(group.key); return n; })}>
                <div className="bar" />
                <Icon name="chev" size={12} className="chev" />
                <span className="title">{group.title}</span>
                <span className="count">{rows.length}</span>
                <div className="sum">
                  {totalAmt > 0 && <span>Vol <span className="mono">{fmtK(totalAmt)}</span></span>}
                </div>
              </div>

              {isOpen && (
                <div className="group-body">
                  {rows.length > 0 ? (
                    <div className="tbl-wrap">
                      <table className="tbl">
                        <thead>
                          <tr>
                            <th className="sticky col-item">Borrower</th>
                            <th className="col-phone">Phone</th>
                            <th className="col-stage">Stage</th>
                            <th className="col-notes">Notes</th>
                            <th className="col-money">Amount</th>
                            <th className="col-money">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(loan => (
                            <tr key={loan.id}>
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
                              <td className="col-phone">—</td>
                              <td className="col-stage">
                                <span className="stage-pill sp-pre">{loan.statusLabel ?? loan.status}</span>
                              </td>
                              <td><div className="note-cell">{loan.notes}</div></td>
                              <td className="col-money">{loan.amount ? fmtK(loan.amount) : "—"}</td>
                              <td className="col-money">{loan.revenue ? fmtK(loan.revenue) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="add-row" style={{ fontStyle: "italic", color: "var(--brown-400)" }}>
                      No records in this group
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
