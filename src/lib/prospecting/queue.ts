/**
 * Builds the daily prospecting call queue from contacts + loans. Pure — no
 * server-only imports, no `Date.now()` baked in (callers pass `now`), so it's
 * deterministic and testable. The page runs it server-side and ships the result
 * (plain serializable items) to the client queue component.
 *
 * Reasons (in display order):
 *   1. overdue follow-up        — a scheduled follow-up (contact or loan) is past due
 *   2. pre-approval expiring    — a loan's rate lock expires within ~10 days
 *   3. hot lead                 — an active (non-past-client) contact/loan marked hot
 *   4. past-client refi         — a past client (hot/warm) likely to refinance
 *   5. no recent touch          — an active relationship with no contact in 30+ days
 */

import { contactDisplayName } from "@/lib/contacts/format";
import type { ContactLifecycle, ContactRow, LoanRow, PriorityLevel } from "@/lib/db/types";
import { formatDate } from "@/lib/loans/format";

export type ProspectReason =
  | "overdue_followup"
  | "preapproval_expiring"
  | "hot_lead"
  | "refi_opportunity"
  | "no_recent_touch";

export const PROSPECT_REASON_ORDER: ProspectReason[] = [
  "overdue_followup",
  "preapproval_expiring",
  "hot_lead",
  "refi_opportunity",
  "no_recent_touch",
];

export const PROSPECT_REASON_META: Record<
  ProspectReason,
  { label: string; description: string; color: string; badgeClass: string }
> = {
  overdue_followup: {
    label: "Overdue follow-up",
    description: "Scheduled follow-ups that are past due",
    color: "#944547",
    badgeClass: "bg-red-600/10 text-red-600 ring-1 ring-red-600/30",
  },
  preapproval_expiring: {
    label: "Pre-approval expiring",
    description: "Rate locks expiring within ~10 days",
    color: "#B07A3A",
    badgeClass: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30",
  },
  hot_lead: {
    label: "Hot lead",
    description: "Active leads marked hot — keep momentum",
    color: "#A85658",
    badgeClass: "bg-red-500/10 text-red-600 ring-1 ring-red-500/30",
  },
  refi_opportunity: {
    label: "Past-client refi",
    description: "Past clients likely to refinance",
    color: "#3E6E73",
    badgeClass: "bg-green-700/10 text-green-800 ring-1 ring-green-700/30",
  },
  no_recent_touch: {
    label: "No recent touch",
    description: "Active relationships gone quiet (30+ days)",
    color: "#6F5A44",
    badgeClass: "bg-brown-500/10 text-brown-700 ring-1 ring-brown-500/30",
  },
};

const PRIORITY_BADGE: Record<PriorityLevel, string> = {
  high: "bg-red-500/10 text-red-600 ring-1 ring-red-500/30",
  medium: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30",
  low: "bg-ink-300/20 text-ink-500 ring-1 ring-ink-300/40",
};
export function prospectPriorityBadgeClass(p: PriorityLevel): string {
  return PRIORITY_BADGE[p];
}
export function prospectPriorityLabel(p: PriorityLevel): string {
  return p === "high" ? "High" : p === "medium" ? "Medium" : "Low";
}

export type ProspectItem = {
  /** Unique id for the queue (= contact id). */
  id: string;
  contactId: string;
  name: string;
  phone?: string;
  email?: string;
  reason: ProspectReason;
  reasonDetail: string;
  priority: PriorityLevel;
  lastTouchLabel: string;
  nextFollowUpLabel: string;
  meta: { label: string; value: string }[];
  /** Sort weight within the reason group (higher = more urgent). */
  urgency: number;
};

export type ProspectGroup = { reason: ProspectReason; items: ProspectItem[] };

const DAY_MS = 24 * 60 * 60 * 1000;
const NO_TOUCH_DAYS = 30;
const PREAPPROVAL_WINDOW_DAYS = 10;
const PREAPPROVAL_GRACE_DAYS = 3; // also surface locks that just expired

const ACTIVE_LIFECYCLES: ContactLifecycle[] = ["lead", "prospect", "active", "client"];
const PRIORITY_RANK: Record<PriorityLevel, number> = { high: 0, medium: 1, low: 2 };

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(fromMs: number, toMs: number): number {
  return Math.round((toMs - fromMs) / DAY_MS);
}

function relativeTouch(lastIso: string | null | undefined, now: number): string {
  const d = parseDate(lastIso);
  if (!d) return "Never";
  const days = daysBetween(d.getTime(), now);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months <= 1 ? "1 month ago" : `${months} months ago`;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function buildProspectQueue(contacts: ContactRow[], loans: LoanRow[], now: number): ProspectGroup[] {
  // Loan-derived signals keyed by contact id.
  type Signals = { overdueFollowUp?: Date; hotLoan?: boolean; rateLockExpiring?: Date };
  const signals = new Map<string, Signals>();
  for (const loan of loans) {
    if (!loan.contact_id) continue; // can't call a borrower-less loan
    const s = signals.get(loan.contact_id) ?? {};
    const fu = parseDate(loan.next_follow_up_at);
    if (fu && fu.getTime() <= now) {
      if (!s.overdueFollowUp || fu.getTime() < s.overdueFollowUp.getTime()) s.overdueFollowUp = fu;
    }
    if (loan.temperature === "hot") s.hotLoan = true;
    const lock = parseDate(loan.rate_lock_expires_at);
    if (lock) {
      const daysToExpiry = daysBetween(now, lock.getTime());
      if (daysToExpiry <= PREAPPROVAL_WINDOW_DAYS && daysToExpiry >= -PREAPPROVAL_GRACE_DAYS) {
        if (!s.rateLockExpiring || lock.getTime() < s.rateLockExpiring.getTime()) s.rateLockExpiring = lock;
      }
    }
    signals.set(loan.contact_id, s);
  }

  const items: ProspectItem[] = [];

  for (const c of contacts) {
    if (c.lifecycle === "archived") continue;
    const s = signals.get(c.id) ?? {};
    const phone = c.phone ?? c.mobile_phone ?? undefined;
    const email = c.email ?? undefined;
    const name = contactDisplayName(c);
    const lastTouchLabel = relativeTouch(c.last_contacted_at, now);
    const contactFU = parseDate(c.next_follow_up_at);

    const baseMeta: { label: string; value: string }[] = [
      { label: "Phone", value: phone ?? "—" },
      { label: "Email", value: email ?? "—" },
      { label: "Lifecycle", value: c.lifecycle },
      { label: "Status", value: c.status },
      { label: "Priority", value: prospectPriorityLabel(c.priority) },
      { label: "Source", value: c.source ?? "—" },
      { label: "Tags", value: c.tags && c.tags.length > 0 ? c.tags.join(", ") : "—" },
      { label: "Last contacted", value: c.last_contacted_at ? formatDate(c.last_contacted_at) : "Never" },
      { label: "Next follow-up", value: formatDate(c.next_follow_up_at) },
    ];

    let reason: ProspectReason | null = null;
    let reasonDetail = "";
    let priority: PriorityLevel = c.priority;
    let urgency = 0;
    let nextFollowUpLabel = c.next_follow_up_at ? formatDate(c.next_follow_up_at) : "—";

    // 1. overdue follow-up (contact-level or loan-level)
    const overdueFU =
      contactFU && contactFU.getTime() <= now ? contactFU : (s.overdueFollowUp ?? null);
    if (overdueFU) {
      const overdueDays = daysBetween(overdueFU.getTime(), now);
      const dateStr = formatDate(overdueFU.toISOString());
      reason = "overdue_followup";
      reasonDetail =
        overdueDays <= 0
          ? `Follow-up due today (${dateStr})`
          : `Follow-up was due ${dateStr} — ${plural(overdueDays, "day")} overdue`;
      priority = c.priority === "high" ? "high" : "medium";
      urgency = 1000 + overdueDays;
      nextFollowUpLabel = `Overdue · ${dateStr}`;
    }

    // 2. rate lock / pre-approval expiring
    if (!reason && s.rateLockExpiring) {
      const dleft = daysBetween(now, s.rateLockExpiring.getTime());
      const dateStr = formatDate(s.rateLockExpiring.toISOString());
      reason = "preapproval_expiring";
      reasonDetail =
        dleft < 0
          ? `Rate lock expired ${dateStr} (${plural(-dleft, "day")} ago)`
          : dleft === 0
            ? `Rate lock expires today (${dateStr})`
            : `Rate lock expires ${dateStr} — ${plural(dleft, "day")} left`;
      priority = "high";
      urgency = 900 - Math.max(0, dleft);
      nextFollowUpLabel = `Lock · ${dateStr}`;
    }

    // 3. hot lead (active, not a past client)
    if (!reason && c.lifecycle !== "past_client" && (c.status === "hot" || s.hotLoan)) {
      reason = "hot_lead";
      reasonDetail = `Hot ${c.lifecycle} — keep momentum.${
        c.next_follow_up_at ? ` Follow up ${formatDate(c.next_follow_up_at)}.` : ""
      }`;
      priority = "high";
      urgency = 700;
    }

    // 4. past-client refi opportunity
    if (!reason && c.lifecycle === "past_client" && (c.status === "hot" || c.status === "warm")) {
      reason = "refi_opportunity";
      reasonDetail = `Past client (${c.status}) — refi candidate.${
        c.tags && c.tags.length > 0 ? ` Tags: ${c.tags.join(", ")}.` : ""
      }`;
      priority = c.status === "hot" ? "high" : "medium";
      urgency = c.status === "hot" ? 600 : 500;
    }

    // 5. no recent touch (active relationship gone quiet)
    if (!reason && ACTIVE_LIFECYCLES.includes(c.lifecycle)) {
      const last = parseDate(c.last_contacted_at);
      const quietDays = last ? daysBetween(last.getTime(), now) : null;
      if (!last || (quietDays != null && quietDays >= NO_TOUCH_DAYS)) {
        reason = "no_recent_touch";
        reasonDetail = last
          ? `No contact in ${quietDays} days — re-engage before it goes cold.`
          : `Never contacted${c.source ? ` — came in via ${c.source}` : ""}.`;
        priority = c.lifecycle === "lead" || c.lifecycle === "prospect" ? "medium" : "low";
        urgency = quietDays != null ? 100 + Math.min(quietDays, 365) : 500;
      }
    }

    if (!reason) continue;

    items.push({
      id: c.id,
      contactId: c.id,
      name,
      phone,
      email,
      reason,
      reasonDetail,
      priority,
      lastTouchLabel,
      nextFollowUpLabel,
      meta: [{ label: "Why call", value: reasonDetail }, ...baseMeta],
      urgency,
    });
  }

  const byReason = new Map<ProspectReason, ProspectItem[]>();
  for (const r of PROSPECT_REASON_ORDER) byReason.set(r, []);
  for (const it of items) {
    const arr = byReason.get(it.reason);
    if (arr) arr.push(it);
  }
  for (const arr of byReason.values()) {
    arr.sort((a, b) => {
      const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return pr !== 0 ? pr : b.urgency - a.urgency;
    });
  }

  return PROSPECT_REASON_ORDER.map((reason) => ({ reason, items: byReason.get(reason) ?? [] }));
}
