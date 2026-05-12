-- =============================================================================
-- MOS — Phase 1 migration: Row Level Security for the tenancy tables
-- =============================================================================
-- These policies are intentionally MINIMAL for the scaffold — just enough that
-- a signed-in user can see their own profile and the org(s) they belong to.
--
-- TODO(prod RLS hardening) — before launch, review every policy below:
--   • restrict INSERT/UPDATE/DELETE on organizations & org_members to
--     owner/admin roles (add a SECURITY DEFINER role-check helper)
--   • decide whether org members can read each other's profiles
--   • add explicit policies for the `service_role` paths used by cron / admin
--   • run `supabase db lint` and add automated cross-org isolation tests
--   • when you add domain tables (contacts, loans, …), give each an
--     `org_id uuid not null references organizations(id)` column and a policy
--     `using (public.is_org_member(org_id))`
-- =============================================================================

alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.org_members   enable row level security;

-- Helper: is auth.uid() a member of `target_org`?
-- SECURITY DEFINER so it can read org_members without recursing into RLS.
create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members m
    where m.org_id = target_org
      and m.user_id = auth.uid()
  );
$$;

-- profiles --------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());
-- profiles INSERT is handled by the SECURITY DEFINER handle_new_user() trigger.

-- organizations ---------------------------------------------------------------
drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member" on public.organizations
  for select
  using (public.is_org_member(id));
-- TODO(prod RLS): owners/admins only for UPDATE; no client-side INSERT/DELETE.

-- org_members -----------------------------------------------------------------
drop policy if exists "org_members_select_member" on public.org_members;
create policy "org_members_select_member" on public.org_members
  for select
  using (public.is_org_member(org_id));
-- TODO(prod RLS): owners/admins only for INSERT/UPDATE/DELETE of memberships.
