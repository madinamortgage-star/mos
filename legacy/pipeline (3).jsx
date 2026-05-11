/* global window, React */
const { useState, useMemo } = React;

function fmtMoney(n) {
  if (n == null) return "—";
  return "$" + n.toLocaleString();
}

function StageTracker({ groups, currentGroupKey }) {
  // compute count + sum per stage
  const agg = {};
  window.STAGES.forEach(s => { agg[s.key] = { count: 0, sum: 0 }; });
  groups.forEach(g => {
    g.rows.forEach(r => {
      if (!agg[r.stage]) agg[r.stage] = { count: 0, sum: 0 };
      agg[r.stage].count += 1;
      agg[r.stage].sum += r.loan;
    });
  });
  return (
    <div className="stage-tracker">
      {window.STAGES.map(s => {
        const a = agg[s.key] || { count: 0, sum: 0 };
        const isCurrent = s.key === "pre";
        return (
          <div key={s.key} className={"stage-step" + (isCurrent ? " current" : "")}>
            <div className="s-lbl"><span className="num">{s.num}</span><span>{s.label}</span></div>
            <div className="s-val">
              {a.count}
              <span className="amt">{a.sum ? fmtMoney(a.sum / 1000) + "K" : ""}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function statusClass(s) {
  return ({
    hot: "s-hot", warm: "s-warm", cool: "s-cool", stall: "s-stall", ok: "s-ok"
  })[s] || "";
}

function PipelineRow({ r, onOpen }) {
  const initials = (r.first[0] + r.last[0]).toUpperCase();
  return (
    <tr>
      <td className="sticky">
        <div className="name-cell">
          <div className="av">{initials}</div>
          <div>
            <div className="name" onClick={() => onOpen(r)}>{r.first} {r.last}</div>
            <div className="sub mono">{r.id}</div>
          </div>
        </div>
      </td>
      <td>
        <span className={"status-cell " + statusClass(r.status)}>
          <span className={"dot " + (r.status === "hot" ? "red" : r.status === "warm" ? "amber" : r.status === "ok" ? "green" : "navy")} />
          {r.statusLabel}
        </span>
      </td>
      <td>{r.lo}</td>
      <td>{r.processor}</td>
      <td>{r.lender}</td>
      <td className="num">{fmtMoney(r.loan)}</td>
      <td className="num">{fmtMoney(r.rev)}</td>
      <td className="num">{fmtMoney(r.com)}</td>
      <td><span className="pill-stage">{r.stage.toUpperCase()}</span></td>
      <td className="note-cell" title={r.notes}>{r.notes}</td>
      <td className="date-cell">{r.date}</td>
    </tr>
  );
}

function PipelineGroup({ g, onOpen }) {
  const [open, setOpen] = useState(g.defaultOpen);
  const sum = g.rows.reduce((n, r) => n + r.loan, 0);
  return (
    <div className={"group" + (open ? " open" : "")}>
      <div className={"group-head " + g.cls} onClick={() => setOpen(o => !o)}>
        <window.Icon name="chev" size={12} className="chev" />
        <span className="bar" />
        <span className="title">{g.title}</span>
        <span className="count">{g.rows.length}</span>
        <div className="sum">
          <span>Volume <span className="mono">{fmtMoney(sum)}</span></span>
          <span>Avg <span className="mono">{fmtMoney(Math.round(sum / (g.rows.length || 1)))}</span></span>
        </div>
      </div>
      {open && (
        <div className="group-body">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="sticky">Name</th>
                  <th>Loan Status</th>
                  <th>LO</th>
                  <th>Processor</th>
                  <th>Lender</th>
                  <th className="num">Loan Amount</th>
                  <th className="num">Revenue</th>
                  <th className="num">Commission</th>
                  <th>Stage</th>
                  <th>Notes</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map(r => (
                  <PipelineRow key={r.id} r={r} onOpen={onOpen} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="add-row">
            <window.Icon name="plus" size={12} /> Add lead to {g.title}
          </div>
        </div>
      )}
    </div>
  );
}

function Pipeline({ onOpenContact }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const groups = useMemo(() => {
    let gs = window.PIPELINE_GROUPS;
    if (q.trim()) {
      const needle = q.toLowerCase();
      gs = gs.map(g => ({
        ...g,
        rows: g.rows.filter(r =>
          (r.first + " " + r.last).toLowerCase().includes(needle) ||
          r.id.toLowerCase().includes(needle) ||
          (r.lender || "").toLowerCase().includes(needle)
        )
      }));
    }
    if (filter === "mine") {
      gs = gs.map(g => ({ ...g, rows: g.rows.filter(r => r.lo === "You") }));
    } else if (filter === "hot") {
      gs = gs.map(g => ({ ...g, rows: g.rows.filter(r => r.status === "hot") }));
    }
    return gs;
  }, [q, filter]);

  return (
    <div className="pipeline">
      <StageTracker groups={groups} />

      <div className="pipe-toolbar">
        <div className="search">
          <span className="mag"><window.Icon name="mag" size={14} /></span>
          <input
            placeholder="Search name, ID, lender…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <button className={"chip" + (filter === "all" ? " active" : "")} onClick={() => setFilter("all")}>All</button>
        <button className={"chip" + (filter === "mine" ? " active" : "")} onClick={() => setFilter("mine")}>My deals</button>
        <button className={"chip" + (filter === "hot" ? " active" : "")} onClick={() => setFilter("hot")}>Hot 🔥</button>
        <div style={{ flex: 1 }} />
        <button className="pill-btn"><window.Icon name="filter" size={13} /> Filter</button>
        <button className="pill-btn primary"><window.Icon name="plus" size={13} /> New Lead</button>
      </div>

      <div className="board">
        {groups.map(g => (
          <PipelineGroup key={g.key} g={g} onOpen={onOpenContact} />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Pipeline });
