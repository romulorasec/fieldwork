-- The private helper intentionally has no EXECUTE grant for anon.
-- Evaluate the anonymous branch first so unauthenticated reads return zero
-- rows without invoking a function they cannot call.
alter policy member_only_legacy_lessons on public.content_lessons
  using(case when (select auth.uid()) is null then false else private.is_active_user() end);
alter policy member_only_niche_criteria on public.audit_criteria
  using(case when (select auth.uid()) is null then false else private.is_active_user() end);
