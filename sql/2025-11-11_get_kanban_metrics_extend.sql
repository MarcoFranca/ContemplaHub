begin;

create or replace function public.get_kanban_metrics(p_org uuid)
returns jsonb
language sql
stable
as $$
with leads_org as (
  select *
  from public.leads
  where org_id = p_org
),
-- base por etapa (contagem e média de dias desde a criação)
base as (
  select
    l.etapa,
    count(*)::int                                as count,
    avg(extract(epoch from (now() - l.created_at))/86400.0)::numeric as avg_days
  from leads_org l
  group by l.etapa
),
-- conversão GLOBAL (fechados / total) — MVP
conv as (
  select
    coalesce(
      100.0 * sum(case when etapa in ('contrato','ativo') then 1 else 0 end)::numeric
      / nullif(count(*), 0),
      0
    )::numeric as conversion
  from leads_org
),
-- % diagnóstico completo por etapa
diag as (
  select
    l.etapa,
    avg(
      case
        when d.readiness_score is not null
         and d.objetivo is not null
         and d.valor_carta_alvo is not null
        then 1 else 0
      end
    )::numeric as diagnostic_completion_pct
  from leads_org l
  left join public.lead_diagnosticos d on d.lead_id = l.id
  group by l.etapa
),
-- readiness médio por etapa
ready as (
  select
    l.etapa,
    avg(coalesce(d.readiness_score,0))::numeric as readiness_avg
  from leads_org l
  left join public.lead_diagnosticos d on d.lead_id = l.id
  group by l.etapa
),
-- tempo médio até o 1º contato (min) por etapa
t1c as (
  select
    l.etapa,
    avg(extract(epoch from (l.first_contact_at - l.created_at))/60.0)::numeric as t_first_contact_avg_min
  from leads_org l
  where l.first_contact_at is not null
  group by l.etapa
)
select coalesce(
               jsonb_agg(
                       jsonb_build_object(
                               'etapa', b.etapa,
                               'count', b.count,
                               'conversion', c.conversion,                                        -- taxa global
                               'avgDays', coalesce(b.avg_days, 0),                                -- dias médios
                               'diagnosticCompletionPct', coalesce(di.diagnostic_completion_pct, 0),
                               'readinessAvg', coalesce(r.readiness_avg, 0),
                               'tFirstContactAvgMin', coalesce(t.t_first_contact_avg_min, 0)
                       )
                           order by b.etapa
               ),
               '[]'::jsonb
       )
from base b
         cross join conv c                           -- mesma conversão para todas as etapas (MVP)
         left join diag  di on di.etapa = b.etapa
         left join ready r  on r.etapa  = b.etapa
         left join t1c   t  on t.etapa  = b.etapa;
$$;

commit;
