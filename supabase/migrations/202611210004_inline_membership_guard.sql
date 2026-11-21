-- PostgreSQL validates EXECUTE permission for all functions in a policy even
-- when CASE would skip a branch. Inline this narrow membership test so anon
-- cannot invoke private helpers and instead sees zero rows.
alter policy member_only_legacy_lessons on public.content_lessons
  using(exists(
    select 1 from public.memberships m
    where m.user_id=(select auth.uid()) and m.status='active'
      and (m.role<>'admin' or (select auth.jwt()->>'aal')='aal2')
  ));
alter policy member_only_niche_criteria on public.audit_criteria
  using(exists(
    select 1 from public.memberships m
    where m.user_id=(select auth.uid()) and m.status='active'
      and (m.role<>'admin' or (select auth.jwt()->>'aal')='aal2')
  ));
