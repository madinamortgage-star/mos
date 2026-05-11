"use client";

import { Icon } from "@/components/icons/Icons";

export type Page =
  | "home" | "prospecting" | "active" | "preapproved"
  | "pipeline" | "past" | "partners" | "contacts";

interface SidebarProps {
  active: Page;
  onNav: (page: Page) => void;
  counts: Record<string, number>;
  user: { name?: string | null; email?: string | null };
  nmls?: string;
  onQuickAdd: () => void;
}

const NAV_ITEMS: Array<{ key: Page; label: string; icon: string; countKey: string }> = [
  { key: "home",        label: "Home",              icon: "home",      countKey: "" },
  { key: "prospecting", label: "Prospecting",       icon: "target",    countKey: "prospecting" },
  { key: "active",      label: "Active Leads",      icon: "flame",     countKey: "active" },
  { key: "preapproved", label: "Pre-Approved Loans",icon: "check",     countKey: "preapproved" },
  { key: "pipeline",    label: "Loan Pipeline",     icon: "kanban",    countKey: "pipeline" },
  { key: "past",        label: "Past Clients",      icon: "users",     countKey: "past" },
  { key: "partners",    label: "Partners",          icon: "handshake", countKey: "partners" },
  { key: "contacts",    label: "Contacts",          icon: "user",      countKey: "contacts" },
];

export function Sidebar({ active, onNav, counts, user, nmls, onQuickAdd }: SidebarProps) {
  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">M</div>
        <div>
          <div className="name">MOS</div>
          <div className="sub">Mortgage OS</div>
        </div>
      </div>

      <button className="quick-add" onClick={onQuickAdd}>
        <span className="plus">+</span>
        <span>Quick add contact</span>
      </button>

      <div>
        <div className="section-label">Workspace</div>
        <nav>
          {NAV_ITEMS.map(it => (
            <button
              key={it.key}
              className={"nav-item" + (active === it.key ? " active" : "")}
              onClick={() => onNav(it.key)}
            >
              <Icon name={it.icon} size={16} />
              <span>{it.label}</span>
              {it.countKey && counts[it.countKey] != null && (
                <span className="count">{counts[it.countKey]}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="footer">
        <div className="avatar">{initials}</div>
        <div className="who">
          <b>{user.name ?? user.email}</b>
          {nmls && <span>NMLS #{nmls}</span>}
        </div>
      </div>
    </aside>
  );
}
