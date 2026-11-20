-- One SELECT policy per role: public reading works without private helpers.
drop policy lessons_read_public on public.content_lessons;
drop policy lessons_read_member on public.content_lessons;
create policy lessons_read_public on public.content_lessons for select to anon
using(status='published');
create policy lessons_read_member on public.content_lessons for select to authenticated
using(status='published' or private.admin_mfa()
  or (author_id=(select auth.uid()) and private.is_active_user()));
