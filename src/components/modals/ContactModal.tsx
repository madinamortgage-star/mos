"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/icons/Icons";
import type { Loan, Message, ActivityLog } from "@/types";

const STAGES = [
  { key: "lead", label: "Lead",         num: "01" },
  { key: "app",  label: "App",          num: "02" },
  { key: "pre",  label: "Pre-Approval", num: "03" },
  { key: "proc", label: "Processing",   num: "04" },
  { key: "uw",   label: "Underwriting", num: "05" },
  { key: "fund", label: "Funded",       num: "06" },
];

interface ContactData {
  id: string;
  name: string;
  tag?: string;
  phone?: string;
  email?: string;
  dob?: string;
  source?: string;
  stage?: string;
  loan?: Partial<Loan>;
  messages: Message[];
  timeline: ActivityLog[];
}

interface Props {
  contact: ContactData;
  onClose: () => void;
}

function fmt$(n: number) { return "$" + n.toLocaleString(); }

function MiniTracker({ currentStage }: { currentStage?: string }) {
  const idx = STAGES.findIndex(s => s.key === currentStage);
  return (
    <div className="mini-tracker">
      {STAGES.map((s, i) => {
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

export function ContactModal({ contact, onClose }: Props) {
  const [tab, setTab] = useState<"sms" | "email" | "notes">("sms");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>(contact.messages ?? []);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  async function send() {
    const text = draft.trim();
    if (!text) return;
    setSaving(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: contact.id, kind: tab === "notes" ? "note" : tab, body: text }),
      });
      if (res.ok) {
        const msg = await res.json() as Message;
        setMessages(prev => [...prev, msg]);
        setDraft("");
      }
    } finally {
      setSaving(false);
    }
  }

  const visible = messages.filter(m => {
    if (tab === "sms")   return m.kind === "sms";
    if (tab === "email") return m.kind === "email";
    if (tab === "notes") return m.kind === "note";
    return false;
  });

  const loan = contact.loan;

  return (
    <div className="modal-backdrop" onClick={e => { if ((e.target as HTMLElement).classList.contains("modal-backdrop")) onClose(); }}>
      <div className="contact-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="contact-top">
          <div className="row1">
            <button className="back" onClick={onClose}>
              <Icon name="arrow-left" size={14} /> Back
            </button>
            <div>
              <div className="c-name">{contact.name}</div>
              <div className="c-sub">
                {contact.tag && <span className="tag lead">{contact.tag}</span>}
                {contact.phone && <><span>·</span><span className="mono">{contact.phone}</span></>}
                {contact.email && <><span>·</span><span>{contact.email}</span></>}
              </div>
            </div>
            <button className="close-x" onClick={onClose}><Icon name="x" size={16} /></button>
          </div>
          <MiniTracker currentStage={contact.stage} />
        </div>

        <div className="contact-body">
          {/* LEFT — contact fields */}
          <div className="c-pane c-left-pane">
            {contact.phone && <Field label="Phone" value={contact.phone} mono />}
            {contact.email && <Field label="Email" value={contact.email} />}
            {contact.dob   && <Field label="Date of Birth" value={contact.dob} />}
            {contact.source && <Field label="Lead Source" value={contact.source} />}

            {loan?.amount && (
              <div className="loan-block" style={{ marginTop: 14 }}>
                <div className="t">Loan Summary</div>
                <div className="big">{fmt$(loan.amount)}</div>
                {loan.product && loan.rate && <div style={{ color: "var(--brown-500)", fontSize: 12, marginBottom: 8 }}>{loan.product} @ {loan.rate}</div>}
                {loan.ltv        && <LoanRow label="LTV" value={loan.ltv} />}
                {loan.dti        && <LoanRow label="DTI" value={loan.dti} />}
                {loan.closingDate && <LoanRow label="Est. close" value={loan.closingDate} />}
              </div>
            )}
          </div>

          {/* CENTER — conversation */}
          <div className="c-pane">
            <div className="conv-tabs">
              {(["sms", "email", "notes"] as const).map(t => (
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
                <div key={m.id ?? i} className={"msg " + (m.kind === "note" ? "note" : m.direction === "inbound" ? "them" : "me")}>
                  <div>{m.body}</div>
                  <div className="meta">{new Date(m.sentAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="composer">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
                placeholder={tab === "sms" ? "Type an SMS… (⌘+Enter to send)" : tab === "email" ? "Email body…" : "Internal note…"}
                rows={2}
              />
              <button className="send" onClick={send} disabled={saving}>
                {tab === "notes" ? "Save Note" : "Send"}
              </button>
            </div>
          </div>

          {/* RIGHT — activity timeline */}
          <div className="c-pane c-right-pane">
            <h4>Activity</h4>
            <div className="timeline">
              {(contact.timeline ?? []).map((t, i) => (
                <div key={t.id ?? i} className={"tl-item " + (t.kind === "call" ? "red" : t.kind === "note" ? "navy" : "green")}>
                  <div className="t">{t.title}</div>
                  {t.subtitle && <div className="s">{t.subtitle}</div>}
                  <div className="w">{new Date(t.occurredAt).toLocaleDateString()}</div>
                </div>
              ))}
              {(contact.timeline ?? []).length === 0 && (
                <div style={{ color: "var(--brown-500)", fontSize: 12 }}>No activity yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="field">
      <span className="l">{label}</span>
      <span className={"v" + (mono ? " mono" : "")}>{value}</span>
    </div>
  );
}

function LoanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
