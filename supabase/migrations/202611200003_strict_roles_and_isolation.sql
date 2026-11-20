-- Restrict tenant-wide privileges to the administrator of the same workspace.
-- A suspended user or administrator without AAL2 cannot bypass role rules.
create function private.admin_in_workspace(target_workspace uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select (select auth.jwt()->>'aal')='aal2' and exists(select 1 from public.memberships m
    where m.user_id=(select auth.uid()) and m.workspace_id=target_workspace
      and m.status='active' and m.role='admin');
$$;
revoke all on function private.admin_in_workspace(uuid) from public;
grant execute on function private.admin_in_workspace(uuid) to authenticated;

create or replace function private.is_member(target_workspace uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.memberships m
    where m.user_id=(select auth.uid()) and m.workspace_id=target_workspace
      and m.status='active' and (m.role<>'admin' or (select auth.jwt()->>'aal')='aal2'));
$$;

create or replace function private.is_active_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.memberships m
    where m.user_id=(select auth.uid()) and m.status='active'
      and (m.role<>'admin' or (select auth.jwt()->>'aal')='aal2'));
$$;

create or replace function private.can_view_prospect(target_prospect uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.prospects p where p.id=target_prospect
    and private.is_member(p.workspace_id)
    and ( private.admin_in_workspace(p.workspace_id)
       or p.owner_id=(select auth.uid())
       or exists(select 1 from public.prospect_assignments x where x.prospect_id=p.id and x.user_id=(select auth.uid()))));
$$;

create or replace function private.can_view_audit(target_audit uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.audits a where a.id=target_audit
    and private.is_member(a.workspace_id)
    and ( private.admin_in_workspace(a.workspace_id)
       or a.owner_id=(select auth.uid())
       or (a.prospect_id is not null and private.can_view_prospect(a.prospect_id))));
$$;

drop policy profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
using(id=(select auth.uid()) or exists(
  select 1 from public.memberships target where target.user_id=profiles.id
    and private.admin_in_workspace(target.workspace_id)));

drop policy memberships_read on public.memberships;
create policy memberships_read on public.memberships for select to authenticated
using(user_id=(select auth.uid()) or private.admin_in_workspace(workspace_id));

drop policy prospects_insert on public.prospects;
create policy prospects_insert on public.prospects for insert to authenticated
with check(owner_id=(select auth.uid()) and private.is_member(workspace_id)
  and exists(select 1 from public.memberships m where m.user_id=(select auth.uid())
    and m.workspace_id=prospects.workspace_id and m.status='active' and m.role in ('admin','sales')));
drop policy prospects_update on public.prospects;
create policy prospects_update on public.prospects for update to authenticated
using(private.can_view_prospect(id) and (private.admin_in_workspace(workspace_id) or owner_id=(select auth.uid()))
  and exists(select 1 from public.memberships m where m.user_id=(select auth.uid())
    and m.workspace_id=prospects.workspace_id and m.status='active' and m.role in ('admin','sales')))
with check(private.is_member(workspace_id) and (private.admin_in_workspace(workspace_id) or owner_id=(select auth.uid()))
  and exists(select 1 from public.memberships m where m.user_id=(select auth.uid())
    and m.workspace_id=prospects.workspace_id and m.status='active' and m.role in ('admin','sales')));

drop policy audits_insert on public.audits;
create policy audits_insert on public.audits for insert to authenticated
with check(owner_id=(select auth.uid()) and private.is_member(workspace_id)
  and exists(select 1 from public.memberships m where m.user_id=(select auth.uid())
    and m.workspace_id=audits.workspace_id and m.status='active' and m.role in ('admin','sales','learner')));
drop policy audits_update on public.audits;
create policy audits_update on public.audits for update to authenticated
using(owner_id=(select auth.uid()) and private.is_member(workspace_id)
  and exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.workspace_id=audits.workspace_id
    and m.status='active' and m.role in ('admin','sales','learner')))
with check(owner_id=(select auth.uid()) and private.is_member(workspace_id)
  and exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.workspace_id=audits.workspace_id
    and m.status='active' and m.role in ('admin','sales','learner')));

drop policy pipeline_insert on public.pipeline_events;
create policy pipeline_insert on public.pipeline_events for insert to authenticated
with check(actor_id=(select auth.uid()) and exists(select 1 from public.prospects p
  join public.memberships m on m.workspace_id=p.workspace_id and m.user_id=(select auth.uid())
  where p.id=prospect_id and p.owner_id=(select auth.uid()) and m.status='active' and m.role in ('admin','sales')
    and private.is_member(p.workspace_id)));

drop policy tasks_own on public.tasks;
create policy tasks_own on public.tasks for all to authenticated
using(owner_id=(select auth.uid()) and private.is_member(workspace_id))
with check(owner_id=(select auth.uid()) and private.is_member(workspace_id));

drop policy proposals_insert on public.proposals;
create policy proposals_insert on public.proposals for insert to authenticated
with check(owner_id=(select auth.uid()) and private.can_view_prospect(prospect_id)
  and exists(select 1 from public.prospects p join public.memberships m on m.workspace_id=p.workspace_id
    where p.id=prospect_id and m.user_id=(select auth.uid()) and m.status='active' and m.role in ('admin','sales')));

alter table public.admin_audit_log add column workspace_id uuid references public.workspaces(id);
drop policy logs_admin on public.admin_audit_log;
create policy logs_admin on public.admin_audit_log for select to authenticated
using(private.admin_mfa() and private.is_member(workspace_id));

drop policy fieldwork_storage_read on storage.objects;
create policy fieldwork_storage_read on storage.objects for select to authenticated
using(bucket_id='fieldwork-evidence' and (
  (name like (select auth.uid())::text || '/%' and private.is_active_user())
  or (private.admin_mfa() and exists (
    select 1 from public.evidence_assets e join public.audits a on a.id=e.audit_id
    where e.storage_path=storage.objects.name and private.is_member(a.workspace_id)
  ))));
