-- =============================================================================
-- MOS — Phase 2 migration: core mortgage-CRM domain model
-- =============================================================================
-- You do NOT need to run this yet. The app stays in placeholder mode until real
-- Supabase keys are added. Apply with `supabase db push` or the SQL editor —
-- see supabase/README.md. RLS for these tables is in the next migration
-- (20260101000300_domain_rls.sql).
--
-- Conventions:
--   • every domain table has `org_id uuid not null references organizations(id)`
--   • timestamps `created_at` / `updated_at`, the latter kept fresh by a trigger
--   • people columns reference auth.users(id) and are nullable (ON DELETE SET NULL)
--   • sub-records (activities / notes / tasks / documents) cascade from their
--     parent contact/loan
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin create type public.priority_level    as enum ('high','medium','low'); exception when duplicate_object then null; end $$;
do $$ begin create type public.contact_lifecycle as enum ('lead','prospect','active','client','past_client','partner','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.contact_status    as enum ('new','hot','warm','cool','cold'); exception when duplicate_object then null; end $$;
do $$ begin create type public.partner_type      as enum ('agent','lender','title','escrow','financial_advisor','builder','attorney','other'); exception when duplicate_object then null; end $$;
do $$ begin create type public.partner_status    as enum ('prospect','active','inactive'); exception when duplicate_object then null; end $$;
do $$ begin create type public.loan_status       as enum ('lead','application','processing','underwriting','approved','clear_to_close','funded','closed','denied','withdrawn'); exception when duplicate_object then null; end $$;
do $$ begin create type public.loan_temperature  as enum ('hot','warm','cool','stalled','ok'); exception when duplicate_object then null; end $$;
do $$ begin create type public.loan_purpose      as enum ('purchase','refinance','cash_out_refinance','heloc','construction','reverse','other'); exception when duplicate_object then null; end $$;
do $$ begin create type public.activity_type     as enum ('call','email','sms','meeting','note','task','stage_change','field_change','document','system'); exception when duplicate_object then null; end $$;
do $$ begin create type public.task_status       as enum ('open','in_progress','done','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.custom_field_type as enum ('text','number','currency','date','datetime','boolean','select','multi_select','url','email','phone'); exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- companies — firms / brokerages / employers referenced by contacts & partners
-- -----------------------------------------------------------------------------
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  name        text not null,
  domain      text,
  industry    text,
  phone       text,
  website     text,
  address     text,
  notes       text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- partners — referral partners (agents, lenders, title/escrow, etc.)
-- -----------------------------------------------------------------------------
create table if not exists public.partners (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  name          text not null,
  partner_type  public.partner_type not null default 'other',
  company_id    uuid references public.companies(id) on delete set null,
  email         text,
  phone         text,
  tier          text,                                   -- e.g. 'platinum' | 'gold' | 'silver'
  status        public.partner_status not null default 'active',
  owner_id      uuid references auth.users(id) on delete set null,
  notes         text,
  last_touch_at timestamptz,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- contacts — people (leads, clients, past clients, partner contacts)
-- -----------------------------------------------------------------------------
create table if not exists public.contacts (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations(id) on delete cascade,
  first_name        text,
  last_name         text,
  full_name         text generated always as (
                      trim(both ' ' from coalesce(first_name,'') || ' ' || coalesce(last_name,''))
                    ) stored,
  email             text,
  phone             text,
  mobile_phone      text,
  company_id        uuid references public.companies(id) on delete set null,
  partner_id        uuid references public.partners(id) on delete set null,   -- referring partner
  owner_id          uuid references auth.users(id) on delete set null,
  lifecycle         public.contact_lifecycle not null default 'lead',
  status            public.contact_status not null default 'new',
  priority          public.priority_level not null default 'medium',
  source            text,
  tags              text[] not null default '{}',
  address           text,
  city              text,
  state             text,
  postal_code       text,
  birthday          date,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  custom_fields     jsonb not null default '{}'::jsonb,
  created_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Full-text search vector. Built with the 'simple' config so it's IMMUTABLE
  -- (required for a generated column). Query it with websearch_to_tsquery('simple', ...).
  search_tsv        tsvector generated always as (
                      to_tsvector('simple',
                        coalesce(first_name,'') || ' ' ||
                        coalesce(last_name,'')  || ' ' ||
                        coalesce(email,'')      || ' ' ||
                        coalesce(phone,'')      || ' ' ||
                        coalesce(mobile_phone,'') || ' ' ||
                        coalesce(array_to_string(tags, ' '), '')
                      )
                    ) stored
);

-- -----------------------------------------------------------------------------
-- pipelines + pipeline_stages — configurable Monday-style boards
-- -----------------------------------------------------------------------------
create table if not exists public.pipelines (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  name        text not null,
  key         text,                                       -- machine key, unique per org
  description text,
  is_default  boolean not null default false,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, key)
);

create table if not exists public.pipeline_stages (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,  -- denormalized for RLS; TODO: enforce == pipelines.org_id
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  name        text not null,
  key         text,
  color       text,
  position    int not null default 0,
  is_won      boolean not null default false,
  is_lost     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (pipeline_id, key)
);

-- -----------------------------------------------------------------------------
-- loans — the deal record (borrower = contact)
-- -----------------------------------------------------------------------------
create table if not exists public.loans (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references public.organizations(id) on delete cascade,
  contact_id          uuid references public.contacts(id) on delete set null,         -- borrower
  pipeline_id         uuid references public.pipelines(id) on delete set null,
  stage_id            uuid references public.pipeline_stages(id) on delete set null,
  owner_id            uuid references auth.users(id) on delete set null,               -- loan officer
  processor_id        uuid references auth.users(id) on delete set null,
  loan_number         text,
  status              public.loan_status not null default 'lead',
  temperature         public.loan_temperature,
  loan_purpose        public.loan_purpose,
  loan_type           text,                                                            -- e.g. '30-yr Conv', 'FHA 30'
  amount              numeric(14,2),
  property_value      numeric(14,2),
  interest_rate       numeric(6,3),
  down_payment        numeric(14,2),
  lender              text,
  expected_revenue    numeric(14,2),
  commission          numeric(14,2),
  application_date    date,
  estimated_close_date date,
  funded_date         date,
  rate_lock_expires_at date,
  notes               text,
  next_follow_up_at   timestamptz,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- activities — timeline events (calls, emails, notes, stage changes, …)
-- -----------------------------------------------------------------------------
create table if not exists public.activities (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  activity_type public.activity_type not null,
  subject       text,
  body          text,
  contact_id    uuid references public.contacts(id) on delete cascade,
  loan_id       uuid references public.loans(id) on delete cascade,
  partner_id    uuid references public.partners(id) on delete cascade,
  company_id    uuid references public.companies(id) on delete cascade,
  actor_id      uuid references auth.users(id) on delete set null,
  occurred_at   timestamptz not null default now(),
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- tasks — to-dos, optionally attached to a contact / loan / partner
-- -----------------------------------------------------------------------------
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  title         text not null,
  description   text,
  status        public.task_status not null default 'open',
  priority      public.priority_level not null default 'medium',
  due_at        timestamptz,
  completed_at  timestamptz,
  assignee_id   uuid references auth.users(id) on delete set null,
  contact_id    uuid references public.contacts(id) on delete cascade,
  loan_id       uuid references public.loans(id) on delete cascade,
  partner_id    uuid references public.partners(id) on delete cascade,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- notes — free-text notes attached to a record
-- -----------------------------------------------------------------------------
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  body        text not null,
  contact_id  uuid references public.contacts(id) on delete cascade,
  loan_id     uuid references public.loans(id) on delete cascade,
  partner_id  uuid references public.partners(id) on delete cascade,
  company_id  uuid references public.companies(id) on delete cascade,
  pinned      boolean not null default false,
  author_id   uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- documents — file metadata; bytes live in Supabase Storage.
-- TODO(prod): create a private Storage bucket (e.g. `loan-docs`) and add RLS on
-- storage.objects so only org members can read/write paths under their org.
-- -----------------------------------------------------------------------------
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  name          text not null,
  storage_path  text,                                       -- path within the Storage bucket
  mime_type     text,
  size_bytes    bigint,
  doc_type      text,                                       -- e.g. 'paystub', 'w2', 'bank_statement'
  contact_id    uuid references public.contacts(id) on delete cascade,
  loan_id       uuid references public.loans(id) on delete cascade,
  uploaded_by   uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- saved_views — per-user or shared list configs (filters/sort/columns/group/type)
-- -----------------------------------------------------------------------------
create table if not exists public.saved_views (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  name        text not null,
  resource    text not null,                                -- 'contacts' | 'loans' | 'partners' | …
  owner_id    uuid references auth.users(id) on delete cascade,  -- null = org-shared view
  is_shared   boolean not null default false,
  config      jsonb not null default '{}'::jsonb,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- custom_fields_def — definitions of org-defined custom fields per resource
-- -----------------------------------------------------------------------------
create table if not exists public.custom_fields_def (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  resource    text not null,                                -- 'contacts' | 'loans' | 'partners'
  key         text not null,
  label       text not null,
  field_type  public.custom_field_type not null default 'text',
  options     jsonb not null default '[]'::jsonb,           -- for select / multi_select
  position    int not null default 0,
  is_required boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, resource, key)
);

-- -----------------------------------------------------------------------------
-- Indexes — org_id everywhere, plus owner/assignee/actor and stage/status, and
-- GIN indexes for contacts' full-text + tags.
-- -----------------------------------------------------------------------------
create index if not exists companies_org_idx           on public.companies(org_id);

create index if not exists partners_org_idx            on public.partners(org_id);
create index if not exists partners_owner_idx          on public.partners(owner_id);
create index if not exists partners_status_idx         on public.partners(org_id, status);
create index if not exists partners_type_idx           on public.partners(org_id, partner_type);
create index if not exists partners_company_idx        on public.partners(company_id);

create index if not exists contacts_org_idx            on public.contacts(org_id);
create index if not exists contacts_owner_idx          on public.contacts(owner_id);
create index if not exists contacts_lifecycle_idx      on public.contacts(org_id, lifecycle);
create index if not exists contacts_status_idx         on public.contacts(org_id, status);
create index if not exists contacts_company_idx        on public.contacts(company_id);
create index if not exists contacts_partner_idx        on public.contacts(partner_id);
create index if not exists contacts_next_followup_idx  on public.contacts(org_id, next_follow_up_at);
create index if not exists contacts_search_idx         on public.contacts using gin(search_tsv);
create index if not exists contacts_tags_idx           on public.contacts using gin(tags);

create index if not exists pipelines_org_idx           on public.pipelines(org_id);
create index if not exists pipeline_stages_org_idx     on public.pipeline_stages(org_id);
create index if not exists pipeline_stages_pipeline_idx on public.pipeline_stages(pipeline_id, position);

create index if not exists loans_org_idx               on public.loans(org_id);
create index if not exists loans_owner_idx             on public.loans(owner_id);
create index if not exists loans_processor_idx         on public.loans(processor_id);
create index if not exists loans_status_idx            on public.loans(org_id, status);
create index if not exists loans_stage_idx             on public.loans(stage_id);
create index if not exists loans_pipeline_idx          on public.loans(pipeline_id);
create index if not exists loans_contact_idx           on public.loans(contact_id);
create index if not exists loans_close_date_idx        on public.loans(org_id, estimated_close_date);

create index if not exists activities_org_idx          on public.activities(org_id);
create index if not exists activities_actor_idx        on public.activities(actor_id);
create index if not exists activities_contact_idx      on public.activities(contact_id);
create index if not exists activities_loan_idx         on public.activities(loan_id);
create index if not exists activities_partner_idx      on public.activities(partner_id);
create index if not exists activities_occurred_idx     on public.activities(org_id, occurred_at desc);
create index if not exists activities_type_idx         on public.activities(org_id, activity_type);

create index if not exists tasks_org_idx               on public.tasks(org_id);
create index if not exists tasks_assignee_idx          on public.tasks(assignee_id);
create index if not exists tasks_status_idx            on public.tasks(org_id, status);
create index if not exists tasks_due_idx               on public.tasks(org_id, due_at);
create index if not exists tasks_contact_idx           on public.tasks(contact_id);
create index if not exists tasks_loan_idx              on public.tasks(loan_id);

create index if not exists notes_org_idx               on public.notes(org_id);
create index if not exists notes_contact_idx           on public.notes(contact_id);
create index if not exists notes_loan_idx              on public.notes(loan_id);
create index if not exists notes_partner_idx           on public.notes(partner_id);

create index if not exists documents_org_idx           on public.documents(org_id);
create index if not exists documents_contact_idx       on public.documents(contact_id);
create index if not exists documents_loan_idx          on public.documents(loan_id);

create index if not exists saved_views_org_idx         on public.saved_views(org_id);
create index if not exists saved_views_resource_idx    on public.saved_views(org_id, resource);
create index if not exists saved_views_owner_idx       on public.saved_views(owner_id);

create index if not exists custom_fields_def_org_idx   on public.custom_fields_def(org_id);

-- -----------------------------------------------------------------------------
-- updated_at triggers — reuse public.touch_updated_at() created in migration 1.
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'companies','partners','contacts','pipelines','pipeline_stages',
    'loans','activities','tasks','notes','documents','saved_views','custom_fields_def'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.touch_updated_at()',
      t || '_touch_updated_at', t
    );
  end loop;
end $$;
