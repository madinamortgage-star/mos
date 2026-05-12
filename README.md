# MOS — Mortgage Operating System

A production-ready Next.js 15 (App Router) scaffold for the MOS CRM, prepared
to deploy on **Vercel** with **Supabase** for auth and data.

The original HTML/JSX prototype is preserved under [`/legacy`](./legacy) for
reference while features are ported over.

---

## Stack

- **Next.js 15** (App Router, React Server Components, Server Actions)
- **TypeScript** (strict)
- **Tailwind CSS** (design tokens lifted from the prototype palette)
- **Supabase** (`@supabase/ssr`) — auth + Postgres, **placeholder-wired** today
- **Vercel** — first-class deploy target

---

## Quick start

```bash
npm install
cp .env.example .env.local      # leave values empty for now
npm run dev
```

Open <http://localhost:3000>. You will be redirected to `/home`. The app runs
in **placeholder mode** until Supabase env vars are filled in — protected
routes still render with a stub user.

---

## Project layout

```
.
├── legacy/                       # Original HTML/JSX prototype (read-only)
├── supabase/
│   ├── README.md                 # how to apply migrations + post-setup steps
│   ├── seed.sql                  # OPTIONAL idempotent demo data (not a migration)
│   └── migrations/
│       ├── 20260101000000_init_tenancy.sql   # profiles, organizations, org_members
│       ├── 20260101000100_rls_tenancy.sql    # tenancy RLS (+ is_org_member helper)
│       ├── 20260101000200_domain_model.sql   # contacts/loans/pipelines/activities/… + FTS
│       └── 20260101000300_domain_rls.sql     # org-scoped RLS on every domain table
├── src/
│   ├── app/
│   │   ├── (auth)/               # /login, /signup (server pages → client forms)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (app)/                # Protected route group
│   │   │   ├── layout.tsx        # requireUser() + org context
│   │   │   ├── home/page.tsx
│   │   │   ├── prospecting/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── active/page.tsx
│   │   │   ├── preapproved/page.tsx
│   │   │   ├── past/page.tsx
│   │   │   ├── partners/page.tsx
│   │   │   └── contacts/page.tsx
│   │   ├── auth/callback/route.ts # OAuth / email-confirmation callback
│   │   ├── globals.css
│   │   ├── layout.tsx            # Root HTML
│   │   └── page.tsx              # Redirects to /home
│   ├── components/
│   │   ├── sidebar.tsx           # nav + org switcher + sign-out
│   │   ├── login-form.tsx        # client, useActionState → signInAction
│   │   ├── signup-form.tsx       # client, useActionState → signUpAction
│   │   ├── org-switcher.tsx      # placeholder cookie-backed org switcher
│   │   ├── page-header.tsx
│   │   └── coming-soon.tsx
│   ├── lib/
│   │   ├── auth.ts               # getUser / requireUser / AuthState (placeholder-aware)
│   │   ├── org.ts                # getUserOrgs / getOrgContext (placeholder-aware)
│   │   ├── actions/
│   │   │   ├── auth.ts           # "use server": signIn / signUp / signOut
│   │   │   └── org.ts            # "use server": setActiveOrg
│   │   ├── db/                   # server-only data layer (Phase 3 pages call these)
│   │   │   ├── types.ts          # hand-written domain types (until generated types)
│   │   │   ├── contacts.ts       # listContacts / getContact / countContacts
│   │   │   ├── loans.ts          # listLoans / getLoan / listLoansGroupedByStage
│   │   │   ├── pipelines.ts      # listPipelines / getPipelineWithStages / …
│   │   │   └── activities.ts     # listActivities
│   │   └── supabase/
│   │       ├── env.ts            # central env reading + isSupabaseConfigured()
│   │       ├── client.ts         # browser client
│   │       ├── server.ts         # RSC / Route Handler / Server Action client
│   │       └── middleware.ts     # session refresh helper
│   └── middleware.ts             # runs supabase/middleware on every request
├── .env.example                  # documented placeholder env vars
├── .env.local                    # gitignored — paste real values here
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

---

## Environment variables

Documented in [`.env.example`](./.env.example).

| Variable                          | Where to get it                                                   | Visibility |
| --------------------------------- | ----------------------------------------------------------------- | ---------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase → Project Settings → API → Project URL                   | Public     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase → Project Settings → API → `anon` `public` key           | Public     |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase → Project Settings → API → `service_role` key            | **Server-only — never expose** |
| `NEXT_PUBLIC_SITE_URL`            | `http://localhost:3000` locally, your domain in production         | Public     |

### Filling them in

1. Create a project at <https://app.supabase.com>.
2. Copy the keys from **Project Settings → API**.
3. Paste them into **`.env.local`** for local dev.
4. Paste them into **Vercel → Project Settings → Environment Variables** for
   Preview and Production.

Once `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set,
the app automatically switches out of placeholder mode:

- `createClient()` returns real Supabase clients.
- Middleware refreshes the auth session on every request.
- `requireUser()` redirects unauthenticated visitors to `/login`.

---

## Auth & tenancy (Phase 1)

- **Email/password** sign-in & sign-up via Supabase Auth — Server Actions in
  `src/lib/actions/auth.ts`, surfaced through `login-form.tsx` / `signup-form.tsx`.
- **Sign-out** button in the sidebar (`signOutAction`).
- **Session refresh** in `src/middleware.ts` on every request.
- **Protected routes** — everything under `src/app/(app)/` goes through
  `requireUser()`.
- **`/auth/callback`** route handler for email-confirmation links and (TODO)
  Google OAuth.
- **Tenancy** — `organizations`, `profiles`, `org_members` tables
  (`supabase/migrations/`), a new-user trigger that creates a personal org +
  owner membership, and a minimal RLS layer.
- **Org switcher** — a placeholder `<select>` in the sidebar that persists the
  active org in a cookie; `getOrgContext()` resolves it against real
  memberships.

Apply the migrations when you're ready — see [`supabase/README.md`](./supabase/README.md).
You don't need to run them to use the app in placeholder mode.

### Placeholder mode

Until real keys are pasted in, the project intentionally stays runnable:

- `isSupabaseConfigured()` reports `false`.
- `createClient()` (browser & server) returns `null` — guard with `if (!supabase) …`.
- Auth Server Actions return a friendly "not configured" message instead of
  hitting the network.
- `requireUser()` returns a stub user (`demo@mos.local`); `getUserOrgs()`
  returns a single demo org.
- `/login` and `/signup` show a banner explaining the mode.
- Middleware is a pass-through.

Fill in `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` and auth +
tenancy activate automatically — no code changes.

---

## Deploying to Vercel

1. Push this branch.
2. **Import Project** in Vercel from the GitHub repo.
3. Framework Preset: **Next.js** (auto-detected).
4. Add env vars (see table above) under **Environment Variables**.
5. Deploy.

Preview deploys work without Supabase keys — they just run in placeholder mode.

---

## Scripts

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start Next dev server on :3000            |
| `npm run build`     | Production build                          |
| `npm run start`     | Run the production build                  |
| `npm run lint`      | ESLint                                    |
| `npm run type-check`| `tsc --noEmit`                            |

---

## Next phases

Tracked in the phased plan in chat.

- **Phase 1 — done.** Supabase Auth (email/password) + tenancy
  (`profiles` / `organizations` / `org_members`), middleware session refresh,
  protected routes, placeholder org switcher.
- **Phase 2 — done.** Core domain schema (`companies`, `partners`, `contacts`,
  `pipelines`, `pipeline_stages`, `loans`, `activities`, `tasks`, `notes`,
  `documents`, `saved_views`, `custom_fields_def`) — all `org_id`-scoped with
  RLS, enums, indexes, contacts full-text search, `updated_at` triggers, an
  optional demo seed, plus a server-only data layer (`src/lib/db/`) and
  hand-written domain types. Migrations are committed but **not run** — the app
  stays in placeholder mode.
- **Phase 3 — next.** Port the prototype pages from `/legacy` to live Supabase
  data, one at a time, using the `src/lib/db/` helpers (start with Contacts).
  Also: Google OAuth (`TODO(Google OAuth)`), production RLS hardening
  (`TODO(prod RLS hardening)`), and a Storage bucket for `documents`.
