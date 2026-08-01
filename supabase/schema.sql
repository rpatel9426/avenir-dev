-- ============================================================================
--  Avenir · Supabase schema
--  Run this in the Supabase SQL editor (Dashboard → SQL → New query) once your
--  project exists. It creates the tables, security policies and the trigger
--  that gives every new user a profile automatically.
-- ============================================================================

-- Enums -----------------------------------------------------------------------
do $$ begin
  create type experience_level as enum ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type run_goal as enum ('easy', 'long', 'tempo', 'intervals', 'recovery', 'race');
exception when duplicate_object then null; end $$;

-- Profiles --------------------------------------------------------------------
-- One row per auth user, holding coaching preferences.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  experience_level experience_level not null default 'intermediate',
  weekly_goal_km numeric not null default 30,
  preferred_pace_sec_per_km integer,
  plan text not null default 'free',
  -- Billing. Written only by the Stripe webhook (service role); the RLS policy
  -- below deliberately lets a runner read these but never set them.
  stripe_customer_id text unique,
  stripe_subscription_id text,
  -- Set by pain triage. While this is in the future, nothing is scheduled and
  -- nothing counts against the runner.
  plan_paused_until timestamptz,
  created_at timestamptz not null default now()
);

-- Safe to re-run on an existing database.
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan_paused_until timestamptz;

create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id);

-- Runs ------------------------------------------------------------------------
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal run_goal not null default 'easy',
  distance_m numeric not null default 0,
  duration_s integer not null default 0,
  avg_pace_sec_per_km integer,
  avg_heart_rate integer,
  calories integer,
  notes text,
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists runs_user_started_idx
  on public.runs (user_id, started_at desc);

-- Plan sessions ---------------------------------------------------------------
-- The runner's actual week. Without this, a plan change accepted in Coach only
-- ever changed what was on screen — the Plan tab still showed the old session
-- and a refresh lost it. `kind` is text rather than the run_goal enum because
-- a week legitimately contains rest and strength days.
create table if not exists public.plan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scheduled_on date not null,
  kind text not null default 'easy',
  detail text,
  -- A coach edit is tagged, never silent.
  tag text,
  load numeric not null default 0.5,
  completed_run_id uuid references public.runs (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, scheduled_on)
);

create index if not exists plan_sessions_user_date_idx
  on public.plan_sessions (user_id, scheduled_on);

-- Coach beliefs ---------------------------------------------------------------
-- What the coach thinks it knows about the runner, and whether the runner has
-- corrected it. Every claim on /about-you is a row here, so a correction is
-- absorbed rather than filed.
create table if not exists public.coach_beliefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  value text not null,
  -- Null while the coach inferred it; set the moment the runner corrects it.
  corrected_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, key)
);

-- Coaching messages -----------------------------------------------------------
-- The transcript of what Avenir said during a run (optional to persist).
create table if not exists public.coaching_messages (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs (id) on delete cascade,
  at_second integer not null,
  tone text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security ----------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.runs enable row level security;
alter table public.plan_sessions enable row level security;
alter table public.coach_beliefs enable row level security;
alter table public.coaching_messages enable row level security;

-- Plan sessions and beliefs: a runner sees and edits only their own.
drop policy if exists "plan sessions are owned" on public.plan_sessions;
create policy "plan sessions are owned" on public.plan_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "beliefs are owned" on public.coach_beliefs;
create policy "beliefs are owned" on public.coach_beliefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profiles: a user sees and edits only their own row.
drop policy if exists "profiles are self-service" on public.profiles;
create policy "profiles are self-service" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Runs: a user sees and writes only their own runs.
drop policy if exists "runs are owned" on public.runs;
create policy "runs are owned" on public.runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Coaching messages: accessible only via runs the user owns.
drop policy if exists "coaching messages follow their run" on public.coaching_messages;
create policy "coaching messages follow their run" on public.coaching_messages
  for all using (
    exists (
      select 1 from public.runs r
      where r.id = coaching_messages.run_id and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.runs r
      where r.id = coaching_messages.run_id and r.user_id = auth.uid()
    )
  );

-- Auto-create a profile whenever a new auth user signs up --------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
