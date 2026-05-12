# Supabase

Phase 1 schema: auth + basic tenancy — `profiles`, `organizations`, `org_members`
(plus a new-user bootstrap trigger and minimal RLS).

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
5. **RLS hardening (TODO)** — review the `TODO(prod RLS hardening)` block in
   `migrations/20260101000100_rls_tenancy.sql` and run `supabase db lint`.

## Generating TypeScript types (later)

Once the schema is live you can replace the untyped Supabase clients with
generated types:

```bash
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

…and pass `Database` as the generic to `createBrowserClient<Database>` /
`createServerClient<Database>`.
