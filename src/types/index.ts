// ─── Shared types mirroring Prisma models for client-side use ────────────────

export type Page =
  | "home" | "prospecting" | "active" | "preapproved"
  | "pipeline" | "past" | "partners" | "contacts";

export type LoanStage = "lead" | "app" | "pre" | "proc" | "uw" | "fund";
export type LoanStatus = "hot" | "warm" | "cool" | "stall" | "ok";

export interface Loan {
  id: string;
  externalId?: string | null;
  contactId: string;
  ownerId?: string | null;
  firstName: string;
  lastName: string;
  amount?: number | null;
  rate?: string | null;
  product?: string | null;
  downPayment?: string | null;
  ltv?: string | null;
  dti?: string | null;
  closingDate?: string | null;
  stage: LoanStage;
  status: LoanStatus;
  statusLabel?: string | null;
  processor?: string | null;
  lender?: string | null;
  revenue?: number | null;
  commission?: number | null;
  notes?: string | null;
  date?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  externalId?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  title?: string | null;
  city?: string | null;
  website?: string | null;
  linkedin?: string | null;
  source?: string | null;
  type?: string | null;
  status: string;
  lifecycle?: string | null;
  priority?: string | null;
  ownerId?: string | null;
  tags: string[];
  notes?: string | null;
  dob?: string | null;
  createdAt: string;
  updatedAt: string;
  pipelines?: ContactPipeline[];
  loans?: Loan[];
}

export interface ContactPipeline {
  id: string;
  contactId: string;
  pipeline: string;
  stage?: string | null;
  dealValue?: number | null;
  probability?: number | null;
  lastContact?: string | null;
  nextFollow?: string | null;
}

export interface ProspectCard {
  id: string;
  externalId?: string | null;
  name: string;
  company?: string | null;
  phone?: string | null;
  tag?: string | null;
  tagLabel?: string | null;
  context?: string | null;
  action?: string | null;
  priority: string;
  bucket: string;
  overdueBy?: string | null;
  daysSince: number;
  section: string;
}

export interface Partner {
  id: string;
  externalId?: string | null;
  name: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  birthday?: string | null;
  category?: string | null;
  group: string;
  status: string;
  deals12: number;
  totalTx: number;
  annualValue: number;
  lastContact?: string | null;
  nextContact?: string | null;
  notes?: string | null;
  callDone: boolean;
  daysSinceContact: number;
  dayBucket?: string | null;
  activityLogs?: ActivityLog[];
}

export interface Message {
  id: string;
  contactId?: string | null;
  loanId?: string | null;
  kind: "sms" | "email" | "note";
  direction: "inbound" | "outbound";
  body: string;
  sentAt: string;
}

export interface ActivityLog {
  id: string;
  contactId?: string | null;
  loanId?: string | null;
  partnerId?: string | null;
  kind: string;
  title: string;
  subtitle?: string | null;
  occurredAt: string;
}

export interface CallLog {
  id: string;
  prospectCardId?: string | null;
  contactId?: string | null;
  disposition: string;
  notes?: string | null;
  calledAt: string;
}

export interface DashboardData {
  available: number;
  captured: number;
  buckets: Array<{ key: string; label: string; value: number; sub: string; icon: string; tone: string }>;
  todayCalls: number;
  todayGoal: number;
  topCalls: Array<{ id: string; name: string; reason: string; value: number; tag: string }>;
  yesterdayMissed: number;
  habits: Array<{ key: string; label: string; done: boolean; value?: number; of?: number }>;
  week: Array<{ day: string; date: string; theme: string; calls: number; goal: number; status: string }>;
  reminders: Array<{ kind: string; text: string; cta: string }>;
  month: { fundings: number; pipelineValue: number; projectedIncome: number; goal: number; trend: number[] };
  year: { goal: number; ytd: number; pace: number; funnel: Array<{ label: string; value: number }> };
}
