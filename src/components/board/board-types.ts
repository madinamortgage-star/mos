/**
 * Shared "Monday-style" board types. A BoardItem is a fully-serializable,
 * source-agnostic view of a contact or a loan, so the same board UI can render
 * Active Leads, Pre-Approved, and Past Clients.
 */

export type BoardBadge = { label: string; className: string };

export type BoardMetaRow = { label: string; value: string };

export type BoardItem = {
  id: string;
  /** Underlying record kind — drives the "open full record" link. */
  kind: "loan" | "contact";
  title: string;
  subtitle?: string;
  /** Pre-formatted amount shown on the card (e.g. "$656,000"); undefined hides it. */
  amountLabel?: string;
  /** Raw amount for group / board volume sums; undefined = not money-bearing. */
  amount?: number | null;
  badges: BoardBadge[];
  /** A short single-line hint shown under the badges on the card. */
  hint?: string;
  /** Full key/value detail rows shown in the quick-view drawer. */
  meta: BoardMetaRow[];
  /** Optional "open full record" link target + label. */
  detailHref?: string;
  detailLabel?: string;
  groupKey: string;
};

export type BoardGroup = {
  key: string;
  title: string;
  color?: string;
  items: BoardItem[];
  defaultCollapsed?: boolean;
};

export type BoardSummaryCard = { label: string; value: string };
