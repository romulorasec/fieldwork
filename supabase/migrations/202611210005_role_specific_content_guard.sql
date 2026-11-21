-- The authenticated role may call private.is_active_user(); anon deliberately
-- cannot. Use distinct restrictive policies to avoid permission errors.
alter policy member_only_legacy_lessons on public.content_lessons
  to authenticated using(private.is_active_user());
alter policy member_only_niche_criteria on public.audit_criteria
  to authenticated using(private.is_active_user());

create policy reject_anon_legacy_lessons on public.content_lessons
  as restrictive for select to anon using(false);
create policy reject_anon_niche_criteria on public.audit_criteria
  as restrictive for select to anon using(false);
