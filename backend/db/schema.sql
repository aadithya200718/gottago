-- GottaGO Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Simulates Guidewire InsuranceSuite: PolicyCenter, ClaimCenter, BillingCenter

-- =============================================
-- 1. WORKERS (core entity)
-- =============================================
create table if not exists public.workers (
  id                       uuid default gen_random_uuid() primary key,
  name                     text not null,
  phone                    text not null,           -- stored as SHA256 hash
  platform                 text check (platform in ('Swiggy', 'Zomato', 'Both')) not null,
  city                     text check (city in ('Mumbai', 'Delhi', 'Bengaluru')) not null,
  zone                     text not null,
  worker_id                text unique not null,    -- platform worker ID e.g. SWGMUM12345
  rating                   numeric(3,1) check (rating between 1.0 and 5.0) default 4.0,
  avg_weekly_hours         integer check (avg_weekly_hours between 10 and 80) default 40,
  baseline_weekly_earnings integer check (baseline_weekly_earnings between 1000 and 15000) default 6000,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- =============================================
-- 2. POLICIES (Guidewire PolicyCenter simulation)
-- =============================================
create table if not exists public.policies (
  id               uuid default gen_random_uuid() primary key,
  policy_number    text unique not null,            -- GTG-2026-MUM-123456
  worker_id        uuid not null references public.workers(id) on delete cascade,
  start_date       date not null,
  end_date         date not null,
  status           text check (status in ('active', 'paused', 'expired', 'cancelled')) default 'active',
  weekly_premium   integer not null,                -- Rs.
  coverage_amount  integer not null,                -- Rs.
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- =============================================
-- 3. CLAIMS (Guidewire ClaimCenter simulation)
-- =============================================
create table if not exists public.claims (
  id                 uuid default gen_random_uuid() primary key,
  claim_number       text unique not null,
  worker_id          uuid not null references public.workers(id) on delete cascade,
  policy_id          uuid not null references public.policies(id),
  trigger_type       text check (trigger_type in (
    'heavy_rainfall', 'extreme_heat', 'severe_aqi', 'government_bandh', 'compound_disruption'
  )) not null,
  trigger_timestamp  timestamptz not null default now(),
  payout_amount      integer not null,              -- Rs.
  status             text check (status in ('pending', 'approved', 'paid', 'flagged', 'rejected')) default 'pending',
  fraud_score        numeric(4,2) default 0.0,
  approved_at        timestamptz,
  paid_at            timestamptz,
  transaction_id     text,                          -- Razorpay payout ID
  created_at         timestamptz default now()
);

-- =============================================
-- 4. PREMIUM HISTORY (audit trail)
-- =============================================
create table if not exists public.premium_history (
  id                 uuid default gen_random_uuid() primary key,
  worker_id          uuid not null references public.workers(id) on delete cascade,
  policy_id          uuid references public.policies(id),
  calculated_premium integer not null,
  base_premium       integer not null default 159,
  multiplier         numeric(5,3) not null,
  features_json      jsonb,
  calculated_at      timestamptz default now()
);

-- =============================================
-- 5. DISRUPTION ZONES (geographic risk data) — must be before trigger_events
-- =============================================
create table if not exists public.disruption_zones (
  id               uuid default gen_random_uuid() primary key,
  city             text not null,
  zone_name        text not null,
  lat              numeric(10,6) not null,
  lon              numeric(10,6) not null,
  flood_risk_score numeric(3,2) check (flood_risk_score between 0 and 1) default 0.5,
  aqi_risk_score   numeric(3,2) check (aqi_risk_score between 0 and 1) default 0.5,
  unique (city, zone_name)
);

-- =============================================
-- 6. TRIGGER EVENTS (parametric trigger log)
-- =============================================
create table if not exists public.trigger_events (
  id                    uuid default gen_random_uuid() primary key,
  trigger_type          text check (trigger_type in (
    'heavy_rainfall', 'extreme_heat', 'severe_aqi', 'government_bandh', 'compound_disruption'
  )) not null,
  zone_id               uuid references public.disruption_zones(id),
  city                  text,
  timestamp             timestamptz not null default now(),
  duration_hours        integer default 3,
  intensity_value       numeric(10,2),              -- mm rain / temp °C / AQI / compound score
  source_api            text,                       -- OpenWeatherMap / WAQI / Manual
  affected_workers_count integer default 0,
  event_hash            text unique,                -- dedup: type+city+date
  created_at            timestamptz default now()
);

-- =============================================
-- 7. FRAUD FLAGS (fraud detection audit)
-- =============================================
create table if not exists public.fraud_flags (
  id           uuid default gen_random_uuid() primary key,
  claim_id     uuid not null references public.claims(id) on delete cascade,
  flag_type    text not null,                       -- VELOCITY_CHECK, GEO_MISMATCH, etc.
  severity     text check (severity in ('low', 'medium', 'high')) default 'low',
  details_json jsonb,
  flagged_at   timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_workers_worker_id on public.workers(worker_id);
create index if not exists idx_workers_city_zone on public.workers(city, zone);
create index if not exists idx_policies_worker_id on public.policies(worker_id);
create index if not exists idx_policies_status on public.policies(status);
create index if not exists idx_claims_worker_id on public.claims(worker_id);
create index if not exists idx_claims_policy_id on public.claims(policy_id);
create index if not exists idx_claims_status on public.claims(status);
create index if not exists idx_claims_trigger_type on public.claims(trigger_type);
create index if not exists idx_trigger_events_city on public.trigger_events(city);
create index if not exists idx_trigger_events_type on public.trigger_events(trigger_type);
create index if not exists idx_trigger_events_hash on public.trigger_events(event_hash);
create index if not exists idx_premium_history_worker_id on public.premium_history(worker_id);
create index if not exists idx_fraud_flags_claim_id on public.fraud_flags(claim_id);

-- =============================================
-- AUTO-UPDATE updated_at TRIGGER
-- =============================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_workers_updated_at on public.workers;
create trigger set_workers_updated_at
  before update on public.workers
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_policies_updated_at on public.policies;
create trigger set_policies_updated_at
  before update on public.policies
  for each row execute function public.update_updated_at_column();
