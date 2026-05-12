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
│   │   │   ├── contacts/        # ← Phase 3A: live (Supabase) Contacts section
│   │   │   │   ├── page.tsx     #   server: loads via lib/db/contacts, filters from URL
│   │   │   │   ├── loading.tsx  #   skeleton
│   │   │   │   ├── error.tsx    #   route error boundary (client)
│   │   │   │   └── [id]/page.tsx#   server: contact detail + activity timeline
│   │   │   └── pipeline/        # ← Phase 3B: live (Supabase) Loan Pipeline board
│   │   │       ├── page.tsx     #   server: pipeline + stages + loans + borrower names
│   │   │       ├── loading.tsx  #   column skeletons
│   │   │       └── error.tsx    #   route error boundary (client)
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
│   │   ├── coming-soon.tsx
│   │   ├── empty-state.tsx       # reusable empty state (pure)
│   │   ├── contacts/             # Contacts UI (mostly client islands)
│   │   │   ├── badges.tsx        #   lifecycle / status / priority / tags badges (pure)
│   │   │   ├── contacts-filters.tsx # client: search + lifecycle chips → URL params
│   │   │   ├── contacts-table.tsx   # client: rows, click → drawer
│   │   │   ├── contact-drawer.tsx   # client: slide-over quick view
│   │   │   ├── contacts-board.tsx   # client: owns drawer state; table + drawer + empty
│   │   │   └── new-contact-button.tsx # client: modal + createContactAction
│   │   └── pipeline/             # Loan Pipeline board UI
│   │       ├── loan-badges.tsx   #   loan status / temperature / purpose badges (pure)
│   │       ├── loan-card.tsx     #   loan card (pure)
│   │       ├── pipeline-column.tsx # stage column: header (count + $ total) + cards (pure)
│   │       ├── loan-drawer.tsx   #   client: slide-over loan quick view
│   │       ├── pipeline-board.tsx#   client: search/filter + grouping by stage + drawer
│   │       └── new-loan-button.tsx # client: modal + createLoanAction
│   ├── lib/
│   │   ├── auth.ts               # getUser / requireUser / AuthState (placeholder-aware)
│   │   ├── org.ts                # getUserOrgs / getOrgContext (placeholder-aware)
│   │   ├── contacts/format.ts    # pure presentation helpers (names, dates, badge meta)
│   │   ├── loans/format.ts       # pure presentation helpers (money, rate, loan badge meta)
│   │   ├── actions/
│   │   │   ├── auth.ts           # "use server": signIn / signUp / signOut
│   │   │   ├── org.ts            # "use server": setActiveOrg
│   │   │   ├── contacts.ts       # "use server": createContactAction
│   │   │   └── loans.ts          # "use server": createLoanAction
│   │   ├── db/                   # server-only data layer
│   │   │   ├── types.ts          # hand-written domain types (until generated types)
│   │   │   ├── contacts.ts       # listContacts / getContact / getContactsByIds / count
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
- **Phase 3A — done.** Contacts section ported from `/legacy` to the App
  Router: server-side list (`/contacts`) loaded via `lib/db/contacts`, URL-driven
  search + lifecycle filters, lifecycle/status/priority/tag badges, a slide-over
  drawer, a contact detail page (`/contacts/[id]`) with the activity timeline,
  a placeholder-but-wired "New contact" form (`createContactAction`), and
  loading / error / empty states. When Supabase is unconfigured it shows a clean
  placeholder empty state instead of crashing.
- **Phase 3B — done.** Loan Pipeline board (`/pipeline`): server-side load of
  the default pipeline, its `pipeline_stages`, and its `loans` (with borrower
  names resolved via `getContactsByIds`); a responsive Kanban — one column per
  stage with count + volume totals, loan cards with status/temperature/purpose
  badges, an "Unassigned" column for stage-less loans; client-side search +
  My-deals / Hot filters; a loan detail slide-over (links to the borrower
  contact); a placeholder-safe "New loan" form (`createLoanAction`, drops into
  the default pipeline's first stage); loading / error / empty states. Clean
  placeholder board when Supabase is unconfigured. Drag-and-drop stage moves
  are intentionally not wired yet.
- **Phase 3C+ — next.** Port the remaining prototype pages (Prospecting,
  Partners, Dashboard, Active Leads / Pre-Approved / Past Clients boards) the
  same way. Also: Google OAuth (`TODO(Google OAuth)`), production RLS hardening
  (`TODO(prod RLS hardening)`), a Storage bucket for `documents`, drag-and-drop
  stage moves with activity logging, and more mutations (edit / delete / bulk).
