/**
 * Pure builders that turn domain rows (loans / contacts) into source-agnostic
 * `BoardItem`s for the shared Monday-style board. No server-only imports.
 */

import type { BoardItem } from "@/components/board/board-types";
import { LIFECYCLE_META, PRIORITY_META, STATUS_META } from "@/lib/contacts/format";
import { contactDisplayName } from "@/lib/contacts/format";
import type {
  ContactRow,
  ContactStatus,
  LoanRow,
  LoanStatus,
  PartnerRow,
  PartnerStatus,
} from "@/lib/db/types";
import {
  LOAN_PURPOSE_META,
  LOAN_STATUS_META,
  LOAN_TEMPERATURE_META,
  formatDate,
  formatMoney,
  formatRate,
  loanTitle,
} from "@/lib/loans/format";
import { PARTNER_STATUS_META, PARTNER_TYPE_META } from "@/lib/partners/format";
import type { PartnerReferralStats } from "@/lib/partners/stats";

// --- which buckets each page shows, in display order ------------------------

export const ACTIVE_LOAN_STATUSES: LoanStatus[] = ["lead", "application", "processing", "underwriting"];
export const PREAPPROVED_LOAN_STATUSES: LoanStatus[] = ["approved", "clear_to_close"];
/** Past-client board: bucket past clients by their `status` (refi-likely first). */
export const PAST_CONTACT_STATUSES: ContactStatus[] = ["hot", "warm", "cool", "cold", "new"];
/** Partners board: bucket partners by `status`. */
export const PARTNER_STATUS_GROUP_ORDER: PartnerStatus[] = ["active", "prospect", "inactive"];

const LOAN_STATUS_GROUP_COLOR: Record<LoanStatus, string> = {
  lead: "#6B7FB3",
  application: "#8A6E8C",
  processing: "#3E6E73",
  underwriting: "#B58B3E",
  approved: "#4E7A4E",
  clear_to_close: "#2F4A2F",
  funded: "#1A1410",
  closed: "#8A745A",
  denied: "#944547",
  withdrawn: "#6F5A44",
};

const CONTACT_STATUS_GROUP_COLOR: Record<ContactStatus, string> = {
  hot: "#944547",
  warm: "#B58B3E",
  cool: "#3E6E73",
  cold: "#6F5A44",
  new: "#6B7FB3",
};

const PARTNER_STATUS_GROUP_COLOR: Record<PartnerStatus, string> = {
  active: "#3E6E73",
  prospect: "#6B7FB3",
  inactive: "#8A6E8C",
};

export function loanStatusGroupColor(status: LoanStatus): string {
  return LOAN_STATUS_GROUP_COLOR[status] ?? "#263c6e";
}

export function contactStatusGroupColor(status: ContactStatus): string {
  return CONTACT_STATUS_GROUP_COLOR[status] ?? "#263c6e";
}

export function partnerStatusGroupColor(status: PartnerStatus): string {
  return PARTNER_STATUS_GROUP_COLOR[status] ?? "#263c6e";
}

// --- builders ----------------------------------------------------------------

export function loanToBoardItem(
  loan: LoanRow,
  borrowerName: string | undefined,
  groupKey: string,
): BoardItem {
  const badges: BoardItem["badges"] = [
    {
      label: LOAN_STATUS_META[loan.status]?.label ?? loan.status,
      className: LOAN_STATUS_META[loan.status]?.className ?? "bg-ink-300/20 text-ink-700 ring-1 ring-ink-300/40",
    },
  ];
  if (loan.loan_purpose) {
    badges.push({
      label: LOAN_PURPOSE_META[loan.loan_purpose]?.label ?? loan.loan_purpose,
      className: LOAN_PURPOSE_META[loan.loan_purpose]?.className ?? "bg-beige-200 text-brown-700",
    });
  }

  const temperatureLabel = loan.temperature ? LOAN_TEMPERATURE_META[loan.temperature]?.label : null;
  const followUp = loan.next_follow_up_at ? `Follow up ${formatDate(loan.next_follow_up_at)}` : null;
  const hint = [temperatureLabel, followUp].filter(Boolean).join(" · ") || undefined;

  const meta: BoardItem["meta"] = [
    { label: "Borrower", value: borrowerName ?? (loan.contact_id ? "Linked contact" : "—") },
    { label: "Lender", value: loan.lender ?? "—" },
    { label: "Loan type", value: loan.loan_type ?? "—" },
    { label: "Loan number", value: loan.loan_number ?? "—" },
    { label: "Amount", value: formatMoney(loan.amount) },
    { label: "Property value", value: formatMoney(loan.property_value) },
    { label: "Interest rate", value: formatRate(loan.interest_rate) },
    { label: "Expected revenue", value: formatMoney(loan.expected_revenue) },
    { label: "Commission", value: formatMoney(loan.commission) },
    { label: "Temperature", value: temperatureLabel ?? "—" },
    { label: "Status", value: LOAN_STATUS_META[loan.status]?.label ?? loan.status },
    { label: "Application date", value: formatDate(loan.application_date) },
    { label: "Est. close date", value: formatDate(loan.estimated_close_date) },
    { label: "Funded date", value: formatDate(loan.funded_date) },
    { label: "Rate lock expires", value: formatDate(loan.rate_lock_expires_at) },
    { label: "Next follow-up", value: formatDate(loan.next_follow_up_at) },
    { label: "Notes", value: loan.notes ?? "—" },
    { label: "Updated", value: formatDate(loan.updated_at) },
  ];

  return {
    id: loan.id,
    kind: "loan",
    title: loanTitle(loan, borrowerName),
    subtitle: loan.loan_number ?? undefined,
    amountLabel: loan.amount != null ? formatMoney(loan.amount) : undefined,
    amount: loan.amount,
    badges,
    hint,
    meta,
    detailHref: loan.contact_id ? `/contacts/${loan.contact_id}` : undefined,
    detailLabel: loan.contact_id ? "Open borrower" : undefined,
    groupKey,
  };
}

export function contactToBoardItem(contact: ContactRow, groupKey: string): BoardItem {
  const badges: BoardItem["badges"] = [];
  if (contact.lifecycle) {
    badges.push({
      label: LIFECYCLE_META[contact.lifecycle]?.label ?? contact.lifecycle,
      className: LIFECYCLE_META[contact.lifecycle]?.className ?? "bg-ink-300/20 text-ink-500 ring-1 ring-ink-300/40",
    });
  }
  if (contact.status) {
    badges.push({
      label: STATUS_META[contact.status]?.label ?? contact.status,
      className: `${STATUS_META[contact.status]?.text ?? "text-ink-500"} ring-1 ring-stroke`,
    });
  }
  if (contact.priority) {
    badges.push({
      label: PRIORITY_META[contact.priority]?.label ?? contact.priority,
      className: `${PRIORITY_META[contact.priority]?.text ?? "text-ink-500"} ring-1 ring-stroke`,
    });
  }

  const tags = contact.tags && contact.tags.length > 0 ? contact.tags.join(", ") : null;
  const followUp = contact.next_follow_up_at ? `Follow up ${formatDate(contact.next_follow_up_at)}` : null;
  const hint = [tags, followUp].filter(Boolean).join(" · ") || undefined;

  const location = [contact.city, contact.state].filter(Boolean).join(", ");

  const meta: BoardItem["meta"] = [
    { label: "Email", value: contact.email ?? "—" },
    { label: "Phone", value: contact.phone ?? contact.mobile_phone ?? "—" },
    { label: "Source", value: contact.source ?? "—" },
    { label: "Location", value: location || "—" },
    { label: "Tags", value: contact.tags && contact.tags.length > 0 ? contact.tags.join(", ") : "—" },
    { label: "Birthday", value: formatDate(contact.birthday) },
    { label: "Last contacted", value: formatDate(contact.last_contacted_at) },
    { label: "Next follow-up", value: formatDate(contact.next_follow_up_at) },
    { label: "Created", value: formatDate(contact.created_at) },
    { label: "Updated", value: formatDate(contact.updated_at) },
  ];

  return {
    id: contact.id,
    kind: "contact",
    title: contactDisplayName(contact),
    subtitle: contact.email ?? undefined,
    amount: undefined,
    badges,
    hint,
    meta,
    detailHref: `/contacts/${contact.id}`,
    detailLabel: "Open contact",
    groupKey,
  };
}

export function partnerToBoardItem(
  partner: PartnerRow,
  companyName: string | undefined,
  stats: PartnerReferralStats,
  groupKey: string,
): BoardItem {
  const typeMeta = PARTNER_TYPE_META[partner.partner_type];
  const statusMeta = PARTNER_STATUS_META[partner.status];

  const badges: BoardItem["badges"] = [
    { label: typeMeta?.label ?? partner.partner_type, className: typeMeta?.className ?? "bg-beige-200 text-brown-700" },
    {
      label: statusMeta?.label ?? partner.status,
      className: statusMeta?.className ?? "bg-ink-300/20 text-ink-500 ring-1 ring-ink-300/40",
    },
  ];
  if (partner.tier) badges.push({ label: partner.tier, className: "bg-amber-500/10 text-amber-700" });

  const lastReferralLabel = stats.lastReferralAt ? formatDate(stats.lastReferralAt) : "—";
  const hint = `${stats.referralCount} referral${stats.referralCount === 1 ? "" : "s"}${
    stats.lastReferralAt ? ` · last ${lastReferralLabel}` : ""
  }`;

  const meta: BoardItem["meta"] = [
    { label: "Type", value: typeMeta?.label ?? partner.partner_type },
    { label: "Status", value: statusMeta?.label ?? partner.status },
    { label: "Tier", value: partner.tier ?? "—" },
    { label: "Company", value: companyName ?? "—" },
    { label: "Email", value: partner.email ?? "—" },
    { label: "Phone", value: partner.phone ?? "—" },
    { label: "Total referrals", value: String(stats.referralCount) },
    { label: "Active loans referred", value: String(stats.activeLoansReferred) },
    { label: "Closed volume referred", value: formatMoney(stats.closedVolume) },
    { label: "Last referral", value: lastReferralLabel },
    { label: "Last touch", value: formatDate(partner.last_touch_at) },
    { label: "Notes", value: partner.notes ?? "—" },
    { label: "Created", value: formatDate(partner.created_at) },
    { label: "Updated", value: formatDate(partner.updated_at) },
  ];

  return {
    id: partner.id,
    kind: "partner",
    title: partner.name,
    subtitle: companyName ?? typeMeta?.label ?? undefined,
    amountLabel: stats.closedVolume > 0 ? formatMoney(stats.closedVolume) : undefined,
    amount: stats.closedVolume > 0 ? stats.closedVolume : undefined,
    badges,
    hint,
    meta,
    // No /partners/[id] page yet — leave the drawer's "open record" link off.
    // TODO(Phase 3+): a partner detail page with the activity timeline + referred contacts.
    detailHref: undefined,
    detailLabel: undefined,
    groupKey,
  };
}
