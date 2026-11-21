-- Password authentication and an active membership are sufficient to enter
-- the Fieldwork workspace. Admin-only operations still require an active
-- admin membership, and tenant authorization remains workspace-scoped.
-- Keep the legacy helper name for compatibility with existing RLS policies.
create or replace function private.admin_mfa() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_admin();
$$;

create or replace function private.is_active_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.memberships m
    where m.user_id=(select auth.uid()) and m.status='active');
$$;

create or replace function private.is_member(target_workspace uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.memberships m
    where m.user_id=(select auth.uid()) and m.workspace_id=target_workspace
      and m.status='active');
$$;

create or replace function private.admin_in_workspace(target_workspace uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.memberships m
    where m.user_id=(select auth.uid()) and m.workspace_id=target_workspace
      and m.status='active' and m.role='admin');
$$;
