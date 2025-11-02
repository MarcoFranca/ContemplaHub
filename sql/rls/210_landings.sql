-- sql/rls/210_landings.sql
alter table landing_pages enable row level security;

drop policy if exists "landings_read" on landing_pages;
create policy "landings_read"
on landing_pages for select
using (org_id = app_auth_org_id() and app_is_manager());

drop policy if exists "landings_write" on landing_pages;
create policy "landings_write"
on landing_pages for all
using (
  org_id = app_auth_org_id()
  and (app_is_manager() or owner_user_id = app_uid())
)
with check (
  org_id = app_auth_org_id()
  and (app_is_manager() or owner_user_id = app_uid())
);
