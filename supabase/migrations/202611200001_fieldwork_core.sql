-- Fieldwork: tenant isolation, administrative provisioning, audits, CRM and learning.
-- Apply only after creating the project. Initial administrator is provisioned manually.
create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

create type public.fieldwork_role as enum ('admin','sales','contributor','reviewer','partner','learner');
create type public.member_status as enum ('active','suspended');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
create table public.memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.fieldwork_role not null default 'learner',
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  primary key(workspace_id,user_id)
);
create index memberships_user_idx on public.memberships(user_id,status);

create function private.is_active_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.status='active');
$$;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid()) and m.role = 'admin' and m.status = 'active'
  );
$$;
create function private.admin_mfa() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_admin() and (select auth.jwt()->>'aal') = 'aal2';
$$;
create function private.is_member(target_workspace uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.admin_mfa() or exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid()) and m.workspace_id = target_workspace and m.status = 'active'
  );
$$;

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references public.profiles(id),
  name text not null,
  niche text not null default '',
  website text not null default '',
  source text not null default 'Direto',
  stage text not null default 'Prospect',
  lead_type text not null default 'Auditoria/correção',
  status text not null default 'active',
  contact text not null default '',
  next_action text not null default '',
  next_at timestamptz,
  note text not null default '',
  estimated_value numeric(12,2) not null default 0,
  deposit_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index prospects_owner_idx on public.prospects(owner_id,updated_at desc);
create index prospects_workspace_idx on public.prospects(workspace_id,stage);

create table public.prospect_assignments (
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key(prospect_id,user_id)
);
create index prospect_assignments_user_idx on public.prospect_assignments(user_id);
create function private.can_view_prospect(target_prospect uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.admin_mfa() or exists (
    select 1 from public.prospects p
    where p.id = target_prospect and
      ((p.owner_id = (select auth.uid()) and private.is_member(p.workspace_id)) or exists (
        select 1 from public.prospect_assignments x
        join public.memberships m on m.user_id = x.user_id and m.workspace_id = p.workspace_id
        where x.prospect_id = p.id and x.user_id = (select auth.uid()) and m.status = 'active'
      ))
  );
$$;

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references public.profiles(id),
  prospect_id uuid references public.prospects(id) on delete set null,
  company text not null,
  website text not null,
  niche text not null,
  device text not null check(device in ('mobile','desktop')),
  mode text not null check(mode in ('quick','full')),
  proof_url text not null default '',
  answers jsonb not null default '{}'::jsonb,
  criterion_version integer not null default 1,
  observation text not null default '',
  recommendation text not null default '',
  next_action text not null default '',
  state text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index audits_owner_idx on public.audits(owner_id,updated_at desc);
create table public.audit_findings (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  criterion_id text not null,
  observation text not null,
  evidence_level text not null default 'hypothesis' check(evidence_level in ('hypothesis','observed','reproduced','measured','validated')),
  impact_hypothesis text not null default '',
  proposed_fix text not null default '',
  test_method text not null default '',
  created_at timestamptz not null default now()
);
create function private.can_view_audit(target_audit uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.admin_mfa() or exists (
    select 1 from public.audits a where a.id = target_audit
      and ((a.owner_id = (select auth.uid()) and private.is_member(a.workspace_id)) or (a.prospect_id is not null and private.can_view_prospect(a.prospect_id)))
  );
$$;

create table public.evidence_assets (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  owner_id uuid not null references public.profiles(id),
  storage_path text not null unique,
  content_type text not null,
  original_name text not null default '',
  created_at timestamptz not null default now()
);
create table public.learning_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_key text not null,
  evidence text not null default '',
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key(user_id,lesson_key)
);
create table public.user_snapshots (
  user_id uuid not null references public.profiles(id) on delete cascade,
  snapshot_key text not null check(snapshot_key in ('fieldwork-10x30-v1','fieldwork-audits-v2','fieldwork-pratica-v2')),
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key(user_id,snapshot_key)
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references public.profiles(id),
  prospect_id uuid references public.prospects(id) on delete set null,
  title text not null,
  why text not null default '',
  how_to text not null default '',
  status text not null default 'todo' check(status in ('todo','doing','blocked','done','discarded')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.pipeline_events (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  actor_id uuid not null references public.profiles(id),
  from_stage text,
  to_stage text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
create table public.offer_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  minimum_price numeric(12,2),
  currency text not null default 'USD',
  scope jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  audit_id uuid references public.audits(id) on delete set null,
  owner_id uuid not null references public.profiles(id),
  title text not null,
  scope text not null default '',
  price numeric(12,2),
  currency text not null default 'USD',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.content_lessons (
  id uuid primary key default gen_random_uuid(),
  lesson_key text not null unique,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  author_id uuid references public.profiles(id),
  status text not null default 'draft' check(status in ('draft','review','published')),
  version integer not null default 1,
  updated_at timestamptz not null default now()
);
create table public.audit_criteria (
  id uuid primary key default gen_random_uuid(),
  niche text not null,
  criterion_key text not null,
  content jsonb not null,
  version integer not null default 1,
  active boolean not null default true,
  unique(niche,criterion_key,version)
);
create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Every API-exposed table is RLS-protected. No user may alter a membership.
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.memberships enable row level security;
alter table public.prospects enable row level security;
alter table public.prospect_assignments enable row level security;
alter table public.audits enable row level security;
alter table public.audit_findings enable row level security;
alter table public.evidence_assets enable row level security;
alter table public.learning_progress enable row level security;
alter table public.user_snapshots enable row level security;
alter table public.tasks enable row level security;
alter table public.pipeline_events enable row level security;
alter table public.offer_templates enable row level security;
alter table public.proposals enable row level security;
alter table public.content_lessons enable row level security;
alter table public.audit_criteria enable row level security;
alter table public.admin_audit_log enable row level security;

create policy profiles_read on public.profiles for select to authenticated using(id = (select auth.uid()) or private.admin_mfa());
create policy profiles_edit on public.profiles for update to authenticated using(id = (select auth.uid())) with check(id = (select auth.uid()));
create policy workspaces_read on public.workspaces for select to authenticated using(private.is_member(id));
create policy memberships_read on public.memberships for select to authenticated using(user_id = (select auth.uid()) or private.admin_mfa());
create policy prospects_read on public.prospects for select to authenticated using(private.can_view_prospect(id));
create policy prospects_insert on public.prospects for insert to authenticated with check(owner_id=(select auth.uid()) and (private.admin_mfa() or exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.workspace_id=prospects.workspace_id and m.status='active' and m.role='sales')));
create policy prospects_update on public.prospects for update to authenticated using((owner_id=(select auth.uid()) and private.is_member(workspace_id)) or private.admin_mfa()) with check((owner_id=(select auth.uid()) and private.is_member(workspace_id)) or private.admin_mfa());
create policy prospect_assignments_read on public.prospect_assignments for select to authenticated using(user_id=(select auth.uid()) or private.can_view_prospect(prospect_id));
create policy audits_read on public.audits for select to authenticated using(private.can_view_audit(id));
create policy audits_insert on public.audits for insert to authenticated with check(owner_id=(select auth.uid()) and private.is_member(workspace_id));
create policy audits_update on public.audits for update to authenticated using(owner_id=(select auth.uid()) and private.is_member(workspace_id)) with check(owner_id=(select auth.uid()) and private.is_member(workspace_id));
create policy findings_read on public.audit_findings for select to authenticated using(private.can_view_audit(audit_id));
create policy findings_insert on public.audit_findings for insert to authenticated with check(exists(select 1 from public.audits a where a.id=audit_id and a.owner_id=(select auth.uid()) and private.is_member(a.workspace_id)));
create policy findings_update on public.audit_findings for update to authenticated using(exists(select 1 from public.audits a where a.id=audit_id and a.owner_id=(select auth.uid()) and private.is_member(a.workspace_id))) with check(exists(select 1 from public.audits a where a.id=audit_id and a.owner_id=(select auth.uid()) and private.is_member(a.workspace_id)));
create policy evidence_read on public.evidence_assets for select to authenticated using(private.can_view_audit(audit_id));
create policy evidence_insert on public.evidence_assets for insert to authenticated with check(owner_id=(select auth.uid()) and exists(select 1 from public.audits a where a.id=audit_id and a.owner_id=(select auth.uid()) and private.is_member(a.workspace_id)));
create policy progress_own on public.learning_progress for all to authenticated using(user_id=(select auth.uid()) and private.is_active_user()) with check(user_id=(select auth.uid()) and private.is_active_user());
create policy snapshots_own on public.user_snapshots for all to authenticated using(user_id=(select auth.uid()) and private.is_active_user()) with check(user_id=(select auth.uid()) and private.is_active_user());
create policy tasks_own on public.tasks for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()) and private.is_member(workspace_id));
create policy pipeline_read on public.pipeline_events for select to authenticated using(private.can_view_prospect(prospect_id));
create policy pipeline_insert on public.pipeline_events for insert to authenticated with check(actor_id=(select auth.uid()) and private.can_view_prospect(prospect_id));
create policy offers_read on public.offer_templates for select to authenticated using(private.is_member(workspace_id));
create policy proposals_read on public.proposals for select to authenticated using(private.can_view_prospect(prospect_id));
create policy proposals_insert on public.proposals for insert to authenticated with check(owner_id=(select auth.uid()) and private.can_view_prospect(prospect_id) and private.is_active_user());
create policy proposals_update on public.proposals for update to authenticated using(owner_id=(select auth.uid()) and private.is_active_user()) with check(owner_id=(select auth.uid()) and private.is_active_user());
create policy lessons_read on public.content_lessons for select to anon,authenticated using(status='published' or private.admin_mfa() or (author_id=(select auth.uid()) and private.is_active_user()));
create policy lessons_draft on public.content_lessons for insert to authenticated with check(status='draft' and author_id=(select auth.uid()) and exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.status='active' and m.role='contributor'));
create policy lessons_edit_draft on public.content_lessons for update to authenticated using(status='draft' and author_id=(select auth.uid()) and private.is_active_user()) with check(status='draft' and author_id=(select auth.uid()) and private.is_active_user());
create policy criteria_read on public.audit_criteria for select to anon,authenticated using(active=true);
create policy logs_admin on public.admin_audit_log for select to authenticated using(private.admin_mfa());

-- Memberships, roles, content publication, template editing and user creation
-- are performed exclusively via privileged server operations, never client writes.
revoke all on public.memberships,public.prospect_assignments,public.admin_audit_log from anon,authenticated;
grant select on public.memberships,public.prospect_assignments,public.admin_audit_log to authenticated;
revoke update on public.profiles from authenticated;
grant update(full_name) on public.profiles to authenticated;
revoke insert,update,delete on public.audit_criteria,public.offer_templates from anon,authenticated;
grant select on public.audit_criteria to anon,authenticated;
grant select on public.offer_templates to authenticated;
grant usage on schema private to authenticated;
revoke all on function private.is_active_user(), private.is_admin(), private.admin_mfa(), private.is_member(uuid), private.can_view_prospect(uuid), private.can_view_audit(uuid) from public;
grant execute on function private.is_active_user(), private.is_admin(), private.admin_mfa(), private.is_member(uuid), private.can_view_prospect(uuid), private.can_view_audit(uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('fieldwork-evidence','fieldwork-evidence',false,52428800,array['image/jpeg','image/png','image/webp','application/pdf','video/mp4'])
on conflict(id) do nothing;
create policy fieldwork_storage_read on storage.objects for select to authenticated
using(bucket_id='fieldwork-evidence' and (name like (select auth.uid())::text || '/%' or private.is_admin()));
create policy fieldwork_storage_insert on storage.objects for insert to authenticated
with check(bucket_id='fieldwork-evidence' and private.is_active_user() and name like (select auth.uid())::text || '/%');

create function public.handle_fieldwork_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,full_name)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict(id) do nothing;
  return new;
end;
$$;
create trigger on_fieldwork_user_created after insert on auth.users
for each row execute function public.handle_fieldwork_user();

-- The only initial bootstrap is administrative: create the first user with Auth Admin,
-- create a workspace and insert one membership(role='admin') in the SQL Editor.
-- Never expose a browser endpoint that can grant the first admin role.
