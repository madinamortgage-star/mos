/* global window, React */
const { useState } = React;

function Sidebar({ active, onNav, counts, onQuickAdd }) {
  const Icon = window.Icon;
  const items = [
    { key: "home", label: "Home", icon: "home" },
    { key: "prospecting", label: "Prospecting", icon: "target", count: counts.prospecting },
    { key: "active", label: "Active Leads", icon: "flame", count: counts.active },
    { key: "preapproved", label: "Pre-Approved Loans", icon: "check", count: counts.preapproved },
    { key: "pipeline", label: "Loan Pipeline", icon: "kanban", count: counts.pipeline },
    { key: "past", label: "Past Clients", icon: "users", count: counts.past },
    { key: "partners", label: "Partners", icon: "handshake", count: counts.partners },
    { key: "contacts", label: "Contacts", icon: "user", count: counts.contacts },
  ];
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
          {items.map(it => (
            <button
              key={it.key}
              className={"nav-item" + (active === it.key ? " active" : "")}
              onClick={() => onNav(it.key)}
            >
              <Icon name={it.icon} size={16} />
              <span>{it.label}</span>
              {it.count != null && <span className="count">{it.count}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="footer">
        <div className="avatar">AR</div>
        <div className="who">
          <b>Alex Reyes</b>
          <span>NMLS #1902847</span>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar });
