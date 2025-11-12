begin;

-- % diagnóstico completo por etapa
create or replace view public.kanban_diag_completion as
select
    l.org_id,
    l.etapa,
    avg(
            case when d.readiness_score is not null
                and d.objetivo is not null
                and d.valor_carta_alvo is not null
                     then 1 else 0 end
    )::numeric as diagnostic_completion_pct
from public.leads l
         left join public.lead_diagnosticos d on d.lead_id = l.id
group by 1,2;

-- Readiness médio por etapa
create or replace view public.kanban_readiness_avg as
select
    l.org_id,
    l.etapa,
    avg(coalesce(d.readiness_score,0))::numeric as readiness_avg
from public.leads l
         left join public.lead_diagnosticos d on d.lead_id = l.id
group by 1,2;

-- Tempo médio até 1º contato (min)
create or replace view public.kanban_tfirstcontact_avg as
select
    l.org_id,
    l.etapa,
    avg(extract(epoch from (l.first_contact_at - l.created_at)) / 60.0)::numeric as t_first_contact_avg_min
from public.leads l
where l.first_contact_at is not null
group by 1,2;

commit;
