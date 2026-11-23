-- Fieldwork 2.0: hotfix for INSERT ... RETURNING on prospects and strict tenant scoping.
-- Applied to Supabase production as the migration
-- fix_prospect_returning_and_strategy_workspace_rls on 2026-11-22.
-- Keep RLS enabled. Do not grant anonymous access.
--
-- Why: prospects_read previously called private.can_view_prospect(id), which
-- queried the table for a row not yet visible during INSERT RETURNING.
-- Explicit owner+membership visibility makes INSERT RETURNING work without
-- expanding access for existing rows or removing admin/assigned access.
drop policy if exists prospects_read on public.prospects;
create policy prospects_read on public.prospects
for select to authenticated
using (
  (owner_id=(select auth.uid()) and private.is_member(workspace_id))
  or private.can_view_prospect(id)
);

-- The previous sprint/strategy SQL had unqualified outer workspace_id names
-- inside correlated subqueries, accidentally comparing m.workspace_id to itself.
-- Refer directly to the target record's workspace via private.is_member().
drop policy if exists fieldwork_sprint_member_read on public.fieldwork_sprints;
drop policy if exists fieldwork_sprint_member_insert on public.fieldwork_sprints;
drop policy if exists fieldwork_sprint_member_update on public.fieldwork_sprints;
create policy fieldwork_sprint_member_read on public.fieldwork_sprints for select to authenticated
using (user_id=(select auth.uid()) and private.is_member(fieldwork_sprints.workspace_id));
create policy fieldwork_sprint_member_insert on public.fieldwork_sprints for insert to authenticated
with check (user_id=(select auth.uid()) and private.is_member(fieldwork_sprints.workspace_id));
create policy fieldwork_sprint_member_update on public.fieldwork_sprints for update to authenticated
using (user_id=(select auth.uid()) and private.is_member(fieldwork_sprints.workspace_id))
with check (user_id=(select auth.uid()) and private.is_member(fieldwork_sprints.workspace_id));

drop policy if exists fieldwork_strategy_member_read on public.fieldwork_strategies;
drop policy if exists fieldwork_strategy_member_insert on public.fieldwork_strategies;
drop policy if exists fieldwork_strategy_member_update on public.fieldwork_strategies;
create policy fieldwork_strategy_member_read on public.fieldwork_strategies for select to authenticated
using (owner_id=(select auth.uid()) and private.is_member(fieldwork_strategies.workspace_id));
create policy fieldwork_strategy_member_insert on public.fieldwork_strategies for insert to authenticated
with check (
  owner_id=(select auth.uid())
  and private.is_member(fieldwork_strategies.workspace_id)
  and exists (
    select 1 from public.prospects p
    where p.id=fieldwork_strategies.prospect_id
      and p.owner_id=(select auth.uid())
      and p.workspace_id=fieldwork_strategies.workspace_id
  )
);
create policy fieldwork_strategy_member_update on public.fieldwork_strategies for update to authenticated
using (owner_id=(select auth.uid()) and private.is_member(fieldwork_strategies.workspace_id))
with check (
  owner_id=(select auth.uid())
  and private.is_member(fieldwork_strategies.workspace_id)
  and exists (
    select 1 from public.prospects p
    where p.id=fieldwork_strategies.prospect_id
      and p.owner_id=(select auth.uid())
      and p.workspace_id=fieldwork_strategies.workspace_id
  )
);
