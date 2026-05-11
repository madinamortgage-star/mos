/* global window, React */
const { useState, useMemo } = React;

function fmt$(n) { return "$" + n.toLocaleString(); }
function fmtK(n) { return "$" + Math.round(n / 1000) + "K"; }

function MoneyHero({ d, onAction }) {
  const pct = Math.min(100, Math.round((d.captured / d.available) * 100));
  return (
    <div className="money-hero">
      <div className="mh-grid">
        <div>
          <div className="mh-eyebrow">Money Opportunity · This quarter</div>
          <div className="mh-amount">
            {fmt$(d.available)}
            <span className="lbl">Available</span>
          </div>
          <div className="mh-line">You've captured <b style={{ color: "#E8B774", fontFamily: "var(--mono)" }}>{fmt$(d.captured)}</b> · {fmt$(d.available - d.captured)} still on the table</div>
          <div className="mh-bar"><div className="fill" style={{ width: pct + "%" }}/></div>
          <div className="mh-bar-labels">
            <span>Captured <span className="captured">{fmt$(d.captured)}</span></span>
            <span>Available <span className="available">{fmt$(d.available)}</span></span>
          </div>
        </div>
        <div className="mh-buckets">
          {d.buckets.map(b => (
            <div key={b.key} className={"mh-bucket tone-" + b.tone}>
              <div className="ic">{b.icon}</div>
              <div className="lbl"><b>{b.label}</b>{b.sub}</div>
              <div className="val"><span className="pre">$</span>{(b.value/1000).toFixed(1)}K</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Ring2({ done, goal }) {
  const r = 68, c = 2 * Math.PI * r;
  const off = c - c * (done / goal);
  return (
    <div className="day-ring">
      <svg width="156" height="156" viewBox="0 0 156 156">
        <circle cx="78" cy="78" r={r} className="trk"/>
        <circle cx="78" cy="78" r={r} className="fll" strokeDasharray={c} strokeDashoffset={off}/>
      </svg>
      <div className="ctr">
        <div className="n">{done}<span className="of"> / {goal}</span></div>
        <div className="l">Calls</div>
      </div>
    </div>
  );
}

function MarketSnapshot() {
  const rates = [
    { label: "30yr Fixed", value: "5.625%", delta: -0.125, dir: "down" },
    { label: "FHA",        value: "5.250%", delta: -0.125, dir: "down" },
    { label: "VA",         value: "5.375%", delta: -0.125, dir: "down" },
  ];
  return (
    <div className="market-snap">
      <div className="ms-head">
        <div>
          <div className="ms-eyebrow">Market Snapshot</div>
          <div className="ms-title">Rates are trending <b>down</b></div>
        </div>
        <div className="ms-when">As of 9:14 AM · refreshes hourly</div>
      </div>
      <div className="ms-grid">
        {rates.map(r => (
          <div key={r.label} className="ms-rate">
            <div className="ms-l">{r.label}</div>
            <div className="ms-v">{r.value}</div>
            <div className={"ms-d " + r.dir}>
              {r.dir === "down" ? "↓" : "↑"} {Math.abs(r.delta).toFixed(3).replace(/^0/,"")}% wk
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodayHandoff({ d, onGoTo }) {
  return (
    <div className="today-handoff">
      <div className="th-left">
        <div className="th-eyebrow">Today's Top 3 — start here</div>
        <div className="th-list">
          {d.topCalls.map((c, i) => (
            <div key={c.id} className="th-call">
              <span className="rk">#{i+1}</span>
              <div>
                <div className="nm">{c.name} <span className="tg">· {c.tag}</span></div>
                <div className="rs">{c.reason}</div>
              </div>
              <div className="vl"><span className="lb">Est. comm.</span>{fmt$(c.value)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="th-right">
        <div className="th-cta-card">
          <div className="th-cta-num">{d.todayCalls}<span className="of">/{d.todayGoal}</span></div>
          <div className="th-cta-l">calls completed</div>
          <button className="pill-btn primary" onClick={() => onGoTo("prospecting")} style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>
            <window.Icon name="phone" size={13}/> Open Prospecting
          </button>
          <div className="th-foot">{d.yesterdayMissed} missed yesterday · rolled forward</div>
        </div>
      </div>
    </div>
  );
}

function WeekAtGlance({ d }) {
  return (
    <div className="week-grid">
      <div className="week-days">
        {d.week.map(w => {
          const pct = Math.min(100, Math.round((w.calls / w.goal) * 100));
          return (
            <div key={w.day} className={"wd-cell " + w.status}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="day">{w.day}</span>
                <span className="date">{w.date}</span>
              </div>
              <div className="theme">{w.theme}</div>
              <div className="pcount">{w.calls}<span className="of"> / {w.goal}</span></div>
              <div className="pbar"><div style={{ width: pct + "%" }}/></div>
            </div>
          );
        })}
      </div>
      <div className="week-reminders">
        <h4>Reminders & rolled-forward</h4>
        {d.reminders.map((r, i) => (
          <div key={i} className={"rem-item " + r.kind}>
            <span className="ic">{r.kind === "birthday" ? "🎂" : r.kind === "deadline" ? "⏰" : "↻"}</span>
            <span className="tx">{r.text}</span>
            <button className="cta">{r.cta} →</button>
          </div>
        ))}
        <div className="onpace">
          <span className="ic">🎯</span>
          <span className="tx">On pace for <b>{fmt$(1140400)}</b> · annual goal {fmt$(1200000)}</span>
        </div>
      </div>
    </div>
  );
}

function ThisMonth({ m }) {
  const pct = Math.round((m.projectedIncome / m.goal) * 100);
  // Sparkline
  const max = Math.max(...m.trend);
  const w = 360, h = 60;
  const pts = m.trend.map((v, i) => {
    const x = (i / (m.trend.length - 1)) * w;
    const y = h - (v / max) * (h - 8) - 4;
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const fill = path + ` L ${w},${h} L 0,${h} Z`;
  return (
    <>
      <div className="month-grid">
        <div className="kpi">
          <div className="l">Fundings</div>
          <div className="v">{m.fundings}</div>
          <div className="delta">+2 vs last month</div>
        </div>
        <div className="kpi">
          <div className="l">Pipeline value</div>
          <div className="v"><span className="pre">$</span>{(m.pipelineValue / 1000000).toFixed(1)}M</div>
          <div className="delta">+$1.2M week-over-week</div>
        </div>
        <div className="kpi">
          <div className="l">Projected income</div>
          <div className="v">{fmt$(m.projectedIncome)}</div>
          <div className="delta">62% of monthly goal</div>
        </div>
      </div>
      <div className="goal-bar">
        <div className="top">
          <span className="lbl">Goal vs Actual · April</span>
          <span className="vals"><span className="cur">{fmt$(m.projectedIncome)}</span> <span className="of"> / {fmt$(m.goal)}</span></span>
        </div>
        <div className="bar"><div style={{ width: pct + "%" }}/></div>
      </div>
      <div className="spark">
        <div>
          <div className="lbl" style={{ marginBottom: 6 }}>12-month trend · monthly income (K)</div>
          <svg viewBox={`0 0 ${w} ${h}`}>
            <path d={fill} fill="rgba(148,69,71,0.08)"/>
            <path d={path} stroke="var(--red-600)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="var(--red-600)"/>)}
          </svg>
        </div>
        <div className="legend">Latest <b>{fmt$(m.trend[m.trend.length-1] * 1000)}</b></div>
      </div>
    </>
  );
}

function ThisYear({ y }) {
  const pct = Math.round((y.ytd / y.goal) * 100);
  const max = Math.max(...y.funnel.map(f => f.value));
  return (
    <div className="year-grid">
      <div className="year-card">
        <div className="l">YTD Income · 2026 goal {fmt$(y.goal)}</div>
        <div className="ytd">{fmt$(y.ytd)}</div>
        <div className="pace-line">On pace for <b>{fmt$(y.pace)}</b> · {pct}% of goal captured</div>
        <div className="ybar"><div style={{ width: pct + "%" }}/></div>
      </div>
      <div className="funnel">
        <h4>Activity → Outcome funnel · YTD</h4>
        {y.funnel.map((f, i) => (
          <div key={f.label} className={"funnel-row f" + i}>
            <span className="lbl">{f.label}</span>
            <span className="b"><div style={{ width: ((f.value / max) * 100) + "%" }}/></span>
            <span className="v">{f.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ onGoTo }) {
  const d = window.DASHBOARD;
  return (
    <div className="dashboard">
      <div className="db-greet">
        <div>
          <div className="crumb">Wednesday · April 22</div>
          <h1>Good morning, Alex.</h1>
        </div>
        <div className="right">
          <button className="pill-btn"><window.Icon name="clock" size={13}/> History</button>
          <button className="pill-btn primary" onClick={() => onGoTo("prospecting")}><window.Icon name="target" size={13}/> Win the day</button>
        </div>
      </div>

      <MoneyHero d={d} onAction={onGoTo}/>

      <MarketSnapshot/>

      <div className="db-sec"><h2><span className="ey">Today</span>Top calls</h2><span className="right">Progress lives in <button onClick={() => onGoTo("prospecting")} style={{ color: "var(--red-600)", fontWeight: 600, textDecoration: "underline" }}>Prospecting</button></span></div>
      <TodayHandoff d={d} onGoTo={onGoTo}/>

      <div className="db-sec"><h2><span className="ey">This week</span>Mon → Fri</h2><span className="right">Apr 20 – Apr 24</span></div>
      <WeekAtGlance d={d}/>

      <div className="db-sec"><h2><span className="ey">This month</span>Production</h2><span className="right">April · 22 of 30 days</span></div>
      <ThisMonth m={d.month}/>

      <div className="db-sec"><h2><span className="ey">This year</span>Big picture</h2><span className="right">YTD through April</span></div>
      <ThisYear y={d.year}/>
    </div>
  );
}

// ===== Refi Opportunities block (used in prospecting) =====
function RefiBlock({ opps, onGoTo }) {
  const total = opps.reduce((n, o) => n + o.commission, 0);
  return (
    <div className="refi-block">
      <h3>
        <span className="badge">↻ Refinance Opportunities</span>
        <span style={{ color: "var(--brown-600)", fontSize: 12, fontWeight: 500 }}>{opps.length} past clients · rates dropped</span>
        <span className="total">{fmt$(total)} potential</span>
      </h3>
      <div className="refi-grid">
        {opps.map(o => (
          <div key={o.id} className="refi-card">
            <div>
              <div className="nm">{o.name}</div>
              <div className="sub">{o.since} · Balance {fmt$(o.balance)}</div>
              <div className="rates" style={{ marginTop: 4 }}>
                <span className="from">{o.prevRate}</span> → <span className="to">{o.currentRate}</span>
              </div>
            </div>
            <div className="save">
              <span className="lb">Save / mo</span>
              ${o.savings}
            </div>
            <div className="save" style={{ color: "var(--ink-900)" }}>
              <span className="lb">Est. comm.</span>
              {fmt$(o.commission)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Upgraded Prospecting (typed sections + high-value cards) =====
function CallCardV2({ card, done, onMark }) {
  return (
    <div className={"call-card" + (card.priority === "high" && card.value && card.value > 7000 ? " high-value" : "") + (done ? " done" : "")}>
      <div className="c-left">
        <div className="c-top">
          <span className="c-name">{card.name}</span>
          <span className={"tag " + card.tag}>{card.tagLabel}</span>
          {card.value && card.value > 7000 && <span className="hv-tag">🔥 High Value</span>}
          <span className="c-phone">{card.phone}</span>
        </div>
        <div className="c-context">{card.context}</div>
        <div className="c-action"><b>Say:</b> {card.action}</div>
      </div>
      <div className="c-right">
        {card.value != null && (
          <div className="c-value">
            <span className="lb">{card.valueLabel}</span>
            {fmt$(card.value)}
          </div>
        )}
        <div className="c-meta-right"><span className="mono">Last · {card.lastTouch}</span></div>
        <button className="mark-done" onClick={() => onMark(card.id)}>{done ? <><window.Icon name="check" size={14}/> Done</> : "Mark Done"}</button>
      </div>
    </div>
  );
}

function WinTheDayHero({ done, total, streak, xp }) {
  const r = 88;
  const c = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : done / total;
  const offset = c - c * pct;
  const remaining = Math.max(0, total - done);
  const motivation = done === 0 ? "Let's get started"
    : pct < 0.34 ? "Keep going"
    : pct < 0.67 ? "You're rolling"
    : pct < 1 ? "Almost there"
    : "🎉 Goal hit!";
  const xpPct = Math.min(100, (xp / 250) * 100);
  return (
    <div className="win-day-hero">
      <div className="hero-ring big">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={r} className="ring-track"/>
          <circle cx="100" cy="100" r={r} className="ring-fill" strokeDasharray={c} strokeDashoffset={offset}/>
        </svg>
        <div className="ring-label">
          <div className="num">{done}<span className="slash">/</span>{total}</div>
          <div className="lbl">Calls</div>
        </div>
      </div>
      <div className="wd-meta">
        <div className="eyebrow">Today's Progress · Win the Day</div>
        <h2>{done} / {total} Calls</h2>
        <div className="wd-sub">You are <b>{remaining} {remaining === 1 ? "call" : "calls"}</b> away from completing today.</div>
        <div className="wd-motivate">{motivation}</div>
        <div className="xp-bar" style={{ maxWidth: 360, marginTop: 14 }}><div style={{ width: xpPct + "%" }}/></div>
      </div>
      <div className="wd-stats">
        <div className="wd-stat"><span className="v accent">{streak}</span><span className="l">Day streak 🔥</span></div>
        <div className="wd-stat"><span className="v">{xp}<span className="unit">xp</span></span><span className="l">Today</span></div>
        <div className="wd-stat"><span className="v">14</span><span className="l">This week</span></div>
      </div>
    </div>
  );
}

function TypedProspecting({ onToast }) {
  const [doneIds, setDoneIds] = useState(() => new Set());
  const [openMap, setOpenMap] = useState(() => {
    const m = {}; window.PROSPECT_TYPED.forEach(s => m[s.key] = s.defaultOpen); return m;
  });
  const dailyGoal = 12;
  const done = Math.min(doneIds.size, dailyGoal);
  const xp = doneIds.size * 25;
  const onMark = (id) => {
    setDoneIds(p => {
      if (p.has(id)) return p;
      const n = new Set(p); n.add(id);
      onToast && onToast({ text: "Call logged", xp: "+25 XP" });
      return n;
    });
  };
  return (
    <div className="prospecting">
      <WinTheDayHero done={done} total={dailyGoal} streak={12} xp={xp}/>
      {window.PROSPECT_TYPED.map(s => {
        const open = openMap[s.key];
        const doneCount = s.cards.filter(c => doneIds.has(c.id)).length;
        return (
          <section key={s.key} className={"prospect-section" + (open ? " open" : "") + (s.isHighValue ? " must" : "")}>
            <div className="s-head" onClick={() => setOpenMap(m => ({ ...m, [s.key]: !m[s.key] }))}>
              <window.Icon name="chev" size={14} className="chev"/>
              <span className="s-title">{s.title}</span>
              <span className="s-count">{doneCount}/{s.cards.length}</span>
              {s.eyebrow && <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--brown-500)", letterSpacing: "0.06em" }}>{s.eyebrow}</span>}
            </div>
            {open && (
              <div className="call-list">
                {s.cards.map(c => <CallCardV2 key={c.id} card={c} done={doneIds.has(c.id)} onMark={onMark}/>)}
              </div>
            )}
          </section>
        );
      })}
      <RefiBlock opps={window.REFI_OPPS}/>
    </div>
  );
}

Object.assign(window, { Dashboard, TypedProspecting });
