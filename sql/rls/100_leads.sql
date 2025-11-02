-- sql/rls/100_leads.sql

alter table leads enable row level security;

-- READ: gestor vê tudo da org; vendedor vê só carteira (owner_id = uid)
drop policy if exists "leads_read" on leads;
create policy "leads_read"
on leads for select
using (
  org_id = app_auth_org_id()
  and (
    app_is_manager()
    or owner_id = app_uid()
    or app_role() = 'viewer'   -- viewer enxerga (read-only). Se NÃO quiser, remova esta linha.
  )
);

-- INSERT: gestor pode inserir qualquer lead da org; vendedor só se owner_id = uid
drop policy if exists "leads_insert" on leads;
create policy "leads_insert"
on leads for insert
with check (
  org_id = app_auth_org_id()
  and (
    app_is_manager()
    or (app_role() = 'vendedor' and owner_id = app_uid())
  )
);

-- UPDATE: gestor atualiza qualquer lead da org; vendedor só os próprios
drop policy if exists "leads_update" on leads;
create policy "leads_update"
on leads for update
using (
  org_id = app_auth_org_id()
  and (
    app_is_manager()
    or (app_role() = 'vendedor' and owner_id = app_uid())
  )
)
with check (
  org_id = app_auth_org_id()
  and (
    app_is_manager()
    or (app_role() = 'vendedor' and owner_id = app_uid())
  )
);

-- DELETE: só owner/admin (se desejar)
drop policy if exists "leads_delete" on leads;
create policy "leads_delete"
on leads for delete
using (
  org_id = app_auth_org_id()
  and app_role() in ('owner','admin')
);
