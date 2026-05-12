-- =============================================================================
-- MOS — Phase 2 migration: Row Level Security for the domain tables
-- =============================================================================
-- Every domain table is org-scoped. The policy below grants full access to any
-- member of the row's org, using the `public.is_org_member(uuid)` helper from
-- migration 20260101000100_rls_tenancy.sql.
--
-- TODO(prod RLS hardening) — before launch, replace the single "for all" policy
-- per table with per-operation policies and tighten as needed, e.g.:
--   • SELECT: all org members
--   • INSERT/UPDATE: members, but block changing org_id to another org and
--     restrict who can reassign owner_id (manager-only)
--   • DELETE: owner/admin role only (add a SECURITY DEFINER role-check helper,
--     e.g. public.has_org_role(org_id, variadic roles))
--   • activities: append-only for non-admins (no UPDATE/DELETE)
--   • saved_views: a user may only modify their own (owner_id = auth.uid())
--     unless is_shared and they're an admin
--   • pipeline_stages: ensure org_id always matches the parent pipeline's org_id
-- Then run `supabase db lint` and add automated cross-org isolation tests.
-- =============================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'companies','partners','contacts','pipelines','pipeline_stages',
    'loans','activities','tasks','notes','documents','saved_views','custom_fields_def'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_org_access', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id))',
      t || '_org_access', t
    );
  end loop;
end $$;
