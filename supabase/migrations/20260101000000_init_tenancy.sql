-- =============================================================================
-- MOS — Phase 1 migration: auth & basic tenancy
-- Tables: organizations, profiles, org_members  (+ new-user bootstrap trigger)
-- =============================================================================
-- You do NOT need to run this yet. The app runs in placeholder mode until real
-- Supabase keys are added. When you're ready, apply it with either:
--   • Supabase CLI:      supabase db push
--   • Dashboard:         paste into SQL Editor and run (in filename order)
-- See supabase/README.md for details.
-- =============================================================================

create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- organizations — a tenant. Every domain table added later should carry an
-- `org_id uuid not null references organizations(id)` column.
-- -----------------------------------------------------------------------------
create table if not exists public.organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- profiles — 1:1 with auth.users. Public-facing user data lives here, not in
-- the auth schema.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  nmls_id     text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- org_members — which users belong to which orgs, and their role.
-- -----------------------------------------------------------------------------
do $$
begin
  create type public.org_role as enum ('owner', 'admin', 'member');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.org_members (
  org_id      uuid not null references public.organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        public.org_role not null default 'member',
  created_at  timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index if not exists org_members_user_id_idx on public.org_members(user_id);

-- -----------------------------------------------------------------------------
-- updated_at touch trigger
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists organizations_touch_updated_at on public.organizations;
create trigger organizations_touch_updated_at
  before update on public.organizations
  for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- New-user bootstrap: on signup create a profile + a personal org + owner
-- membership. Runs as SECURITY DEFINER so it can write past RLS.
--
-- TODO(prod): if you move to invite-only org creation, change this to only
-- insert the profile and let an explicit "create organization" flow handle the
-- rest.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_handle text;
begin
  v_handle := nullif(
    regexp_replace(lower(split_part(coalesce(new.email, ''), '@', 1)), '[^a-z0-9]+', '-', 'g'),
    ''
  );
  v_handle := coalesce(v_handle, 'user');

  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', initcap(replace(v_handle, '-', ' ')))
  )
  on conflict (id) do nothing;

  insert into public.organizations (name, slug)
  values (
    coalesce(
      new.raw_user_meta_data->>'org_name',
      initcap(replace(v_handle, '-', ' ')) || '''s Workspace'
    ),
    v_handle || '-' || substr(replace(new.id::text, '-', ''), 1, 8)
  )
  returning id into v_org_id;

  insert into public.org_members (org_id, user_id, role)
  values (v_org_id, new.id, 'owner')
  on conflict (org_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
