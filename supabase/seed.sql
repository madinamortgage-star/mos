-- =============================================================================
-- MOS — OPTIONAL demo seed data
-- =============================================================================
-- This is NOT a migration. `supabase db push` does NOT run it. It IS run by
-- `supabase db reset`. To load it manually, paste it into the SQL editor.
--
-- Safe / idempotent: it creates a "Demo Workspace" org and, only if that org
-- has no contacts yet, fills it with sample data. Re-running is a no-op.
--
-- It does NOT create auth users — `owner_id` columns are left NULL. To see this
-- data in the app, attach your own user to the demo org:
--
--   insert into public.org_members (org_id, user_id, role)
--   select id, '<your-auth-user-id>', 'owner'
--   from public.organizations where slug = 'demo-workspace'
--   on conflict do nothing;
--
-- (find your user id in Supabase → Authentication → Users, or run
--  `select id, email from auth.users;`)
-- =============================================================================

do $$
declare
  v_org            uuid;
  v_pipeline       uuid := 'a0000000-0000-4000-8000-0000000000f1';
  v_stage_pre      uuid := 'a0000000-0000-4000-8000-0000000000e1';
  v_stage_app      uuid := 'a0000000-0000-4000-8000-0000000000e2';
  v_stage_uw       uuid := 'a0000000-0000-4000-8000-0000000000e3';
  v_stage_ctc      uuid := 'a0000000-0000-4000-8000-0000000000e4';
  v_stage_funded   uuid := 'a0000000-0000-4000-8000-0000000000e5';
  v_company_keller uuid := 'a0000000-0000-4000-8000-0000000000b1';
  v_partner_orr    uuid := 'a0000000-0000-4000-8000-0000000000a1';
  v_marcus         uuid := 'a0000000-0000-4000-8000-000000000001';
  v_priya          uuid := 'a0000000-0000-4000-8000-000000000002';
  v_nakamura       uuid := 'a0000000-0000-4000-8000-000000000003';
  v_samantha       uuid := 'a0000000-0000-4000-8000-000000000004';
  v_loan_marcus    uuid := 'a0000000-0000-4000-8000-0000000000c1';
  v_loan_nakamura  uuid := 'a0000000-0000-4000-8000-0000000000c2';
begin
  insert into public.organizations (name, slug)
  values ('Demo Workspace', 'demo-workspace')
  on conflict (slug) do nothing;

  select id into v_org from public.organizations where slug = 'demo-workspace';
  if v_org is null then return; end if;

  -- Already seeded? bail out so re-runs are no-ops.
  if exists (select 1 from public.contacts where org_id = v_org) then return; end if;

  -- companies ----------------------------------------------------------------
  insert into public.companies (id, org_id, name, industry, website)
  values (v_company_keller, v_org, 'Keller Williams — Pasadena', 'Real Estate', 'kw.com');

  -- pipeline + stages --------------------------------------------------------
  insert into public.pipelines (id, org_id, name, key, is_default, position)
  values (v_pipeline, v_org, 'Loan Pipeline', 'loan_pipeline', true, 0);

  insert into public.pipeline_stages (id, org_id, pipeline_id, name, key, color, position, is_won) values
    (v_stage_pre,    v_org, v_pipeline, 'Pre-Approval',   'pre',    '#3a5187', 0, false),
    (v_stage_app,    v_org, v_pipeline, 'Application',    'app',    '#263c6e', 1, false),
    (v_stage_uw,     v_org, v_pipeline, 'Underwriting',   'uw',     '#B07A3A', 2, false),
    (v_stage_ctc,    v_org, v_pipeline, 'Clear to Close', 'ctc',    '#4E7A4E', 3, false),
    (v_stage_funded, v_org, v_pipeline, 'Funded',         'funded', '#1A1410', 4, true);

  -- partners -----------------------------------------------------------------
  insert into public.partners (id, org_id, name, partner_type, company_id, email, phone, tier, status)
  values (v_partner_orr, v_org, 'Samantha Orr', 'agent', v_company_keller, 'samantha@kw.com', '(310) 555-0441', 'platinum', 'active');

  -- contacts -----------------------------------------------------------------
  insert into public.contacts (id, org_id, first_name, last_name, email, phone, lifecycle, status, priority, source, tags, partner_id, company_id, next_follow_up_at) values
    (v_marcus,   v_org, 'Marcus', 'Delgado',  'marcus@example.com',  '(714) 555-0194', 'lead',        'hot',  'high',   'Referral',        array['purchase','first-time'], v_partner_orr, null,            now() + interval '1 day'),
    (v_priya,    v_org, 'Priya',  'Raman',    'priya@example.com',   '(949) 555-0312', 'partner',     'warm', 'high',   'Partner',         array['agent'],                 null,          null,            now() + interval '2 days'),
    (v_nakamura, v_org, 'Jordan', 'Nakamura', 'jordan@example.com',  '(310) 555-0088', 'past_client', 'warm', 'high',   'Existing Client', array['refi-candidate'],        null,          null,            now() + interval '5 days'),
    (v_samantha, v_org, 'Samantha','Orr',     'samantha@kw.com',     '(310) 555-0441', 'partner',     'warm', 'medium', 'Partner',         array['agent','keller'],        v_partner_orr, v_company_keller, now() + interval '7 days');

  -- loans --------------------------------------------------------------------
  insert into public.loans (id, org_id, contact_id, pipeline_id, stage_id, status, temperature, loan_purpose, loan_type, amount, property_value, interest_rate, lender, expected_revenue, commission, rate_lock_expires_at, notes, next_follow_up_at) values
    (v_loan_marcus,   v_org, v_marcus,   v_pipeline, v_stage_pre, 'application',  'hot',  'purchase',  '30-yr Conv', 656000, 820000, 6.125, 'UWM',    11800, 9400, current_date + 14, 'Pre-approval expires Friday — push closing before May 2.', now() + interval '1 day'),
    (v_loan_nakamura, v_org, v_nakamura, v_pipeline, v_stage_uw,  'underwriting', 'warm', 'refinance', '30-yr Conv', 410000, 690000, 5.625, 'Rocket',  7200, 5800, current_date + 7,  'Break-even ~14 months. Birthday next week.',                now() + interval '2 days');

  -- activities ---------------------------------------------------------------
  insert into public.activities (org_id, activity_type, subject, body, contact_id, loan_id, occurred_at) values
    (v_org, 'call',         'Outbound call',  'Left voicemail re: pre-approval expiry.',               v_marcus,   v_loan_marcus,   now() - interval '2 days'),
    (v_org, 'note',         'Note',           'Bonus structure changed last month — re-qualify income.', v_marcus, v_loan_marcus,   now() - interval '6 days'),
    (v_org, 'stage_change', 'Stage changed',  'Moved to Underwriting.',                                v_nakamura, v_loan_nakamura, now() - interval '1 day');

  -- tasks --------------------------------------------------------------------
  insert into public.tasks (org_id, title, description, status, priority, due_at, contact_id, loan_id) values
    (v_org, 'Call Marcus Delgado',              'Re-qualify income; pre-approval expires Friday.', 'open', 'high',   now() + interval '1 day',  v_marcus,   v_loan_marcus),
    (v_org, 'Send refi numbers to Nakamuras',   'Lead with ~$312/mo savings.',                     'open', 'medium', now() + interval '3 days', v_nakamura, v_loan_nakamura);

  -- notes --------------------------------------------------------------------
  insert into public.notes (org_id, body, contact_id, pinned) values
    (v_org, 'Prefers texts over calls before 10am.', v_marcus, true);

  -- saved view + custom field examples ---------------------------------------
  insert into public.saved_views (org_id, name, resource, is_shared, config)
  values (v_org, 'Hot leads', 'contacts', true, '{"filters":{"status":"hot"},"sort":{"field":"next_follow_up_at","dir":"asc"},"view":"table"}'::jsonb);

  insert into public.custom_fields_def (org_id, resource, key, label, field_type, position)
  values (v_org, 'contacts', 'preferred_lender', 'Preferred Lender', 'text', 0);
end $$;
