[
  {
    "create_policy_stmt": "CREATE POLICY \"activities org delete\" ON public.activities FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"activities org insert\" ON public.activities FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"activities org read\" ON public.activities FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"activities org update\" ON public.activities FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY acts_select ON public.activities FOR R USING ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = activities.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY acts_write ON public.activities FOR * USING ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = activities.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager())))))) WITH CHECK ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = activities.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"administradoras org delete\" ON public.administradoras FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"administradoras org insert\" ON public.administradoras FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"administradoras org read\" ON public.administradoras FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"administradoras org update\" ON public.administradoras FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"assembleias org delete\" ON public.assembleias FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"assembleias org insert\" ON public.assembleias FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"assembleias org read\" ON public.assembleias FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"assembleias org update\" ON public.assembleias FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY atts_all ON public.attachments FOR * USING ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = attachments.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager())))))) WITH CHECK ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = attachments.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY audit_select ON public.audit_logs FOR R USING (((org_id = app_auth_org_id()) AND app_is_manager()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY consent_select ON public.consent_logs FOR R USING ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = consent_logs.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"contemplacoes org delete\" ON public.contemplacoes FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"contemplacoes org insert\" ON public.contemplacoes FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"contemplacoes org read\" ON public.contemplacoes FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"contemplacoes org update\" ON public.contemplacoes FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"contratos org delete\" ON public.contratos FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"contratos org insert\" ON public.contratos FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"contratos org read\" ON public.contratos FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"contratos org update\" ON public.contratos FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"cotas org delete\" ON public.cotas FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"cotas org insert\" ON public.cotas FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"cotas org read\" ON public.cotas FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"cotas org update\" ON public.cotas FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"deals org delete\" ON public.deals FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"deals org insert\" ON public.deals FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"deals org read\" ON public.deals FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"deals org update\" ON public.deals FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY deals_select ON public.deals FOR R USING ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = deals.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY deals_write ON public.deals FOR * USING ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = deals.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager())))))) WITH CHECK ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = deals.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"grupos org delete\" ON public.grupos FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"grupos org insert\" ON public.grupos FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"grupos org read\" ON public.grupos FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"grupos org update\" ON public.grupos FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"lances org delete\" ON public.lances FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"lances org insert\" ON public.lances FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"lances org read\" ON public.lances FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"lances org update\" ON public.lances FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY landings_org_manager_select ON public.landing_pages FOR R USING (((org_id = app_auth_org_id()) AND app_is_manager()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY landings_owner_select ON public.landing_pages FOR R USING ((owner_user_id = auth.uid()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY landings_owner_write ON public.landing_pages FOR * USING (((owner_user_id = auth.uid()) OR ((org_id = app_auth_org_id()) AND app_is_manager()))) WITH CHECK (((owner_user_id = auth.uid()) OR ((org_id = app_auth_org_id()) AND app_is_manager())));"
  },
  {
    "create_policy_stmt": "CREATE POLICY lsh_insert ON public.lead_stage_history FOR A WITH CHECK ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = lead_stage_history.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY lsh_select ON public.lead_stage_history FOR R USING ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = lead_stage_history.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"leads org delete\" ON public.leads FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"leads org insert\" ON public.leads FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"leads org read\" ON public.leads FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"leads org update\" ON public.leads FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY leads_org_manager_select ON public.leads FOR R USING (((org_id = app_auth_org_id()) AND app_is_manager()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY leads_owner_select ON public.leads FOR R USING ((owner_id = auth.uid()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY leads_owner_update ON public.leads FOR W USING (((owner_id = auth.uid()) OR ((org_id = app_auth_org_id()) AND app_is_manager())));"
  },
  {
    "create_policy_stmt": "CREATE POLICY read_leads_org_or_owner ON public.leads FOR R USING (((EXISTS ( SELECT 1\n   FROM profiles p\n  WHERE ((p.user_id = auth.uid()) AND (p.org_id = leads.org_id) AND (p.role = ANY (ARRAY['admin'::text, 'gestor'::text]))))) OR (owner_id = auth.uid())));"
  },
  {
    "create_policy_stmt": "CREATE POLICY notes_all ON public.notes FOR * USING ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = notes.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager())))))) WITH CHECK ((EXISTS ( SELECT 1\n   FROM leads l\n  WHERE ((l.id = notes.lead_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY orgs_select ON public.orgs FOR R USING ((EXISTS ( SELECT 1\n   FROM profiles p\n  WHERE ((p.user_id = auth.uid()) AND (p.org_id = orgs.id) AND (p.role = ANY (ARRAY['admin'::text, 'gestor'::text]))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"pagamentos org delete\" ON public.pagamentos FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"pagamentos org insert\" ON public.pagamentos FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"pagamentos org read\" ON public.pagamentos FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"pagamentos org update\" ON public.pagamentos FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"profiles self read\" ON public.profiles FOR R USING ((user_id = auth.uid()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"profiles self update\" ON public.profiles FOR W USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"profiles.delete.by-manager\" ON public.profiles FOR D USING (can_manage_org(org_id));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"profiles.insert.by-manager\" ON public.profiles FOR A WITH CHECK (can_manage_org(org_id));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"profiles.read.same-org\" ON public.profiles FOR R USING ((org_id IN ( SELECT profiles_1.org_id\n   FROM profiles profiles_1\n  WHERE (profiles_1.user_id = app_uid()))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"profiles.update.by-manager\" ON public.profiles FOR W USING (can_manage_org(org_id)) WITH CHECK (can_manage_org(org_id));"
  },
  {
    "create_policy_stmt": "CREATE POLICY profiles_admin ON public.profiles FOR R USING (((org_id = app_auth_org_id()) AND app_is_manager()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY profiles_self ON public.profiles FOR R USING ((user_id = auth.uid()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY read_own_profile ON public.profiles FOR R USING ((auth.uid() = user_id));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"propostas org delete\" ON public.propostas FOR D USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"propostas org insert\" ON public.propostas FOR A WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"propostas org read\" ON public.propostas FOR R USING ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY \"propostas org update\" ON public.propostas FOR W USING ((org_id = auth_org_id())) WITH CHECK ((org_id = auth_org_id()));"
  },
  {
    "create_policy_stmt": "CREATE POLICY props_select ON public.propostas FOR R USING ((EXISTS ( SELECT 1\n   FROM (deals d\n     JOIN leads l ON ((l.id = d.lead_id)))\n  WHERE ((d.id = propostas.deal_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  },
  {
    "create_policy_stmt": "CREATE POLICY props_write ON public.propostas FOR * USING ((EXISTS ( SELECT 1\n   FROM (deals d\n     JOIN leads l ON ((l.id = d.lead_id)))\n  WHERE ((d.id = propostas.deal_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager())))))) WITH CHECK ((EXISTS ( SELECT 1\n   FROM (deals d\n     JOIN leads l ON ((l.id = d.lead_id)))\n  WHERE ((d.id = propostas.deal_id) AND ((l.owner_id = auth.uid()) OR ((l.org_id = app_auth_org_id()) AND app_is_manager()))))));"
  }
]


-- Helpers estáveis para RLS
create or replace function auth_org_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select p.org_id
  from profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

create or replace function auth_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select coalesce(p.role, 'viewer')
  from profiles p
  where p.user_id = auth.uid()
  limit 1
$$;


-- ORGS: ler apenas minha org
alter table if exists orgs enable row level security;
drop policy if exists "read my org" on orgs;
create policy "read my org"
on orgs for select
using (id = auth_org_id());

-- PROFILES: ler perfis da minha org
alter table if exists profiles enable row level security;
drop policy if exists "read profiles in my org" on profiles;
create policy "read profiles in my org"
on profiles for select
using (org_id = auth_org_id());

-- Audit logs por org
alter table if exists audit_logs enable row level security;
drop policy if exists "read audit logs in my org" on audit_logs;
create policy "read audit logs in my org"
on audit_logs for select
using (org_id = auth_org_id());

-- Ativa RLS
alter table leads enable row level security;

-- SELECT
drop policy if exists "leads select by role" on leads;
create policy "leads select by role"
on leads for select
using (
  org_id = auth_org_id()
  and (
    auth_role() in ('owner','admin','gestor','manager')
    or (auth_role() = 'vendedor' and (assigned_to = auth.uid() or created_by = auth.uid()))
    or (auth_role() = 'viewer')
  )
);

-- INSERT
drop policy if exists "leads insert by role" on leads;
create policy "leads insert by role"
on leads for insert
with check (
  org_id = auth_org_id()
  and (
    auth_role() in ('owner','admin','gestor','manager')
    or (auth_role() = 'vendedor' and assigned_to = auth.uid())
  )
);

-- UPDATE
drop policy if exists "leads update by role" on leads;
create policy "leads update by role"
on leads for update
using (
  org_id = auth_org_id()
  and (
    auth_role() in ('owner','admin','gestor','manager')
    or (auth_role() = 'vendedor' and assigned_to = auth.uid())
  )
)
with check (
  org_id = auth_org_id()
  and (
    auth_role() in ('owner','admin','gestor','manager')
    or (auth_role() = 'vendedor' and assigned_to = auth.uid())
  )
);

-- DELETE (opcional: só owner/admin)
drop policy if exists "leads delete admin only" on leads;
create policy "leads delete admin only"
on leads for delete
using (org_id = auth_org_id() and auth_role() in ('owner','admin'));
