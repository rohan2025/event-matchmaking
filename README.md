# Event Matchmaking

AI-powered matchmaking dashboard for networking events. Attendees fill a profile →
admin triggers match computation → each attendee gets an email with their top matches.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Supabase (Postgres + Auth) · Brevo SMTP · Vercel.

> This is a **de-branded MVP fork**. It carries no original branding, uses your own
> accounts, and ships with **dummy seed data** — not real attendee data.

---

## Run locally

```bash
npm install
cp .env.local.example .env.local      # then fill in your values
npm run dev
```

Open http://localhost:3000 (public form) and http://localhost:3000/admin (admin dashboard).

---

## Standing this up under YOUR accounts

This fork is fully independent from the original production deployment. Setting it up
touches **none** of the original's GitHub / Vercel / Supabase. Do these once:

### 1. GitHub (your account)
```bash
git init
git add -A
git commit -m "Initial commit: de-branded Event Matchmaking MVP"
# create an EMPTY repo under your personal GitHub, then:
git remote add origin https://github.com/<your-username>/event-matchmaking.git
git push -u origin main
```

### 2. Supabase (your project)
1. Create a new project at https://supabase.com (your personal login).
2. **SQL Editor → New query** → paste `supabase/schema.sql` → **Run**.
3. (Optional, for the demo) paste `supabase/seed.sql` → **Run** to load dummy data.
4. **Settings → API** → copy the Project URL, `anon` key, and `service_role` key into `.env.local`.
5. **Authentication → Providers → Google** → enable it and add your OAuth client
   (admin sign-in uses Google). Add `http://localhost:3000` and your Vercel URL to
   **Authentication → URL Configuration → Redirect URLs**.

### 3. Email — Brevo (your account)
1. Create a Brevo account → **SMTP & API → SMTP** → generate credentials.
2. Verify a sender address/domain in Brevo.
3. Put the SMTP login/key in `.env.local` and update the `from:` address in
   `src/app/api/**/route.ts` to your verified sender if you want match/OTP emails to send.

### 4. Vercel (your account)
1. Import your new GitHub repo into a new Vercel project (your personal login).
2. **Settings → Environment Variables** → add all the keys from `.env.local`.
3. Deploy. The daily cron in `vercel.json` (trending refresh) works on any plan that
   allows 1 cron/day.

---

## Admin access

Admin sign-in is Google OAuth, gated to a hardcoded allowlist plus a dynamic `admins`
table. The allowlist currently contains a single email:

- `src/lib/admin-auth.ts` → `SUPER_ADMIN_EMAILS`
- `src/app/admin/layout.tsx` → `SUPER_ADMIN_EMAILS`
- `src/app/admin/settings/page.tsx` → `CORE_ADMINS`

Change the email in those three spots to whoever should have access. Additional admins
can be added at runtime from **/admin/settings** (sends an OTP to confirm).

---

## Project layout

```
src/app/                 # routes (public form + /admin dashboard + /api)
src/components/           # forms, chat, waiting screen
src/lib/                  # supabase client + admin auth
supabase/schema.sql       # full DB schema (run first)
supabase/seed.sql         # dummy demo data (optional)
.env.local.example        # env template
```

## Notes
- RLS policies in `schema.sql` are permissive MVP defaults. Tighten them before any
  real production use.
- The match algorithm scores mutual benefit (`looking_for` vs `can_offer` overlap).
