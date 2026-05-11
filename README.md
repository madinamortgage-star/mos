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
├── src/
│   ├── app/
│   │   ├── (auth)/               # /login, /signup
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (app)/                # Protected route group
│   │   │   ├── layout.tsx        # requires a user (or stub in placeholder mode)
│   │   │   ├── home/page.tsx
│   │   │   ├── prospecting/page.tsx
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── active/page.tsx
│   │   │   ├── preapproved/page.tsx
│   │   │   ├── past/page.tsx
│   │   │   ├── partners/page.tsx
│   │   │   └── contacts/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx            # Root HTML
│   │   └── page.tsx              # Redirects to /home
│   ├── components/
│   │   ├── sidebar.tsx
│   │   ├── page-header.tsx
│   │   └── coming-soon.tsx
│   ├── lib/
│   │   ├── auth.ts               # getUser / requireUser (placeholder-aware)
│   │   └── supabase/
│   │       ├── env.ts            # central env reading
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

## Placeholder mode

Until real keys are pasted in, the project intentionally stays runnable:

- `isSupabaseConfigured()` reports `false`.
- `createClient()` (browser & server) returns `null` — guard with `if (!supabase) …`.
- `requireUser()` returns a stub user (`demo@mos.local`).
- `/login` shows a banner explaining the mode.
- Middleware is a pass-through.

This lets the team iterate on UI and ship preview deploys to Vercel before any
backend exists.

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

Tracked in the phased plan in chat. Immediate next steps:

1. Wire Supabase Auth (email/password + Google OAuth).
2. Create `organizations` + RLS-scoped domain tables.
3. Port the `contacts` page from `/legacy` to live Supabase data.
