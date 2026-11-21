-- The product has one public marketing page. Its library is a separate,
-- new table with RLS and no anonymous access. The original content_lessons
-- table is left untouched and empty to avoid destructive permission changes.
create table public.member_lessons (
  lesson_key text primary key,
  module_key text not null,
  module_title text not null,
  title text not null,
  section_order smallint not null,
  content jsonb not null,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
create index member_lessons_group_idx on public.member_lessons(module_key,section_order);
alter table public.member_lessons enable row level security;
create policy lesson_member_read on public.member_lessons for select to authenticated
using(published and private.is_active_user());
grant select on public.member_lessons to authenticated;

create table public.plan_days (
  day smallint primary key check(day between 1 and 30),
  title text not null,
  phase text not null,
  tasks jsonb not null check(jsonb_typeof(tasks)='array'),
  result text not null,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.plan_days enable row level security;
create policy plan_read_member on public.plan_days for select to authenticated
using(published and private.is_active_user());
grant select on public.plan_days to authenticated;

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check(length(trim(full_name)) between 2 and 120),
  email text not null check(length(email) between 5 and 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  intent text not null default 'web-designer' check(intent in ('web-designer','agency','partner','other')),
  status text not null default 'new' check(status in ('new','invited','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index access_requests_email_new_idx on public.access_requests(lower(email)) where status='new';
create index access_requests_status_date_idx on public.access_requests(status,created_at desc);
alter table public.access_requests enable row level security;
create policy request_submit_anon on public.access_requests for insert to anon
with check(status='new' and length(trim(full_name)) between 2 and 120 and intent in ('web-designer','agency','partner','other'));
create policy request_read_admin on public.access_requests for select to authenticated
using(private.admin_mfa());
grant insert(full_name,email,intent) on public.access_requests to anon;
grant select on public.access_requests to authenticated;
-- No public SELECT, UPDATE or DELETE. Only the existing privileged admin
-- function may act on a request and provision accounts.
