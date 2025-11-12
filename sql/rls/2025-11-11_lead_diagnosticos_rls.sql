-- 1) Função utilitária para extrair org_id do JWT
create schema if not exists auth;

create or replace function auth.org_id()
returns uuid
language sql
stable
as $$
select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'org_id'
$$;

-- 2) (Opcional) função para checar se é manager (pode ajustar para sua tabela de papéis)
create or replace function public.app_is_manager()
returns boolean
language sql
stable
as $$
select coalesce(
               (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role') = 'manager',
               false
       )
           $$;

-- 3) Habilitar RLS
alter table public.lead_diagnosticos enable row level security;

-- 4) Policies
drop policy if exists "lead_diag_select" on public.lead_diagnosticos;
create policy "lead_diag_select"
on public.lead_diagnosticos
for select
                    using (org_id::text = auth.org_id());

drop policy if exists "lead_diag_insert" on public.lead_diagnosticos;
create policy "lead_diag_insert"
on public.lead_diagnosticos
for insert
with check (org_id::text = auth.org_id());

drop policy if exists "lead_diag_update" on public.lead_diagnosticos;
create policy "lead_diag_update"
on public.lead_diagnosticos
for update
                                using (org_id::text = auth.org_id())
    with check (org_id::text = auth.org_id());

drop policy if exists "lead_diag_delete" on public.lead_diagnosticos;
create policy "lead_diag_delete"
on public.lead_diagnosticos
for delete
using (org_id::text = auth.org_id() and public.app_is_manager());
