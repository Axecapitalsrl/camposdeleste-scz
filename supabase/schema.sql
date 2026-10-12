-- Campos del Este - landing leads
-- Execute in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 40),
  payment_method text not null,
  initial_budget text not null,
  monthly_budget text not null,
  purpose text not null,
  knows_zone text not null,
  purchase_timing text not null,
  visit_availability text not null,
  preferred_years text not null,
  consent boolean not null default false check (consent = true),
  source text not null default 'landing-campos-del-este-fase-iii',
  status text not null default 'nuevo' check (status in ('nuevo','contactado','cita_agendada','seguimiento','descartado'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

alter table public.leads enable row level security;

-- Deliberately no public select/insert/update/delete policies.
-- Inserts are made by the server route with SUPABASE_SERVICE_ROLE_KEY.
-- Never expose the service role key to the browser or commit it to GitHub.
