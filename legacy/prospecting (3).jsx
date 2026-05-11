/* global window, React */
const { useState, useMemo } = React;

// ============================================================
// PROSPECTING — Minimal Call Queue
// One job: show me who to call, let me call them, log it, move on.
// ============================================================

// Build a single flat queue from the existing data, with sort key.
function buildQueue() {
  const cards = window.PROSPECT_SECTIONS.flatMap(s => s.cards.map(c => ({ ...c, _section: s.key })));
  const meta = {
    p1: { company: "Delgado Holdings",     daysSince: 6,   bucket: "overdue", overdueBy: "6 days" },
    p2: { company: "RE/MAX Premier",       daysSince: 2,   bucket: "today",   overdueBy: "Due today" },
    p3: { company: "Self · Past Client",   daysSince: 124, bucket: "overdue", overdueBy: "4 months" },
    p4: { company: "Keller Williams",      daysSince: 91,  bucket: "overdue", overdueBy: "3 months" },
    p5: { company: "Okafor Family",        daysSince: 0,   bucket: "today",   overdueBy: "Due today" },
    p6: { company: "Brooks Family",        daysSince: 184, bucket: "overdue", overdueBy: "6 months" },
    p7: { company: "Compass",              daysSince: 62,  bucket: "hot",     overdueBy: "2 months" },
  };
  const enriched = cards.map(c => ({ ...c, ...(meta[c.id] || { company: "—", daysSince: 0, bucket: "today", overdueBy: "Due today" }) }));

  // Sort: overdue first, then hot (high prio not overdue), then today
  const order = { overdue: 0, hot: 1, today: 2 };
  return enriched.sort((a, b) => {
    const bucketDiff = order[a.bucket] - order[b.bucket];
    if (bucketDiff !== 0) return bucketDiff;
    // within bucket: high prio first, then most overdue
    const prio = { high: 0, med: 1, low: 2 };
    const pd = prio[a.priority] - prio[b.priority];
    if (pd !== 0) return pd;
    return b.daysSince - a.daysSince;
  });
}

function PrioDot({ p }) {
  const color = p === "high" ? "var(--red-600)" : p === "med" ? "var(--warn)" : "var(--brown-400)";
  const label = p === "high" ? "High" : p === "med" ? "Medium" : "Low";
  return (
    <span className="pq-prio" title={label + " priority"}>
      <i style={{ background: color }} />
      {label}
    </span>
  );
}

function BucketBadge({ bucket, overdueBy }) {
  if (bucket === "overdue") {
    return <span className="pq-badge overdue">Overdue · {overdueBy}</span>;
  }
  if (bucket === "hot") {
    return <span className="pq-badge hot">Hot lead</span>;
  }
  return <span className="pq-badge today">Due today</span>;
}

function lastContactLabel(days) {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const m = Math.round(days / 30);
  return m === 1 ? "1 month ago" : `${m} months ago`;
}

function CallItem({ card, done, onCall, onLog }) {
  const [showLog, setShowLog] = useState(false);
  return (
    <li className={"pq-item" + (done ? " is-done" : "")}>
      <div className="pq-main">
        <div className="pq-head">
          <span className="pq-name">{card.name}</span>
          <BucketBadge bucket={card.bucket} overdueBy={card.overdueBy} />
          <PrioDot p={card.priority} />
        </div>
        <div className="pq-meta">
          <span className="pq-company">{card.company}</span>
          <span className="pq-sep">·</span>
          <a className="pq-phone" href={`tel:${card.phone}`}>{card.phone}</a>
          <span className="pq-sep">·</span>
          <span className="pq-last">Last contact: {lastContactLabel(card.daysSince)}</span>
        </div>
        <div className="pq-note">{card.context}</div>
      </div>

      <div className="pq-cta">
        {done ? (
          <span className="pq-done"><window.Icon name="check" size={14}/> Logged</span>
        ) : (
          <>
            <button className="pq-call" onClick={() => onCall(card)}>
              <window.Icon name="phone" size={14}/> Call now
            </button>
            <button className="pq-log" onClick={() => setShowLog(s => !s)}>Log</button>
          </>
        )}
        {showLog && !done && (
          <div className="pq-log-pop">
            {["Connected", "Left voicemail", "No pickup", "Wrong number"].map(d => (
              <button key={d} onClick={() => { onLog(card, d); setShowLog(false); }}>{d}</button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

function Prospecting({ onToast }) {
  const queue = useMemo(() => buildQueue(), []);
  const [done, setDone] = useState(() => new Set());

  const totalDue = queue.length;
  const overdueCount = queue.filter(c => c.bucket === "overdue").length;
  const completed = done.size;

  const handleCall = (c) => {
    onToast && onToast({ text: `Calling ${c.name}…`, xp: c.phone });
    setTimeout(() => {
      setDone(prev => {
        if (prev.has(c.id)) return prev;
        const next = new Set(prev); next.add(c.id);
        return next;
      });
      onToast && onToast({ text: "Call logged", xp: "Connected" });
    }, 700);
  };

  const handleLog = (c, disposition) => {
    setDone(prev => {
      if (prev.has(c.id)) return prev;
      const next = new Set(prev); next.add(c.id);
      return next;
    });
    onToast && onToast({ text: `${c.name} — ${disposition}`, xp: "Logged" });
  };

  // Show pending first, completed at the bottom (or hidden)
  const pending   = queue.filter(c => !done.has(c.id));
  const completedList = queue.filter(c =>  done.has(c.id));

  return (
    <div className="pq">
      <div className="pq-summary">
        <div className="pq-stat">
          <span className="pq-stat-v">{totalDue - completed}</span>
          <span className="pq-stat-l">Calls due today</span>
        </div>
        <div className="pq-stat-divider" />
        <div className="pq-stat">
          <span className="pq-stat-v overdue">{Math.max(0, overdueCount - completedList.filter(c => c.bucket === "overdue").length)}</span>
          <span className="pq-stat-l">Overdue</span>
        </div>
        <div className="pq-stat-divider" />
        <div className="pq-stat">
          <span className="pq-stat-v done">{completed}</span>
          <span className="pq-stat-l">Completed today</span>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="pq-empty-state">
          <div className="pq-empty-mark"><window.Icon name="check" size={28}/></div>
          <div className="pq-empty-title">You're done for today.</div>
          <div className="pq-empty-sub">{completed} {completed === 1 ? "call" : "calls"} logged. Tomorrow's queue arrives at 6am.</div>
        </div>
      ) : (
        <>
          <div className="pq-section-head">
            <span className="pq-section-title">Calls needing attention</span>
            <span className="pq-section-count">{pending.length}</span>
          </div>
          <ul className="pq-list">
            {pending.map(c => (
              <CallItem key={c.id} card={c} done={false} onCall={handleCall} onLog={handleLog} />
            ))}
          </ul>
        </>
      )}

      {completedList.length > 0 && pending.length > 0 && (
        <>
          <div className="pq-section-head muted">
            <span className="pq-section-title">Completed</span>
            <span className="pq-section-count">{completedList.length}</span>
          </div>
          <ul className="pq-list muted">
            {completedList.map(c => (
              <CallItem key={c.id} card={c} done={true} onCall={handleCall} onLog={handleLog} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

Object.assign(window, { Prospecting });
