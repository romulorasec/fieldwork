-- Fieldwork 2.0 - sprints (30-day outcome window) and per-prospect strategies.
-- This schema was first applied to the live Supabase project on 2026-11-22.
-- Retains the legacy plan_days, learning_progress and CRM data unchanged.
-- Reapplying is idempotent; new public tables have RLS and owner + workspace checks.
begin;

create table if not exists public.fieldwork_sprints (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id),
  started_at timestamptz not null default now(),
  deadline_at timestamptz not null default (now() + interval '30 days'),
  target_contracts integer not null default 10 check(target_contracts between 1 and 100),
  created_at timestamptz not null default now(),
  constraint fieldwork_sprint_deadline_after_start check (deadline_at > started_at)
);

create table if not exists public.fieldwork_strategies (
  prospect_id uuid primary key references public.prospects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id),
  data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(data) = 'object' and octet_length(data::text) < 75000),
  completed_missions text[] not null default '{}'::text[],
  updated_at timestamptz not null default now()
);

create index if not exists fieldwork_strategies_owner_idx
on public.fieldwork_strategies(owner_id,updated_at desc);

alter table public.fieldwork_sprints enable row level security;
alter table public.fieldwork_strategies enable row level security;

drop policy if exists fieldwork_sprint_member_read on public.fieldwork_sprints;
drop policy if exists fieldwork_sprint_member_insert on public.fieldwork_sprints;
drop policy if exists fieldwork_sprint_member_update on public.fieldwork_sprints;

create policy fieldwork_sprint_member_read on public.fieldwork_sprints
for select to authenticated
using (
  user_id = (select auth.uid()) and exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = workspace_id and m.status = 'active'
  )
);
create policy fieldwork_sprint_member_insert on public.fieldwork_sprints
for insert to authenticated
with check (
  user_id = (select auth.uid()) and exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = workspace_id and m.status = 'active'
  )
);
create policy fieldwork_sprint_member_update on public.fieldwork_sprints
for update to authenticated
using (
  user_id = (select auth.uid()) and exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = workspace_id and m.status = 'active'
  )
)
with check (
  user_id = (select auth.uid()) and exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = workspace_id and m.status = 'active'
  )
);

drop policy if exists fieldwork_strategy_member_read on public.fieldwork_strategies;
drop policy if exists fieldwork_strategy_member_insert on public.fieldwork_strategies;
drop policy if exists fieldwork_strategy_member_update on public.fieldwork_strategies;

create policy fieldwork_strategy_member_read on public.fieldwork_strategies
for select to authenticated
using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = workspace_id and m.status = 'active'
  )
);
create policy fieldwork_strategy_member_insert on public.fieldwork_strategies
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = workspace_id and m.status = 'active'
  )
  and exists (
    select 1 from public.prospects p
    where p.id = prospect_id
      and p.owner_id = (select auth.uid())
      and p.workspace_id = workspace_id
  )
);
create policy fieldwork_strategy_member_update on public.fieldwork_strategies
for update to authenticated
using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = workspace_id and m.status = 'active'
  )
)
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = workspace_id and m.status = 'active'
  )
  and exists (
    select 1 from public.prospects p
    where p.id = prospect_id
      and p.owner_id = (select auth.uid())
      and p.workspace_id = workspace_id
  )
);

revoke all on public.fieldwork_sprints from anon;
revoke all on public.fieldwork_strategies from anon;
grant select,insert,update on public.fieldwork_sprints to authenticated;
grant select,insert,update on public.fieldwork_strategies to authenticated;

commit;
