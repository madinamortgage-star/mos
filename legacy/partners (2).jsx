/* global window, React */
const { useState, useMemo, useRef, useEffect } = React;

function fmt$(n) { if (n == null) return "—"; return "$" + n.toLocaleString(); }

function HVTag({ hv }) {
  if (!hv) return null;
  return <span className={"hv-tag hv-" + hv.tag}>{hv.label}</span>;
}

function StatusPill({ s }) {
  const cls = s === "hot" ? "rs-hot" : s === "warm" ? "rs-warm" : "rs-cold";
  const label = s === "hot" ? "Hot" : s === "warm" ? "Warm" : "Cold";
  return <span className={"rstat " + cls}>{label}</span>;
}

function ActionPill({ a }) {
  return <span className={"npa-pill u-" + a.urgency}>{a.text}</span>;
}

function PartnerHover({ p, x, y }) {
  if (!p) return null;
  const w = 320;
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = x + 18; if (left + w + 16 > vw) left = x - w - 18;
  let top = y + 14; if (top + 240 > vh) top = Math.max(20, vh - 250);
  return (
    <div className="hover-card simple" style={{ left, top }}>
      <div className="hc-name">{p.name}</div>
      <div className="hc-row"><span className="hc-l">Contact</span><span className="hc-v">{p.contact}</span></div>
      <div className="hc-row"><span className="hc-l">Annual Value</span><span className="hc-v mono">{fmt$(p.annualValue)}</span></div>
      <div className="hc-row"><span className="hc-l">Status</span><StatusPill s={p.status}/></div>
      <div className="hc-row note"><span className="hc-l">Next Action</span><span className="hc-v">{p.action.text}</span></div>
    </div>
  );
}

function PartnerRow({ p, onOpen, onHover, onLeave }) {
  return (
    <tr onMouseEnter={(e) => onHover(p, e)} onMouseMove={(e) => onHover(p, e)} onMouseLeave={onLeave}>
      <td className="sticky col-partner">
        <div className="prt-name">
          <div className="dot-status" data-s={p.status}/>
          <div>
            <div className="nm" onClick={() => onOpen(p)}>{p.name}</div>
            <div className="hv-row">{p.hv && <HVTag hv={p.hv}/>}</div>
          </div>
        </div>
      </td>
      <td className="cell-text">{p.contact}</td>
      <td className="cell-mono">{p.phone}</td>
      <td className="cell-text dim">{p.email}</td>
      <td className="cell-mono dim">{p.birthday}</td>
      <td className="cell-num"><b>{p.deals12}</b></td>
      <td className="cell-num dim">{p.totalTx}</td>
      <td className="cell-num primary">{fmt$(p.annualValue)}</td>
      <td className="cell-mono dim">{p.lastContact}</td>
      <td className="cell-mono">{p.nextContact}</td>
      <td className="cell-text note">{p.notes}</td>
      <td><StatusPill s={p.status}/></td>
      <td><ActionPill a={p.action}/></td>
      <td className="cell-call">
        <span className={"call-stat " + (p.callDone ? "done" : "todo")}>
          {p.callDone ? "✓ Done" : "○ Not done"}
        </span>
      </td>
    </tr>
  );
}

function PartnerGroup({ g, onOpen, onHover, onLeave }) {
  const [open, setOpen] = useState(g.defaultOpen);
  const totalValue = g.rows.reduce((n, r) => n + r.annualValue, 0);
  const totalDeals = g.rows.reduce((n, r) => n + r.deals12, 0);
  return (
    <div className={"group" + (open ? " open" : "")}>
      <div className="group-head" onClick={() => setOpen(o => !o)} style={{ borderLeftColor: g.color }}>
        <window.Icon name="chev" size={12} className="chev"/>
        <span className="bar" style={{ background: g.color }}/>
        <span className="title" style={{ color: g.color }}>{g.title}</span>
        <span className="count">{g.rows.length}</span>
        {g.subtitle && <span className="g-sub">· {g.subtitle}</span>}
        <div className="sum">
          <span>Deals (12mo) <span className="mono">{totalDeals}</span></span>
          <span>Value <span className="mono">{fmt$(totalValue)}</span></span>
        </div>
      </div>
      {open && (
        <div className="group-body">
          <div className="tbl-wrap">
            <table className="tbl partners-tbl">
              <thead>
                <tr>
                  <th className="sticky col-partner">Partner Name</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Birthday</th>
                  <th className="num">Deals (12mo)</th>
                  <th className="num">Total Tx</th>
                  <th className="num">Est. Annual $</th>
                  <th>Last Contact</th>
                  <th>Next Contact</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Next Action</th>
                  <th>Call</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map(p => (
                  <PartnerRow key={p.id} p={p} onOpen={onOpen} onHover={onHover} onLeave={onLeave}/>
                ))}
              </tbody>
            </table>
          </div>
          <div className="add-row"><window.Icon name="plus" size={12}/> Add partner</div>
        </div>
      )}
    </div>
  );
}

// Stats strip (across the top)
function PartnerStats() {
  const all = window.PARTNERS_RAW;
  const totalValue = all.reduce((n, p) => n + p.annualValue, 0);
  const totalDeals = all.reduce((n, p) => n + p.deals12, 0);
  const vipCount = all.filter(p => p.hv && p.hv.tag === "vip").length;
  const needCall = all.filter(p => p.action.urgency === "high").length;
  return (
    <div className="prt-stats">
      <div className="ps-card"><span className="l">Active partners</span><span className="v">{all.length}</span></div>
      <div className="ps-card"><span className="l">VIPs</span><span className="v accent">⭐ {vipCount}</span></div>
      <div className="ps-card"><span className="l">Deals (12 mo)</span><span className="v">{totalDeals}</span></div>
      <div className="ps-card primary"><span className="l">Annual value</span><span className="v">{fmt$(totalValue)}</span></div>
      <div className="ps-card warn"><span className="l">Need a call</span><span className="v">{needCall}</span></div>
    </div>
  );
}

function Partners({ onOpenPartner }) {
  const [view, setView] = useState("rel"); // rel | day
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const showT = useRef(null), hideT = useRef(null), pendRow = useRef(null), lastP = useRef({x:0,y:0});

  const onHover = (p, e) => {
    if (hideT.current) { clearTimeout(hideT.current); hideT.current = null; }
    const x = e.clientX, y = e.clientY;
    lastP.current = { x, y };
    if (hover && hover.id === p.id) { setPos({ x, y }); return; }
    if (showT.current) clearTimeout(showT.current);
    pendRow.current = p;
    showT.current = setTimeout(() => {
      setHover(pendRow.current);
      setPos({ x: lastP.current.x, y: lastP.current.y });
    }, 380);
  };
  const onLeave = () => {
    if (showT.current) { clearTimeout(showT.current); showT.current = null; }
    pendRow.current = null;
    hideT.current = setTimeout(() => setHover(null), 120);
  };
  useEffect(() => () => {
    if (hideT.current) clearTimeout(hideT.current);
    if (showT.current) clearTimeout(showT.current);
  }, []);

  const groups = view === "rel" ? window.PARTNER_GROUPS : window.PARTNER_DAY_GROUPS;

  return (
    <div className="pipeline partners-board">
      <PartnerStats/>

      <div className="pipe-toolbar">
        <div className="search">
          <span className="mag"><window.Icon name="mag" size={14}/></span>
          <input placeholder="Search partner, contact, email…"/>
        </div>
        <div className="view-toggle">
          <button className={view === "rel" ? "active" : ""} onClick={() => setView("rel")}>Relationship view</button>
          <button className={view === "day" ? "active" : ""} onClick={() => setView("day")}>Day-based view</button>
        </div>
        <div style={{ flex: 1 }}/>
        <button className="pill-btn"><window.Icon name="filter" size={13}/> Filter</button>
        <button className="pill-btn primary"><window.Icon name="plus" size={13}/> New partner</button>
      </div>

      <div className="board">
        {groups.map(g => (
          <PartnerGroup key={g.key} g={g} onOpen={onOpenPartner} onHover={onHover} onLeave={onLeave}/>
        ))}
      </div>

      <PartnerHover p={hover} x={pos.x} y={pos.y}/>
    </div>
  );
}

// ============= DETAIL VIEW =============

function PartnerDetail({ p, onBack }) {
  const history = [
    { d: "Apr 21", k: "call", t: "Call · 14 min", n: "Discussed HELOC programs for past clients. Promised to send overview." },
    { d: "Apr 14", k: "deal", t: "Deal sent", n: "Buyer pre-qual — $740K target." },
    { d: "Apr 09", k: "email", t: "Email", n: "Sent jumbo product training deck." },
    { d: "Mar 28", k: "lunch", t: "Lunch · Bay Club", n: "Quarterly check-in. Discussed Q2 marketing." },
    { d: "Mar 14", k: "gift", t: "Birthday gift", n: "Personalized note + bourbon." },
    { d: "Feb 22", k: "deal", t: "Deal sent", n: "Refi — $920K, closed in March." },
  ];
  const timeline = [
    { d: "Today", t: "Pulled into daily call list (priority)" },
    { d: "Apr 21", t: "Call logged · 14 min" },
    { d: "Apr 18", t: "Pacific Heights pipeline note added" },
    { d: "Apr 14", t: "Deal sent · Buyer pre-qual" },
    { d: "Apr 12", t: "Co-marketing piece scheduled (May 5)" },
    { d: "Apr 09", t: "Email sent · Jumbo training deck" },
    { d: "Mar 28", t: "Lunch · Bay Club (1.5h)" },
    { d: "Mar 14", t: "Birthday touchpoint logged" },
  ];
  return (
    <div className="prt-detail">
      <div className="prt-detail-top">
        <button className="back-btn" onClick={onBack}>← Back to Partners</button>
        <div className="ptd-summary">
          <div className="ptd-name">
            <div className="dot-status" data-s={p.status}/>
            <div>
              <h1>{p.name}</h1>
              <div className="ptd-sub">{p.contact} · <span className="mono">{p.id}</span> {p.hv && <HVTag hv={p.hv}/>}</div>
            </div>
          </div>
          <div className="ptd-stats">
            <div className="s"><span className="l">Deals sent (12mo)</span><span className="v">{p.deals12}</span></div>
            <div className="s"><span className="l">Total transactions</span><span className="v">{p.totalTx}</span></div>
            <div className="s"><span className="l">Annual value</span><span className="v primary">{fmt$(p.annualValue)}</span></div>
            <div className="s"><span className="l">Last contact</span><span className="v mono">{p.lastContact}</span></div>
            <div className="s"><span className="l">Next contact</span><span className="v mono">{p.nextContact}</span></div>
          </div>
        </div>
        <div className="ptd-actions">
          <button className="pill-btn"><window.Icon name="phone" size={13}/> Call</button>
          <button className="pill-btn"><window.Icon name="mail" size={13}/> Email</button>
          <button className="pill-btn primary"><window.Icon name="check" size={13}/> Log activity</button>
        </div>
      </div>

      <div className="prt-detail-grid">
        {/* LEFT — contact info + relationship */}
        <div className="ptd-col left">
          <section className="ptd-card">
            <h3>Contact</h3>
            <div className="ptd-kv"><span className="k">Contact person</span><span className="v">{p.contact}</span></div>
            <div className="ptd-kv"><span className="k">Phone</span><span className="v mono">{p.phone}</span></div>
            <div className="ptd-kv"><span className="k">Email</span><span className="v">{p.email}</span></div>
            <div className="ptd-kv"><span className="k">Birthday</span><span className="v mono">{p.birthday}</span></div>
          </section>
          <section className="ptd-card">
            <h3>Relationship</h3>
            <div className="ptd-kv"><span className="k">Status</span><span className="v"><StatusPill s={p.status}/></span></div>
            <div className="ptd-kv"><span className="k">Tier</span><span className="v">{p.hv ? p.hv.label : "Standard"}</span></div>
            <div className="ptd-kv"><span className="k">Next action</span><span className="v"><ActionPill a={p.action}/></span></div>
            <div className="ptd-kv"><span className="k">Cadence</span><span className="v">Bi-weekly call · Monthly meet</span></div>
          </section>
          <section className="ptd-card health">
            <h3>Relationship health</h3>
            <div className="health-bar"><div style={{ width: (p.status === "hot" ? 86 : p.status === "warm" ? 58 : 22) + "%" }}/></div>
            <div className="health-meta">
              <span>{p.status === "hot" ? "Strong" : p.status === "warm" ? "Steady" : "At risk"}</span>
              <span className="mono">{p.status === "hot" ? "86" : p.status === "warm" ? "58" : "22"}/100</span>
            </div>
          </section>
        </div>

        {/* CENTER — notes + history */}
        <div className="ptd-col center">
          <section className="ptd-card">
            <h3>Notes from last call</h3>
            <p className="ptd-notes-quote">"{p.notes}"</p>
            <div className="ptd-meta-row">Logged {p.lastContact}</div>
          </section>
          <section className="ptd-card">
            <h3>Conversation history</h3>
            <div className="conv-list">
              {history.map((h, i) => (
                <div key={i} className={"conv-item k-" + h.k}>
                  <div className="ci-date mono">{h.d}</div>
                  <div className="ci-body">
                    <div className="ci-title">{h.t}</div>
                    <div className="ci-note">{h.n}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT — activity timeline */}
        <div className="ptd-col right">
          <section className="ptd-card">
            <h3>Activity timeline</h3>
            <div className="tl-list">
              {timeline.map((t, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-bullet"/>
                  <div>
                    <div className="tl-d mono">{t.d}</div>
                    <div className="tl-t">{t.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Partners, PartnerDetail });
