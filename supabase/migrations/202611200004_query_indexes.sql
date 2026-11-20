-- Target the real workspace, owner and relationship lookups used by the CRM.
-- Avoid unnecessary broad text indexes until query volume justifies them.
create index admin_log_workspace_idx on public.admin_audit_log(workspace_id,created_at desc);
create index admin_log_actor_idx on public.admin_audit_log(actor_id);
create index findings_audit_idx on public.audit_findings(audit_id);
create index audits_workspace_idx on public.audits(workspace_id,updated_at desc);
create index audits_prospect_idx on public.audits(prospect_id);
create index lessons_author_idx on public.content_lessons(author_id,status);
create index evidence_audit_idx on public.evidence_assets(audit_id);
create index evidence_owner_idx on public.evidence_assets(owner_id);
create index offers_workspace_idx on public.offer_templates(workspace_id);
create index pipeline_prospect_idx on public.pipeline_events(prospect_id,created_at desc);
create index pipeline_actor_idx on public.pipeline_events(actor_id);
create index proposals_prospect_idx on public.proposals(prospect_id,created_at desc);
create index proposals_audit_idx on public.proposals(audit_id);
create index proposals_owner_idx on public.proposals(owner_id);
create index assignments_created_by_idx on public.prospect_assignments(assigned_by);
create index tasks_workspace_idx on public.tasks(workspace_id,status);
create index tasks_owner_idx on public.tasks(owner_id,status,created_at desc);
create index tasks_prospect_idx on public.tasks(prospect_id);
create index criteria_niche_active_idx on public.audit_criteria(niche,active);
