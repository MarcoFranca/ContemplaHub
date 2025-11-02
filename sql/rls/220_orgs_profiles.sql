-- sql/rls/220_orgs_profiles.sql
alter table orgs enable row level security;
drop policy if exists "orgs_read" on orgs;
create policy "orgs_read"
on orgs for select
using (id = app_auth_org_id() and app_is_manager());

alter table profiles enable row level security;
drop policy if exists "profiles_read_self" on profiles;
create policy "profiles_read_self"
on profiles for select
using (user_id = app_uid());

drop policy if exists "profiles_read_org" on profiles;
create policy "profiles_read_org"
on profiles for select
using (org_id = app_auth_org_id() and app_is_manager());

drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self"
on profiles for update
using (user_id = app_uid())
with check (user_id = app_uid());

drop policy if exists "profiles_manage" on profiles;
create policy "profiles_manage"
on profiles for all
using (can_manage_org(org_id))
with check (can_manage_org(org_id));
