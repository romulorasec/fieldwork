-- Keep legacy content tables private as well. Restrictive policies combine
-- with existing permissive policies without deleting them or modifying data.
create policy member_only_legacy_lessons on public.content_lessons
  as restrictive for select to anon,authenticated
  using(private.is_active_user());

create policy member_only_niche_criteria on public.audit_criteria
  as restrictive for select to anon,authenticated
  using(private.is_active_user());
