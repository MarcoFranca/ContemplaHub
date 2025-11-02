-- sql/rls/230_audit.sql
alter table audit_logs enable row level security;
drop policy if exists "audit_read" on audit_logs;
create policy "audit_read"
on audit_logs for select
using (org_id = app_auth_org_id() and app_is_manager());
