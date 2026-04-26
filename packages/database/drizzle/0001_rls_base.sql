-- Função helper (org do usuário atual)
create or replace function auth_org_id() returns uuid
    language sql stable as $$
select org_id from public.profiles where user_id = auth.uid()
$$;

-- Habilitar RLS em todas as tabelas com org_id
alter table public.profiles         enable row level security;
alter table public.leads            enable row level security;
alter table public.activities       enable row level security;
alter table public.deals            enable row level security;
alter table public.propostas        enable row level security;
alter table public.administradoras  enable row level security;
alter table public.grupos           enable row level security;
alter table public.assembleias      enable row level security;
alter table public.cotas            enable row level security;
alter table public.lances           enable row level security;
alter table public.contemplacoes    enable row level security;
alter table public.contratos        enable row level security;
alter table public.pagamentos       enable row level security;

-- ===================== PROFILES =====================
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
    for select using (user_id = auth.uid());

-- (Opcional) permitir update do próprio perfil:
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ===================== LEADS =====================
drop policy if exists "leads org read" on public.leads;
create policy "leads org read" on public.leads
    for select using (org_id = auth_org_id());

drop policy if exists "leads org insert" on public.leads;
create policy "leads org insert" on public.leads
    for insert with check (org_id = auth_org_id());

drop policy if exists "leads org update" on public.leads;
create policy "leads org update" on public.leads
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "leads org delete" on public.leads;
create policy "leads org delete" on public.leads
    for delete using (org_id = auth_org_id());

-- ===================== ACTIVITIES =====================
drop policy if exists "activities org read" on public.activities;
create policy "activities org read" on public.activities
    for select using (org_id = auth_org_id());

drop policy if exists "activities org insert" on public.activities;
create policy "activities org insert" on public.activities
    for insert with check (org_id = auth_org_id());

drop policy if exists "activities org update" on public.activities;
create policy "activities org update" on public.activities
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "activities org delete" on public.activities;
create policy "activities org delete" on public.activities
    for delete using (org_id = auth_org_id());

-- ===================== DEALS =====================
drop policy if exists "deals org read" on public.deals;
create policy "deals org read" on public.deals
    for select using (org_id = auth_org_id());

drop policy if exists "deals org insert" on public.deals;
create policy "deals org insert" on public.deals
    for insert with check (org_id = auth_org_id());

drop policy if exists "deals org update" on public.deals;
create policy "deals org update" on public.deals
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "deals org delete" on public.deals;
create policy "deals org delete" on public.deals
    for delete using (org_id = auth_org_id());

-- ===================== PROPOSTAS =====================
drop policy if exists "propostas org read" on public.propostas;
create policy "propostas org read" on public.propostas
    for select using (org_id = auth_org_id());

drop policy if exists "propostas org insert" on public.propostas;
create policy "propostas org insert" on public.propostas
    for insert with check (org_id = auth_org_id());

drop policy if exists "propostas org update" on public.propostas;
create policy "propostas org update" on public.propostas
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "propostas org delete" on public.propostas;
create policy "propostas org delete" on public.propostas
    for delete using (org_id = auth_org_id());

-- ===================== ADMINISTRADORAS =====================
drop policy if exists "administradoras org read" on public.administradoras;
create policy "administradoras org read" on public.administradoras
    for select using (org_id = auth_org_id());

drop policy if exists "administradoras org insert" on public.administradoras;
create policy "administradoras org insert" on public.administradoras
    for insert with check (org_id = auth_org_id());

drop policy if exists "administradoras org update" on public.administradoras;
create policy "administradoras org update" on public.administradoras
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "administradoras org delete" on public.administradoras;
create policy "administradoras org delete" on public.administradoras
    for delete using (org_id = auth_org_id());

-- ===================== GRUPOS =====================
drop policy if exists "grupos org read" on public.grupos;
create policy "grupos org read" on public.grupos
    for select using (org_id = auth_org_id());

drop policy if exists "grupos org insert" on public.grupos;
create policy "grupos org insert" on public.grupos
    for insert with check (org_id = auth_org_id());

drop policy if exists "grupos org update" on public.grupos;
create policy "grupos org update" on public.grupos
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "grupos org delete" on public.grupos;
create policy "grupos org delete" on public.grupos
    for delete using (org_id = auth_org_id());

-- ===================== ASSEMBLEIAS =====================
drop policy if exists "assembleias org read" on public.assembleias;
create policy "assembleias org read" on public.assembleias
    for select using (org_id = auth_org_id());

drop policy if exists "assembleias org insert" on public.assembleias;
create policy "assembleias org insert" on public.assembleias
    for insert with check (org_id = auth_org_id());

drop policy if exists "assembleias org update" on public.assembleias;
create policy "assembleias org update" on public.assembleias
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "assembleias org delete" on public.assembleias;
create policy "assembleias org delete" on public.assembleias
    for delete using (org_id = auth_org_id());

-- ===================== COTAS =====================
drop policy if exists "cotas org read" on public.cotas;
create policy "cotas org read" on public.cotas
    for select using (org_id = auth_org_id());

drop policy if exists "cotas org insert" on public.cotas;
create policy "cotas org insert" on public.cotas
    for insert with check (org_id = auth_org_id());

drop policy if exists "cotas org update" on public.cotas;
create policy "cotas org update" on public.cotas
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "cotas org delete" on public.cotas;
create policy "cotas org delete" on public.cotas
    for delete using (org_id = auth_org_id());

-- ===================== LANCES =====================
drop policy if exists "lances org read" on public.lances;
create policy "lances org read" on public.lances
    for select using (org_id = auth_org_id());

drop policy if exists "lances org insert" on public.lances;
create policy "lances org insert" on public.lances
    for insert with check (org_id = auth_org_id());

drop policy if exists "lances org update" on public.lances;
create policy "lances org update" on public.lances
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "lances org delete" on public.lances;
create policy "lances org delete" on public.lances
    for delete using (org_id = auth_org_id());

-- ===================== CONTEMPLACOES =====================
drop policy if exists "contemplacoes org read" on public.contemplacoes;
create policy "contemplacoes org read" on public.contemplacoes
    for select using (org_id = auth_org_id());

drop policy if exists "contemplacoes org insert" on public.contemplacoes;
create policy "contemplacoes org insert" on public.contemplacoes
    for insert with check (org_id = auth_org_id());

drop policy if exists "contemplacoes org update" on public.contemplacoes;
create policy "contemplacoes org update" on public.contemplacoes
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "contemplacoes org delete" on public.contemplacoes;
create policy "contemplacoes org delete" on public.contemplacoes
    for delete using (org_id = auth_org_id());

-- ===================== CONTRATOS =====================
drop policy if exists "contratos org read" on public.contratos;
create policy "contratos org read" on public.contratos
    for select using (org_id = auth_org_id());

drop policy if exists "contratos org insert" on public.contratos;
create policy "contratos org insert" on public.contratos
    for insert with check (org_id = auth_org_id());

drop policy if exists "contratos org update" on public.contratos;
create policy "contratos org update" on public.contratos
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "contratos org delete" on public.contratos;
create policy "contratos org delete" on public.contratos
    for delete using (org_id = auth_org_id());

-- ===================== PAGAMENTOS =====================
drop policy if exists "pagamentos org read" on public.pagamentos;
create policy "pagamentos org read" on public.pagamentos
    for select using (org_id = auth_org_id());

drop policy if exists "pagamentos org insert" on public.pagamentos;
create policy "pagamentos org insert" on public.pagamentos
    for insert with check (org_id = auth_org_id());

drop policy if exists "pagamentos org update" on public.pagamentos;
create policy "pagamentos org update" on public.pagamentos
    for update using (org_id = auth_org_id()) with check (org_id = auth_org_id());

drop policy if exists "pagamentos org delete" on public.pagamentos;
create policy "pagamentos org delete" on public.pagamentos
    for delete using (org_id = auth_org_id());
