# Supabase

Migrations (run in filename order):

| File | What it adds |
| ---- | ------------ |
| `20260101000000_init_tenancy.sql` | `profiles`, `organizations`, `org_members`, new-user bootstrap trigger |
| `20260101000100_rls_tenancy.sql`  | RLS for the tenancy tables + `is_org_member()` helper |
| `20260101000200_domain_model.sql` | Core CRM domain: `companies`, `partners`, `contacts`, `pipelines`, `pipeline_stages`, `loans`, `activities`, `tasks`, `notes`, `documents`, `saved_views`, `custom_fields_def` — enums, indexes, contacts full-text search, `updated_at` triggers |
| `20260101000300_domain_rls.sql`   | Org-scoped RLS (`for all using (is_org_member(org_id))`) on every domain table |

`supabase/seed.sql` is **optional** demo data — see "Demo data" below.

Every domain table carries `org_id uuid not null references organizations(id)`
and is gated by RLS through the `public.is_org_member(uuid)` helper.

## You don't need to run these yet

The app runs in **placeholder mode** until you add real Supabase keys to
`.env.local` (and to Vercel). Once you do, apply the migrations:

### Option A — Supabase CLI (recommended)

```bash
npm i -g supabase
supabase login
supabase init                       # if you don't already have supabase/config.toml
supabase link --project-ref <your-project-ref>
supabase db push
```

### Option B — Dashboard SQL editor

Open each file in [`migrations/`](./migrations) **in filename order** and run
it in Supabase → SQL Editor.

## After applying the schema

1. **Email auth** — Supabase → Authentication → Providers → enable **Email**.
   (Turn "Confirm email" on/off to taste; the signup flow handles both.)
2. **Redirect URLs** — Supabase → Authentication → URL Configuration:
   - Site URL: your `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000` or your
     Vercel domain)
   - Redirect URLs: add `<site-url>/auth/callback`
   <!-- TODO(Supabase redirect URLs): add every environment you deploy to —
        localhost, Vercel preview wildcard, and production. -->
3. **Google OAuth (TODO)** — Supabase → Authentication → Providers → enable
   **Google**, then wire the UI. Hook points are marked with
   `TODO(Google OAuth)` in:
   - `src/lib/actions/auth.ts`
   - `src/app/auth/callback/route.ts`
   - `src/components/login-form.tsx`
4. **Vercel env vars (TODO)** — add `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and
   `NEXT_PUBLIC_SITE_URL` under Vercel → Project Settings → Environment
   Variables (Preview + Production).
5. **RLS hardening (TODO)** — review the `TODO(prod RLS hardening)` blocks in
   `migrations/20260101000100_rls_tenancy.sql` and
   `migrations/20260101000300_domain_rls.sql`, and run `supabase db lint`.
6. **Storage (TODO)** — `documents.storage_path` expects a private Storage
   bucket (e.g. `loan-docs`) with RLS on `storage.objects` so only org members
   can read/write paths under their org. See the TODO in
   `migrations/20260101000200_domain_model.sql`.

## Demo data (optional)

`supabase/seed.sql` creates a `Demo Workspace` org with sample contacts,
partners, a loan pipeline, loans, activities and tasks. It is **not** a
migration — `supabase db push` skips it; `supabase db reset` runs it; or paste
it into the SQL editor. It's idempotent (re-running is a no-op) and does not
create auth users — to see the data in the app, attach your user to the demo
org as shown in the file's header comment.

## Generating TypeScript types (later)

Once the schema is live you can replace the untyped Supabase clients with
generated types:

```bash
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

…and pass `Database` as the generic to `createBrowserClient<Database>` /
`createServerClient<Database>`.
