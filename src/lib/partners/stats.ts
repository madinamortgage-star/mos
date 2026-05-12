/**
 * Derived partner referral stats. Pure — no DB, no server-only imports.
 *
 * There is no first-class referral link in the schema yet, so we derive these
 * from `contacts.partner_id` (the referring partner) and the loans on those
 * contacts.
 *
 * TODO(referral tracking): add `loans.referring_partner_id` (or a dedicated
 * `referrals` table) so these are exact + indexable, and move the computation
 * into `lib/db/partners.ts` as a SQL aggregate.
 */

import type { ContactRow, LoanRow, LoanStatus, PartnerRow } from "@/lib/db/types";

export type PartnerReferralStats = {
  /** Number of contacts whose `partner_id` is this partner. */
  referralCount: number;
  /** Loans on those contacts whose status is still in-flight. */
  activeLoansReferred: number;
  /** Sum of `amount` for those loans that funded / closed. */
  closedVolume: number;
  /** Latest `created_at` among the referred contacts (proxy for last referral). */
  lastReferralAt: string | null;
};

export const EMPTY_PARTNER_STATS: PartnerReferralStats = {
  referralCount: 0,
  activeLoansReferred: 0,
  closedVolume: 0,
  lastReferralAt: null,
};

const ACTIVE_LOAN_STATUSES = new Set<LoanStatus>([
  "lead",
  "application",
  "processing",
  "underwriting",
  "approved",
  "clear_to_close",
]);
const CLOSED_LOAN_STATUSES = new Set<LoanStatus>(["funded", "closed"]);

export function computePartnerStats(
  partners: PartnerRow[],
  contacts: ContactRow[],
  loans: LoanRow[],
): Map<string, PartnerReferralStats> {
  const contactToPartner = new Map<string, string>();
  const referralCount = new Map<string, number>();
  const lastReferral = new Map<string, string>();

  for (const c of contacts) {
    if (!c.partner_id) continue;
    contactToPartner.set(c.id, c.partner_id);
    referralCount.set(c.partner_id, (referralCount.get(c.partner_id) ?? 0) + 1);
    const prev = lastReferral.get(c.partner_id);
    if (!prev || c.created_at > prev) lastReferral.set(c.partner_id, c.created_at);
  }

  const activeLoans = new Map<string, number>();
  const closedVolume = new Map<string, number>();
  for (const loan of loans) {
    if (!loan.contact_id) continue;
    const partnerId = contactToPartner.get(loan.contact_id);
    if (!partnerId) continue;
    if (ACTIVE_LOAN_STATUSES.has(loan.status)) {
      activeLoans.set(partnerId, (activeLoans.get(partnerId) ?? 0) + 1);
    }
    if (CLOSED_LOAN_STATUSES.has(loan.status)) {
      closedVolume.set(partnerId, (closedVolume.get(partnerId) ?? 0) + (loan.amount ?? 0));
    }
  }

  const out = new Map<string, PartnerReferralStats>();
  for (const p of partners) {
    out.set(p.id, {
      referralCount: referralCount.get(p.id) ?? 0,
      activeLoansReferred: activeLoans.get(p.id) ?? 0,
      closedVolume: closedVolume.get(p.id) ?? 0,
      lastReferralAt: lastReferral.get(p.id) ?? null,
    });
  }
  return out;
}
