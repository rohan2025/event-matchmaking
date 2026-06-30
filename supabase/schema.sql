-- =============================================================
-- Event Matchmaking — Supabase schema (fresh install)
-- Run this in your personal Supabase project: SQL Editor → New query → paste → Run
-- Safe to re-run (idempotent).
-- =============================================================

-- ── events ──────────────────────────────────────────────────
create table if not exists events (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  event_date       date,
  location         text,
  description      text,
  image_url        text,
  luma_url         text,
  podcast_episodes jsonb default '[]'::jsonb,
  is_active        boolean default true,
  created_at       timestamptz default now()
);

-- ── luma_list (invited guests per event) ────────────────────
create table if not exists luma_list (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  linkedin_url text,
  checked_in   boolean default false,
  event_id     uuid references events(id) on delete cascade,
  unique (event_id, email)
);

-- ── profiles (registered attendees) ─────────────────────────
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text not null,
  company       text not null,
  role          text not null,
  what_building text,
  looking_for   text[] not null default '{}',
  can_offer     text[] not null default '{}',
  event_id      uuid references events(id) on delete cascade,
  created_at    timestamptz default now(),
  unique (event_id, email)
);

-- ── matches (computed match results) ────────────────────────
create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  profile_email text not null,
  match_email   text not null,
  match_rank    integer not null,
  score         integer not null,
  linkedin_url  text,
  event_id      uuid references events(id) on delete cascade,
  created_at    timestamptz default now()
);

-- ── admins (dynamic admin allowlist beyond the hardcoded one) ─
create table if not exists admins (
  email      text primary key,
  added_by   text,
  created_at timestamptz default now()
);

-- ── admin_otps (one-time codes for adding new admins) ───────
create table if not exists admin_otps (
  email        text primary key,
  code         text not null,
  expires_at   timestamptz not null,
  requested_by text,
  created_at   timestamptz default now()
);

-- ── trending_events_cache (daily cron cache, keyed by region) ─
create table if not exists trending_events_cache (
  id         text primary key,         -- region id, e.g. 'bangalore'
  events     jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- ── event_ideas (admin scratchpad) ─────────────────────────
create table if not exists event_ideas (
  id         uuid primary key default gen_random_uuid(),
  text       text not null,
  added_by   text,
  created_at timestamptz default now()
);

-- =============================================================
-- Row Level Security
-- Writes from API routes use the SERVICE ROLE key (bypasses RLS).
-- Client components read with the ANON key, so public-readable
-- tables get permissive policies. admin_otps stays service-role-only.
-- (MVP defaults — tighten before any real production use.)
-- =============================================================
alter table events                enable row level security;
alter table luma_list             enable row level security;
alter table profiles              enable row level security;
alter table matches               enable row level security;
alter table admins                enable row level security;
alter table admin_otps            enable row level security;
alter table trending_events_cache enable row level security;
alter table event_ideas           enable row level security;

do $$
declare t text;
begin
  -- Permissive "allow all" policies for everything the client touches
  foreach t in array array[
    'events','luma_list','profiles','matches',
    'admins','trending_events_cache','event_ideas'
  ]
  loop
    execute format('drop policy if exists "allow_all_%1$s" on %1$I;', t);
    execute format(
      'create policy "allow_all_%1$s" on %1$I for all using (true) with check (true);', t
    );
  end loop;
  -- admin_otps: no policy → only the service role key can read/write it.
end $$;
