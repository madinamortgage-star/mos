/**
 * Hand-written domain types mirroring `supabase/migrations/20260101000200_domain_model.sql`.
 *
 * TODO: once the schema is applied, replace these with generated types:
 *   supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 * and pass `Database` as the generic to the Supabase clients. Until then these
 * keep the query helpers and (Phase 3) UI strongly typed.
 *
 * PostgREST returns dates/timestamps as ISO strings and numerics as numbers.
 */

export type Uuid = string;
/** ISO timestamp string, e.g. "2026-05-12T17:04:00.000Z". */
export type Timestamp = string;
/** ISO date string, e.g. "2026-05-12". */
export type DateString = string;
export type Json = Record<string, unknown>;

// --- enums (kept in sync with the SQL enums) --------------------------------

export type PriorityLevel = "high" | "medium" | "low";

export type ContactLifecycle =
  | "lead"
  | "prospect"
  | "active"
  | "client"
  | "past_client"
  | "partner"
  | "archived";

export type ContactStatus = "new" | "hot" | "warm" | "cool" | "cold";

export type PartnerType =
  | "agent"
  | "lender"
  | "title"
  | "escrow"
  | "financial_advisor"
  | "builder"
  | "attorney"
  | "other";

export type PartnerStatus = "prospect" | "active" | "inactive";

export type LoanStatus =
  | "lead"
  | "application"
  | "processing"
  | "underwriting"
  | "approved"
  | "clear_to_close"
  | "funded"
  | "closed"
  | "denied"
  | "withdrawn";

export type LoanTemperature = "hot" | "warm" | "cool" | "stalled" | "ok";

export type LoanPurpose =
  | "purchase"
  | "refinance"
  | "cash_out_refinance"
  | "heloc"
  | "construction"
  | "reverse"
  | "other";

export type ActivityType =
  | "call"
  | "email"
  | "sms"
  | "meeting"
  | "note"
  | "task"
  | "stage_change"
  | "field_change"
  | "document"
  | "system";

export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";

export type CustomFieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "boolean"
  | "select"
  | "multi_select"
  | "url"
  | "email"
  | "phone";

/** Resources that can have custom fields / saved views. */
export type DomainResource = "contacts" | "loans" | "partners" | "companies" | "tasks";

// --- row shapes --------------------------------------------------------------

export interface BaseRow {
  id: Uuid;
  org_id: Uuid;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CompanyRow extends BaseRow {
  name: string;
  domain: string | null;
  industry: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  created_by: Uuid | null;
}

export interface PartnerRow extends BaseRow {
  name: string;
  partner_type: PartnerType;
  company_id: Uuid | null;
  email: string | null;
  phone: string | null;
  tier: string | null;
  status: PartnerStatus;
  owner_id: Uuid | null;
  notes: string | null;
  last_touch_at: Timestamp | null;
  created_by: Uuid | null;
}

export interface ContactRow extends BaseRow {
  first_name: string | null;
  last_name: string | null;
  /** Generated column: trimmed "first last". */
  full_name: string | null;
  email: string | null;
  phone: string | null;
  mobile_phone: string | null;
  company_id: Uuid | null;
  partner_id: Uuid | null;
  owner_id: Uuid | null;
  lifecycle: ContactLifecycle;
  status: ContactStatus;
  priority: PriorityLevel;
  source: string | null;
  tags: string[];
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  birthday: DateString | null;
  last_contacted_at: Timestamp | null;
  next_follow_up_at: Timestamp | null;
  custom_fields: Json;
  created_by: Uuid | null;
}

export interface PipelineRow extends BaseRow {
  name: string;
  key: string | null;
  description: string | null;
  is_default: boolean;
  position: number;
}

export interface PipelineStageRow extends BaseRow {
  pipeline_id: Uuid;
  name: string;
  key: string | null;
  color: string | null;
  position: number;
  is_won: boolean;
  is_lost: boolean;
}

export interface PipelineWithStages {
  pipeline: PipelineRow;
  stages: PipelineStageRow[];
}

export interface LoanRow extends BaseRow {
  contact_id: Uuid | null;
  pipeline_id: Uuid | null;
  stage_id: Uuid | null;
  owner_id: Uuid | null;
  processor_id: Uuid | null;
  loan_number: string | null;
  status: LoanStatus;
  temperature: LoanTemperature | null;
  loan_purpose: LoanPurpose | null;
  loan_type: string | null;
  amount: number | null;
  property_value: number | null;
  interest_rate: number | null;
  down_payment: number | null;
  lender: string | null;
  expected_revenue: number | null;
  commission: number | null;
  application_date: DateString | null;
  estimated_close_date: DateString | null;
  funded_date: DateString | null;
  rate_lock_expires_at: DateString | null;
  notes: string | null;
  next_follow_up_at: Timestamp | null;
  created_by: Uuid | null;
}

export interface ActivityRow extends BaseRow {
  activity_type: ActivityType;
  subject: string | null;
  body: string | null;
  contact_id: Uuid | null;
  loan_id: Uuid | null;
  partner_id: Uuid | null;
  company_id: Uuid | null;
  actor_id: Uuid | null;
  occurred_at: Timestamp;
  metadata: Json;
}

export interface TaskRow extends BaseRow {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  due_at: Timestamp | null;
  completed_at: Timestamp | null;
  assignee_id: Uuid | null;
  contact_id: Uuid | null;
  loan_id: Uuid | null;
  partner_id: Uuid | null;
  created_by: Uuid | null;
}

export interface NoteRow extends BaseRow {
  body: string;
  contact_id: Uuid | null;
  loan_id: Uuid | null;
  partner_id: Uuid | null;
  company_id: Uuid | null;
  pinned: boolean;
  author_id: Uuid | null;
}

export interface DocumentRow extends BaseRow {
  name: string;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  doc_type: string | null;
  contact_id: Uuid | null;
  loan_id: Uuid | null;
  uploaded_by: Uuid | null;
}

export interface SavedViewRow extends BaseRow {
  name: string;
  resource: string;
  owner_id: Uuid | null;
  is_shared: boolean;
  config: Json;
  position: number;
}

export interface CustomFieldDefRow extends BaseRow {
  resource: string;
  key: string;
  label: string;
  field_type: CustomFieldType;
  options: unknown[];
  position: number;
  is_required: boolean;
}
