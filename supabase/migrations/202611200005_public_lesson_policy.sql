-- Anonymous readers must not execute privileged membership helper functions.
drop policy lessons_read on public.content_lessons;
create policy lessons_read_public on public.content_lessons for select to anon,authenticated
using(status='published');
create policy lessons_read_member on public.content_lessons for select to authenticated
using(private.admin_mfa() or (author_id=(select auth.uid()) and private.is_active_user()));
