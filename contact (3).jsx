/* global window, React */
const { useState, useEffect, useRef } = React;

function fmtMoney2(n) { return "$" + n.toLocaleString(); }

function MiniTracker({ currentStage }) {
  const stages = window.STAGES;
  const idx = stages.findIndex(s => s.key === currentStage);
  return (
    <div className="mini-tracker">
      {stages.map((s, i) => {
        const cls = i < idx ? "done" : i === idx ? "current" : "";
        return (
          <div key={s.key} className={"mini-step " + cls}>
            <span className="mk">{i < idx ? "✓" : s.num}</span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ContactModal({ contact, onClose }) {
  const [tab, setTab] = useState("sms");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(contact.messages);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const sendRef = useRef(null);
  const send = () => {
    const t = draft.trim(); if (!t) return;
    setMessages(prev => [...prev, { kind: tab, who: "me", text: t, when: "Now" }]);
    setDraft("");
  };

  const visible = messages.filter(m => {
    if (tab === "sms") return m.kind === "sms";
    if (tab === "email") return m.kind === "email";
    if (tab === "notes") return m.kind === "note";
    return true;
  });

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target.classList.contains("modal-backdrop")) onClose(); }}>
      <div className="contact-modal" role="dialog" aria-modal="true">
        <div className="contact-top">
          <div className="row1">
            <button className="back" onClick={onClose}>
              <window.Icon name="arrow-left" size={14} /> Back to Pipeline
            </button>
            <div>
              <div className="c-name">{contact.name}</div>
              <div className="c-sub">
                <span className="tag lead">{contact.tag}</span>
                <span>·</span>
                <span className="mono">{contact.phone}</span>
                <span>·</span>
                <span>{contact.email}</span>
              </div>
            </div>
            <button className="close-x" onClick={onClose}>
              <window.Icon name="x" size={16} />
            </button>
          </div>
          <MiniTracker currentStage={contact.stage} />
        </div>

        <div className="contact-body">
          {/* LEFT */}
          <div className="c-pane c-left-pane">
            <div className="field"><span className="l">Phone</span><span className="v mono">{contact.phone}</span></div>
            <div className="field"><span className="l">Email</span><span className="v">{contact.email}</span></div>
            <div className="field"><span className="l">Date of Birth</span><span className="v">{contact.dob}</span></div>
            <div className="field"><span className="l">Lead Source</span><span className="v">{contact.source}</span></div>

            <div className="loan-block">
              <div className="t">Loan Summary</div>
              <div className="big">{fmtMoney2(contact.loan.amount)}</div>
              <div style={{ color: "var(--brown-500)", fontSize: 12, marginBottom: 8 }}>{contact.loan.product} @ {contact.loan.rate}</div>
              <div className="row"><span>Down payment</span><span>{contact.loan.down}</span></div>
              <div className="row"><span>LTV</span><span>{contact.loan.ltv}</span></div>
              <div className="row"><span>DTI</span><span>{contact.loan.dti}</span></div>
              <div className="row"><span>Est. close</span><span>{contact.loan.closing}</span></div>
            </div>
          </div>

          {/* CENTER */}
          <div className="c-pane">
            <div className="conv-tabs">
              {["sms", "email", "notes"].map(t => (
                <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                  {t === "sms" ? "SMS" : t === "email" ? "Email" : "Notes"}
                </button>
              ))}
            </div>
            <div className="msg-list">
              {visible.length === 0 && (
                <div style={{ color: "var(--brown-500)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>
                  No {tab} yet.
                </div>
              )}
              {visible.map((m, i) => (
                <div key={i} className={"msg " + (m.kind === "note" ? "note" : m.who)}>
                  <div>{m.text}</div>
                  <div className="meta">{m.when}</div>
                </div>
              ))}
            </div>
            <div className="composer">
              <textarea
                ref={sendRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
                placeholder={tab === "sms" ? "Type an SMS…" : tab === "email" ? "Email body…" : "Internal note (visible to team)…"}
                rows={2}
              />
              <button className="send" onClick={send}>
                {tab === "notes" ? "Save Note" : "Send"}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="c-pane c-right-pane">
            <h4>Activity</h4>
            <div className="timeline">
              {contact.timeline.map((t, i) => (
                <div key={i} className={"tl-item " + t.kind}>
                  <div className="t">{t.t}</div>
                  <div className="s">{t.s}</div>
                  <div className="w">{t.w}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ContactModal });
