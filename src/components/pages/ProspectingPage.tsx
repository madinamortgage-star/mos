"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons/Icons";
import type { ProspectCard } from "@/types";

interface Props {
  onToast: (text: string, xp?: string) => void;
}

function bucketOrder(b: string) { return b === "overdue" ? 0 : b === "hot" ? 1 : 2; }
function prioOrder(p: string)   { return p === "high" ? 0 : p === "med" ? 1 : 2; }

export function ProspectingPage({ onToast }: Props) {
  const [cards, setCards] = useState<ProspectCard[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [logPop, setLogPop] = useState<string | null>(null); // card id

  useEffect(() => {
    fetch("/api/prospect-cards")
      .then(r => r.json())
      .then((data: ProspectCard[]) => {
        const sorted = [...data].sort((a, b) => {
          const bd = bucketOrder(a.bucket) - bucketOrder(b.bucket);
          return bd !== 0 ? bd : prioOrder(a.priority) - prioOrder(b.priority);
        });
        setCards(sorted);
        setLoading(false);
      });
  }, []);

  async function logCall(card: ProspectCard, disposition: string) {
    await fetch("/api/call-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectCardId: card.id, disposition }),
    });
    setDone(d => new Set([...d, card.id]));
    setLogPop(null);
    onToast(`${card.name} — ${disposition}`, "+10 XP");
  }

  if (loading) return <div style={{ padding: "32px", color: "var(--brown-500)" }}>Loading call queue…</div>;

  const totalDone = done.size;
  const totalCards = cards.length;
  const pct = totalCards > 0 ? Math.round((totalDone / totalCards) * 100) : 0;

  const sections = [
    { key: "overdue", title: "Overdue",    cls: "must",    items: cards.filter(c => c.bucket === "overdue") },
    { key: "hot",     title: "Hot Leads",  cls: "high",    items: cards.filter(c => c.bucket === "hot") },
    { key: "today",   title: "Due Today",  cls: "suggest", items: cards.filter(c => c.bucket === "today") },
  ].filter(s => s.items.length > 0);

  return (
    <div className="prospecting">
      {/* Progress hero */}
      <div style={{ background: "linear-gradient(180deg, var(--navy-800), var(--navy-900))", borderRadius: 14, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 24, border: "1px solid rgba(216,177,122,0.08)", boxShadow: "var(--shadow-lg)" }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 42, fontWeight: 700, color: "#FBF1D9", letterSpacing: "-0.02em" }}>
            {totalDone}<span style={{ fontSize: 18, color: "#D8B17A" }}> / {totalCards}</span>
          </div>
          <div style={{ fontSize: 11, color: "#A8967A", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 2 }}>Calls logged</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(216,177,122,0.14)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#E8B774,#D8B17A)", borderRadius: 999, transition: "width .6s" }} />
          </div>
          <div style={{ fontSize: 12, color: "#BFAD88", marginTop: 6 }}>{pct}% complete · {totalCards - totalDone} remaining</div>
        </div>
      </div>

      {totalDone === totalCards && totalCards > 0 && (
        <div className="prospect-empty" style={{ marginBottom: 20 }}>
          <div className="medal">🏆</div>
          <h3>All done!</h3>
          <p>You&apos;ve logged every call in today&apos;s queue. Great work.</p>
        </div>
      )}

      {sections.map(sec => (
        <Section key={sec.key} sec={sec} done={done} logPop={logPop} setLogPop={setLogPop} logCall={logCall} />
      ))}
    </div>
  );
}

function Section({
  sec, done, logPop, setLogPop, logCall
}: {
  sec: { key: string; title: string; cls: string; items: ProspectCard[] };
  done: Set<string>;
  logPop: string | null;
  setLogPop: (id: string | null) => void;
  logCall: (card: ProspectCard, disposition: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={"prospect-section " + (open ? "open " : "") + (sec.cls === "must" ? "must" : "")}>
      <div className="s-head" onClick={() => setOpen(o => !o)}>
        <Icon name="chev" size={14} className="chev" />
        <span className="s-title">{sec.title}</span>
        <span className="s-count">{sec.items.length}</span>
      </div>
      {open && (
        <div className="call-list">
          {sec.items.map(card => (
            <CallCard key={card.id} card={card} isDone={done.has(card.id)} logPop={logPop} setLogPop={setLogPop} logCall={logCall} />
          ))}
        </div>
      )}
    </div>
  );
}

function CallCard({
  card, isDone, logPop, setLogPop, logCall
}: {
  card: ProspectCard;
  isDone: boolean;
  logPop: string | null;
  setLogPop: (id: string | null) => void;
  logCall: (card: ProspectCard, d: string) => void;
}) {
  const tagCls = card.tag === "agent" ? "agent" : card.tag === "partner" ? "partner" : card.tag === "pastclient" ? "pastclient" : "lead";
  return (
    <div className={"call-card" + (isDone ? " done" : "")}>
      <div className="c-left">
        <div className="c-top">
          <span className="c-name">{card.name}</span>
          {card.tagLabel && <span className={"tag " + tagCls}>{card.tagLabel}</span>}
          {card.bucket === "overdue" && <span className="tag" style={{ background: "#F5E0DB", color: "var(--red-600)", borderColor: "rgba(148,69,71,0.2)" }}>Overdue · {card.overdueBy}</span>}
          {card.bucket === "hot" && <span className="tag" style={{ background: "#F0E3C9", color: "var(--warn)" }}>Hot lead</span>}
        </div>
        {card.company && <div style={{ fontSize: 12.5, color: "var(--brown-600)" }}>{card.company} · <a className="pq-phone" href={`tel:${card.phone}`} style={{ color: "var(--brown-700)", fontFamily: "var(--mono)" }}>{card.phone}</a></div>}
        {card.context && <div className="c-context">{card.context}</div>}
        {card.action && (
          <div className="c-action">
            <b>Action:</b> {card.action}
          </div>
        )}
      </div>
      <div className="c-right">
        {isDone ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--ok)", color: "white", fontWeight: 600, fontSize: 12.5 }}>
            <Icon name="check" size={13} /> Logged
          </span>
        ) : (
          <>
            <a href={`tel:${card.phone}`} className="mark-done">
              <Icon name="phone" size={13} /> Call now
            </a>
            <div style={{ position: "relative" }}>
              <button className="mark-done" onClick={() => setLogPop(logPop === card.id ? null : card.id)}>
                Log
              </button>
              {logPop === card.id && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "white", border: "1px solid var(--stroke)", borderRadius: 10, boxShadow: "var(--shadow-md)", overflow: "hidden", zIndex: 20, minWidth: 180 }}>
                  {["Connected", "Left voicemail", "No pickup", "Wrong number"].map(d => (
                    <button key={d} onClick={() => logCall(card, d)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 13, fontFamily: "inherit", color: "var(--ink-700)", fontWeight: 500, borderBottom: "1px solid var(--stroke)" }}>
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        <div className="c-meta-right">
          <span style={{ fontFamily: "var(--mono)", fontSize: 11 }}>Last: {card.daysSince === 0 ? "Today" : `${card.daysSince}d ago`}</span>
        </div>
      </div>
    </div>
  );
}
