-- Lead storage for acvirtualboatshow.com
-- Paste into the Supabase SQL editor and run. Safe to re-run.
--
-- Design: every submission writes a row of non-identifying dimensions, always.
-- Contact details are written ONLY when the shopper ticks the consent box, so
-- reporting works without holding personal data by default.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  type              text not null,
  source            text,

  boat_slug         text,
  boat_year         int,
  boat_make         text,
  boat_model        text,
  dealer_name       text,
  show_location     text,

  show_day          date,
  daypart           text,

  page_url          text,
  referrer          text,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_term          text,
  utm_content       text,

  -- HMAC of the email using a server-side secret. Lets us count unique
  -- shoppers and spot duplicate submissions without storing an address.
  -- Pseudonymous, not anonymous, while we hold the secret: rotate or discard
  -- it after the show and these become untraceable.
  contact_hash      text,

  delivered         boolean not null default false,
  delivery_error    text,

  -- Consent-gated. Null unless marketing_opt_in is true.
  marketing_opt_in  boolean not null default false,
  first_name        text,
  last_name         text,
  email             text,
  phone             text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_dealer_idx     on public.leads (dealer_name);
create index if not exists leads_boat_idx       on public.leads (boat_slug);
create index if not exists leads_show_day_idx   on public.leads (show_day);

-- Belt and braces: contact columns cannot be populated without consent.
alter table public.leads drop constraint if exists leads_consent_required;
alter table public.leads add constraint leads_consent_required check (
  marketing_opt_in
  or (first_name is null and last_name is null and email is null and phone is null)
);

-- RLS ON, and deliberately NO policies.
--
-- The Supabase anon key ships to the browser, so any table without RLS is
-- world-readable. With RLS enabled and no policy, anon and authenticated roles
-- can do nothing at all. The service-role key used by the API route bypasses
-- RLS, which is exactly the split we want: server writes, client gets nothing.
alter table public.leads enable row level security;

-- Aggregate reporting with no contact columns. This is what any future
-- dealer-facing dashboard should read, never the base table.
create or replace view public.lead_stats as
select
  dealer_name,
  boat_slug,
  boat_make,
  boat_model,
  show_day,
  daypart,
  source,
  count(*)                                          as leads,
  count(*) filter (where delivered)                 as delivered,
  count(distinct contact_hash)                      as unique_shoppers,
  min(created_at)                                   as first_lead,
  max(created_at)                                   as latest_lead
from public.leads
group by dealer_name, boat_slug, boat_make, boat_model, show_day, daypart, source;
