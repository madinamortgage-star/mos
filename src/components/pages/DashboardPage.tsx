"use client";

import { useState, useEffect } from "react";
import type { DashboardData } from "@/types";
import type { Page } from "@/components/layout/Sidebar";

interface Props {
  onGoTo: (page: Page) => void;
}

function fmt$(n: number) { return "$" + n.toLocaleString(); }
function fmtK(n: number) { return "$" + Math.round(n / 1000) + "K"; }

export function DashboardPage({ onGoTo }: Props) {
  const [d, setD] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setD);
  }, []);

  if (!d) {
    return (
      <div style={{ padding: "40px 32px", color: "var(--brown-500)" }}>
        Loading dashboard…
      </div>
    );
  }

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div className="db-greet">
        <div>
          <div className="crumb">{dayName} · {dateStr}</div>
          <h1>Good morning.</h1>
        </div>
        <div className="right">
          <button className="pill-btn">View full report</button>
        </div>
      </div>

      {/* Money hero */}
      <div className="money-hero" style={{ marginBottom: 20 }}>
        <div className="mh-grid">
          <div>
            <div className="mh-eyebrow">Money Opportunity · This quarter</div>
            <div className="mh-amount">
              {fmt$(d.available)}
              <span className="lbl" style={{ fontSize: 14, fontWeight: 500, color: "#D8B17A", marginLeft: 10 }}>Available</span>
            </div>
            <div className="mh-line" style={{ color: "#BFAD88", fontSize: 13.5 }}>
              You&apos;ve captured{" "}
              <b style={{ color: "#E8B774", fontFamily: "var(--mono)" }}>{fmt$(d.captured)}</b>
              {" · "}{fmt$(d.available - d.captured)} still on the table
            </div>
            <div className="mh-bar" style={{ height: 6, borderRadius: 999, background: "rgba(216,177,122,0.14)", marginTop: 12, overflow: "hidden" }}>
              <div className="fill" style={{ width: `${Math.min(100, Math.round((d.captured / d.available) * 100))}%`, height: "100%", background: "linear-gradient(90deg, #E8B774, #D8B17A)", borderRadius: 999 }} />
            </div>
          </div>
          <div className="mh-buckets" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {d.buckets.map(b => (
              <div key={b.key} className={"mh-bucket tone-" + b.tone}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(216,177,122,0.12)" }}>
                <div style={{ fontSize: 20 }}>{b.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#F5ECD7" }}>{b.label}</div>
                  <div style={{ fontSize: 11.5, color: "#A8967A" }}>{b.sub}</div>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 600, color: "#E8B774" }}>
                  {fmtK(b.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's calls + Top calls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
        {/* Calls ring */}
        <div style={{ background: "white", border: "1px solid var(--stroke)", borderRadius: 14, padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brown-500)", fontWeight: 600, marginBottom: 12 }}>Today&apos;s Calls</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 48, fontWeight: 700, color: "var(--ink-900)", letterSpacing: "-0.02em" }}>
              {d.todayCalls}<span style={{ fontSize: 18, color: "var(--brown-400)" }}> / {d.todayGoal}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, borderRadius: 999, background: "var(--beige-200)", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (d.todayCalls / d.todayGoal) * 100)}%`, height: "100%", background: "var(--red-600)", borderRadius: 999, transition: "width .5s" }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--brown-500)", marginTop: 6 }}>{d.todayGoal - d.todayCalls} remaining</div>
            </div>
          </div>
        </div>

        {/* Top calls */}
        <div style={{ background: "white", border: "1px solid var(--stroke)", borderRadius: 14, padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brown-500)", fontWeight: 600 }}>Priority Calls</div>
            <button className="pill-btn" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => onGoTo("prospecting" as Page)}>Open Prospecting →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {d.topCalls.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 8, background: "var(--beige-50)", border: "1px solid var(--stroke)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--brown-600)", marginTop: 2 }}>{c.reason}</div>
                </div>
                <span className="tag lead">{c.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reminders */}
      {d.reminders?.length > 0 && (
        <div style={{ background: "white", border: "1px solid var(--stroke)", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brown-500)", fontWeight: 600, marginBottom: 12 }}>Reminders</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {d.reminders.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, background: "var(--beige-50)", border: "1px solid var(--stroke)" }}>
                <div style={{ flex: 1, fontSize: 13, color: "var(--ink-700)" }}>{r.text}</div>
                <button className="pill-btn" style={{ fontSize: 11.5, padding: "4px 10px", whiteSpace: "nowrap" }}>{r.cta}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week strip + Month stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "white", border: "1px solid var(--stroke)", borderRadius: 14, padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brown-500)", fontWeight: 600, marginBottom: 12 }}>This Week</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {d.week.map(w => (
              <div key={w.day} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: w.status === "today" ? "var(--navy-900)" : "var(--beige-50)", border: "1px solid var(--stroke)" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: w.status === "today" ? "#D8B17A" : "var(--brown-500)", minWidth: 28 }}>{w.day}</div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: w.status === "today" ? "#F5ECD7" : "var(--ink-700)" }}>{w.theme}</div>
                {w.status !== "upcoming" && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: w.status === "today" ? "#E8B774" : "var(--ok)" }}>{w.calls}/{w.goal}</div>
                )}
                {w.status === "upcoming" && <div style={{ fontSize: 11, color: "var(--brown-400)" }}>upcoming</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid var(--stroke)", borderRadius: 14, padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brown-500)", fontWeight: 600, marginBottom: 12 }}>Month / Year</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Stat label="Fundings" value={String(d.month.fundings)} />
            <Stat label="Pipeline Value" value={fmtK(d.month.pipelineValue)} />
            <Stat label="Projected Income" value={fmtK(d.month.projectedIncome)} />
            <Stat label="Monthly Goal" value={fmtK(d.month.goal)} />
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--brown-500)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>YTD Progress</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ok)" }}>{fmtK(d.year.ytd)} / {fmtK(d.year.goal)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "var(--beige-200)", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (d.year.ytd / d.year.goal) * 100)}%`, height: "100%", background: "var(--ok)", borderRadius: 999 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown-500)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 600, color: "var(--ink-900)" }}>{value}</div>
    </div>
  );
}
