/* global window, React */
const { useState, useMemo, useRef, useEffect } = React;

function fmtMoneyM(n) { return n == null ? "—" : "$" + n.toLocaleString(); }

function purposeCls(p) {
  if (!p) return "";
  const l = p.toLowerCase();
  if (l.includes("purchase")) return "p-purchase";
  if (l.includes("partner"))  return "p-partner";
  if (l.includes("nurture") || l.includes("sale")) return "p-nurture";
  if (l.includes("heloc"))    return "p-heloc";
  if (l.includes("hard"))     return "p-hard";
  return "";
}

function HoverCard({ row, x, y }) {
  if (!row) return null;
  const w = 300;
  const pad = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = x + 18;
  if (left + w + pad > vw) left = x - w - 18;
  let top = y + 14;
  if (top + 240 > vh) top = Math.max(20, vh - 250);

  // Simplified content — different shape for "loan" rows (have amount) vs "lead" rows
  const isLoan = row.amount != null && row.amount > 0;
  const nextAction = row.notes || (row.followup ? "Follow up by " + row.followup : "—");

  return (
    <div className="hover-card simple" style={{ left, top }}>
      <div className="hc-name">{row.first} {row.last}</div>
      <div className="hc-row">
        <span className="hc-l">{isLoan ? "Loan amount" : "Phone"}</span>
        <span className="hc-v mono">{isLoan ? fmtMoneyM(row.amount) : row.phone}</span>
      </div>
      <div className="hc-row">
        <span className="hc-l">Stage</span>
        <span className={"stage-pill " + (row.stagePill?.cls || "")}>{row.stagePill?.label || "—"}</span>
      </div>
      <div className="hc-row note">
        <span className="hc-l">{isLoan ? "Next action" : "Note"}</span>
        <span className="hc-v">{nextAction}</span>
      </div>
    </div>
  );
}

function MondayRow({ r, onOpen, onHover, onLeave }) {
  const initials = (r.first[0] + r.last[0]).toUpperCase();
  return (
    <tr
      onMouseEnter={(e) => onHover(r, e)}
      onMouseMove={(e) => onHover(r, e)}
      onMouseLeave={onLeave}
    >
      <td className="sticky col-item">
        <div className="name-cell">
          <div className="av">{initials}</div>
          <div>
            <div className="name" onClick={() => onOpen(r)}>{r.first} {r.last}</div>
            <div className="sub mono">{r.id}</div>
          </div>
        </div>
      </td>
      <td className="col-lo">
        <span className={"lo-av " + (r.lo === "CV" ? "cv" : "")}>{r.lo}</span>
      </td>
      <td className="col-phone">{r.phone}</td>
      <td className="col-email">{r.email}</td>
      <td className="col-stage">
        <span className={"stage-pill " + (r.stagePill?.cls || "")}>{r.stagePill?.label || "—"}</span>
      </td>
      <td className="col-notes note-cell" title={r.notes}>{r.notes}</td>
      <td className="date-cell">{r.followup || "—"}</td>
      <td className="date-cell">{r.updated}</td>
      <td className="col-purpose">
        {r.purpose && <span className={"purpose-pill " + purposeCls(r.purpose)}>{r.purpose}</span>}
      </td>
      <td className="col-money num">{fmtMoneyM(r.amount)}</td>
      <td className="col-money num">{fmtMoneyM(r.rev)}</td>
      <td className="col-money num">{fmtMoneyM(r.com)}</td>
    </tr>
  );
}

function MondayGroup({ g, onOpen, onHover, onLeave }) {
  const [open, setOpen] = useState(g.defaultOpen);
  return (
    <div className={"group" + (open ? " open" : "")}>
      <div className={"group-head " + g.cls} onClick={() => setOpen(o => !o)} style={{ borderLeft: `3px solid ${g.color || "var(--navy-600)"}` }}>
        <window.Icon name="chev" size={12} className="chev" />
        <span className="bar" style={{ background: g.color }} />
        <span className="title" style={{ color: g.color }}>{g.title}</span>
        <span className="count">{g.rows.length}</span>
      </div>
      {open && (
        <div className="group-body">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="sticky col-item">Item</th>
                  <th className="col-lo">LO</th>
                  <th className="col-phone">Borrower Phone</th>
                  <th className="col-email">Email</th>
                  <th className="col-stage">Stage</th>
                  <th className="col-notes">Notes</th>
                  <th>Follow-up</th>
                  <th>Last Updated</th>
                  <th className="col-purpose">Purpose</th>
                  <th className="num">Pre-Approved $</th>
                  <th className="num">Revenue</th>
                  <th className="num">Commission</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map(r => (
                  <MondayRow key={r.id} r={r} onOpen={onOpen} onHover={onHover} onLeave={onLeave} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="add-row"><window.Icon name="plus" size={12}/> Add item</div>
        </div>
      )}
    </div>
  );
}

function MondayBoard({ groups, onOpenContact, title, subtitle }) {
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const showTimer = useRef(null);
  const hideTimer = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const pendingRow = useRef(null);

  const onHover = (r, e) => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    const x = e.clientX, y = e.clientY;
    // movement check — only count "still" if cursor barely moves
    const moved = Math.hypot(x - lastPos.current.x, y - lastPos.current.y);
    lastPos.current = { x, y };

    // If hover already shown for this row, just track position
    if (hover && hover.id === r.id) {
      setPos({ x, y });
      return;
    }

    // Restart timer if moving fast or different row
    if (showTimer.current) clearTimeout(showTimer.current);
    pendingRow.current = r;
    showTimer.current = setTimeout(() => {
      // Confirm cursor is still on a row when timer fires
      setHover(pendingRow.current);
      setPos({ x: lastPos.current.x, y: lastPos.current.y });
    }, 380);
  };
  const onLeave = () => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    pendingRow.current = null;
    hideTimer.current = setTimeout(() => setHover(null), 120);
  };
  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (showTimer.current) clearTimeout(showTimer.current);
  }, []);

  return (
    <div className="pipeline">
      <div className="pipe-toolbar">
        <div className="search">
          <span className="mag"><window.Icon name="mag" size={14} /></span>
          <input placeholder="Search name, ID, lender…" />
        </div>
        <button className="chip active">All</button>
        <button className="chip">My items</button>
        <button className="chip">Needs follow-up</button>
        <div style={{ flex: 1 }} />
        <button className="pill-btn"><window.Icon name="filter" size={13} /> Filter</button>
        <button className="pill-btn primary"><window.Icon name="plus" size={13} /> New item</button>
      </div>

      <div className="board">
        {groups.map(g => (
          <MondayGroup key={g.key} g={g} onOpen={onOpenContact} onHover={onHover} onLeave={onLeave} />
        ))}
      </div>

      <HoverCard row={hover} x={pos.x} y={pos.y} />
    </div>
  );
}

Object.assign(window, { MondayBoard });
