-- sql/rls/200_catalogs.sql
alter table administradoras enable row level security;
drop policy if exists "administradoras_all" on administradoras;
create policy "administradoras_all"
on administradoras for all
using (org_id = app_auth_org_id())
with check (org_id = app_auth_org_id());

-- Repita o mesmo bloco para: grupos, assembleias, cotas, lances, pagamentos, contemplacoes, contratos, propostas (se não dependente de leads), etc.
