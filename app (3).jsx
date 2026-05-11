/* global window, React, ReactDOM */
const { useState, useEffect, useMemo } = React;

function PageHeader({ title, crumb, right }) {
  return (
    <div className="page-header">
      <div>
        <div className="crumb">{crumb}</div>
        <h1>{title}</h1>
      </div>
      <div className="right">{right}</div>
    </div>
  );
}

function Toasts({ items }) {
  return (
    <div className="toast-wrap">
      {items.map((t, i) => (
        <div key={t.id} className="toast">
          <span>{t.text}</span>
          {t.xp && <span className="xp">{t.xp}</span>}
        </div>
      ))}
    </div>
  );
}

function HomePlaceholder({ onGo }) {
  return (
    <div style={{ padding: "40px 32px", maxWidth: 1100 }}>
      <div style={{ fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brown-500)", fontWeight: 500, marginBottom: 6 }}>Wednesday · April 22</div>
      <h1 style={{ fontSize: 36, margin: 0, letterSpacing: "-0.02em", color: "var(--ink-900)" }}>Good morning, Alex.</h1>
      <p style={{ color: "var(--brown-600)", fontSize: 15, marginTop: 8, maxWidth: 560 }}>
        You have 5 priority calls, 2 files in underwriting, and 1 rush pre-approval to rate-lock today.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 28 }}>
        <button onClick={() => onGo("prospecting")} style={{ textAlign: "left", padding: 24, background: "var(--navy-900)", color: "#F5ECD7", borderRadius: 14, boxShadow: "var(--shadow-lg)" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#D8B17A", fontWeight: 600 }}>Start here</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>Prospecting →</div>
          <div style={{ color: "#BFAD88", fontSize: 13, marginTop: 6 }}>Today's 5 calls · follow-ups day</div>
        </button>
        <button onClick={() => onGo("pipeline")} style={{ textAlign: "left", padding: 24, background: "white", border: "1px solid var(--stroke)", borderRadius: 14, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--red-600)", fontWeight: 600 }}>Pipeline</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>17 active loans →</div>
          <div style={{ color: "var(--brown-600)", fontSize: 13, marginTop: 6 }}>$9.8M volume · $196K projected revenue</div>
        </button>
      </div>
      <div style={{ marginTop: 28, padding: 18, background: "white", border: "1px solid var(--stroke)", borderRadius: 12, fontSize: 13, color: "var(--brown-700)" }}>
        This is a <b>prototype</b> — click around: <b>Prospecting</b> to run the daily call list, <b>Loan Pipeline</b> to open the board, and click any name in the pipeline to open the contact detail modal.
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [density, setDensity] = useState(window.TWEAKS.density || "comfortable");
  const [contact, setContact] = useState(null);
  const [toasts, setToasts] = useState([]);
  const editMode = window.useEditMode();

  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  const pushToast = (t) => {
    const id = Date.now() + Math.random();
    setToasts(list => [...list, { ...t, id }]);
    setTimeout(() => {
      setToasts(list => list.filter(x => x.id !== id));
    }, 2400);
  };

  const setDensityPersist = (d) => {
    setDensity(d);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { density: d } }, "*");
  };

  const openContact = (r) => {
    // Use default contact data for now; merge in name/phone from row if different
    const c = { ...window.CONTACT_DEFAULT,
      id: r.id,
      name: r.first + " " + r.last,
      stage: r.stage,
      loan: { ...window.CONTACT_DEFAULT.loan, amount: r.loan },
    };
    setContact(c);
  };

  const counts = {
    prospecting: 7,
    active: 4,
    preapproved: 4,
    pipeline: 17,
    past: 128,
    partners: 24,
    contacts: 412,
  };

  const headerMap = {
    home:        { crumb: "Today", title: "Dashboard" },
    prospecting: { crumb: "Daily Call System", title: "Prospecting" },
    pipeline:    { crumb: "Board · Monday.com style", title: "Loan Pipeline" },
    active:      { crumb: "Active Workspace", title: "Active Leads" },
    preapproved: { crumb: "Monday-style board", title: "Pre-Approved Loans" },
    past:        { crumb: "Retention & reactivation", title: "Past Clients" },
    partners:    { crumb: "Workspace", title: "Partners" },
    contacts:    { crumb: "Workspace", title: "Contacts" },
  };

  return (
    <div className="app" data-screen-label={page}>
      <window.Sidebar
        active={page}
        onNav={setPage}
        counts={counts}
        onQuickAdd={() => pushToast({ text: "Quick-add (demo) — form would open here" })}
      />
      <main className="main">
        {page === "home" && (
          <window.Dashboard onGoTo={setPage} />
        )}
        {page === "prospecting" && (
          <>
            <PageHeader
              {...headerMap.prospecting}
              right={<>
                <button className="pill-btn"><window.Icon name="clock" size={13} /> History</button>
                <button className="pill-btn primary"><window.Icon name="phone" size={13} /> Dial next</button>
              </>}
            />
            <window.Prospecting onToast={pushToast} />
          </>
        )}
        {page === "pipeline" && (
          <>
            <PageHeader
              {...headerMap.pipeline}
              right={<>
                <button className="pill-btn"><window.Icon name="doc" size={13} /> Export</button>
                <button className="pill-btn primary"><window.Icon name="plus" size={13} /> New Loan</button>
              </>}
            />
            <window.Pipeline onOpenContact={openContact} />
          </>
        )}
        {page === "preapproved" && (
          <>
            <PageHeader
              {...headerMap.preapproved}
              right={<>
                <button className="pill-btn"><window.Icon name="doc" size={13} /> Export</button>
                <button className="pill-btn primary"><window.Icon name="plus" size={13} /> New Pre-Approval</button>
              </>}
            />
            <window.MondayBoard groups={window.PREAPPROVED_GROUPS} onOpenContact={openContact} />
          </>
        )}
        {page === "past" && (
          <>
            <PageHeader
              {...headerMap.past}
              right={<>
                <button className="pill-btn"><window.Icon name="mail" size={13} /> Bulk email</button>
                <button className="pill-btn primary"><window.Icon name="sparkle" size={13} /> Rate Alert Scan</button>
              </>}
            />
            <window.MondayBoard groups={window.PASTCLIENTS_GROUPS} onOpenContact={openContact} />
          </>
        )}
        {page === "active" && (
          <>
            <PageHeader
              {...headerMap.active}
              right={<>
                <button className="pill-btn"><window.Icon name="doc" size={13} /> Export</button>
                <button className="pill-btn primary"><window.Icon name="plus" size={13} /> New Lead</button>
              </>}
            />
            <window.MondayBoard groups={window.ACTIVELEADS_GROUPS} onOpenContact={openContact} />
          </>
        )}
        {page === "partners" && !contact && (
          <>
            {window.__partnerDetail ? (
              <window.PartnerDetail p={window.__partnerDetail} onBack={() => { window.__partnerDetail = null; setPage("partners-x"); setTimeout(() => setPage("partners"), 0); }}/>
            ) : (
              <>
                <PageHeader {...headerMap.partners}/>
                <window.Partners onOpenPartner={(p) => { window.__partnerDetail = p; setPage("partners-x"); setTimeout(() => setPage("partners"), 0); }}/>
              </>
            )}
          </>
        )}
        {page === "contacts" && (
          <>
            <PageHeader
              {...headerMap.contacts}
              right={<>
                <button className="pill-btn"><window.Icon name="doc" size={13} /> Import</button>
                <button className="pill-btn"><window.Icon name="doc" size={13} /> Export</button>
                <button className="pill-btn primary"><window.Icon name="plus" size={13} /> New contact</button>
              </>}
            />
            <window.Contacts />
          </>
        )}
      </main>

      {contact && <window.ContactModal contact={contact} onClose={() => setContact(null)} />}
      {editMode && <window.TweaksPanel density={density} onChange={setDensityPersist} />}
      <Toasts items={toasts} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
