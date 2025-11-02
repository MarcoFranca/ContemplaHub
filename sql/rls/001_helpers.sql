-- sql/rls/001_helpers.sql

-- Id da org do usuário atual
create or replace function app_auth_org_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select p.org_id
  from profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

-- Papel do usuário (owner/admin/gestor/vendedor/viewer)
create or replace function app_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select coalesce(p.role, 'viewer')
  from profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

-- É manager? (inclui owner/admin/gestor)
create or replace function app_is_manager()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select app_role() in ('owner','admin','gestor')
$$;

-- UID “safe”
create or replace function app_uid()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select auth.uid()
$$;

-- (Opcional) Pode gerenciar a org informada?
create or replace function can_manage_org(target_org uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select app_is_manager() and target_org = app_auth_org_id()
$$;
