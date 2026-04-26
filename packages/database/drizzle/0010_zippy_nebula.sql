-- ###############
-- MIGRAÇÃO LEAD_STAGE + MÉTRICAS KANBAN
-- ###############

begin;

-- (A) Garantir colunas como TEXT temporariamente (se já forem text, ignora o erro com DO blocks)
do $$
begin
  if exists(select 1 from information_schema.columns 
            where table_schema='public' and table_name='lead_stage_history' and column_name='from_stage' and udt_name='lead_stage') then
    execute 'alter table lead_stage_history alter column from_stage type text';
end if;
exception when others then null;
end $$;

do $$
begin
  if exists(select 1 from information_schema.columns 
            where table_schema='public' and table_name='lead_stage_history' and column_name='to_stage' and udt_name='lead_stage') then
    execute 'alter table lead_stage_history alter column to_stage type text';
end if;
exception when others then null;
end $$;

do $$
begin
  if exists(select 1 from information_schema.columns 
            where table_schema='public' and table_name='leads' and column_name='etapa' and udt_name='lead_stage') then
    execute 'alter table leads alter column etapa drop default';
execute 'alter table leads alter column etapa type text';
end if;
exception when others then null;
end $$;

-- (B) Saneamento dos dados legados: 'fechamento' -> 'contrato'
update leads set etapa = 'contrato' where etapa = 'fechamento';
update lead_stage_history set from_stage = 'contrato' where from_stage = 'fechamento';
update lead_stage_history set to_stage   = 'contrato' where to_stage   = 'fechamento';

-- (C) Recriar ENUM sem 'fechamento'
do $$
begin
  -- se existir, dropar com segurança
  if exists(select 1 from pg_type where typname = 'lead_stage') then
drop type public.lead_stage;
end if;
create type public.lead_stage as enum ('novo','diagnostico','proposta','negociacao','contrato','ativo','perdido');
end $$;

-- (D) Recast das colunas para o ENUM + default
alter table lead_stage_history alter column from_stage type public.lead_stage using from_stage::public.lead_stage;
alter table lead_stage_history alter column to_stage   type public.lead_stage using to_stage::public.lead_stage;

alter table leads alter column etapa type public.lead_stage using etapa::public.lead_stage;
alter table leads alter column etapa set default 'novo'::public.lead_stage;

-- (E) VIEW: spans por etapa (entrada/saída e duração em dias)
create or replace view lead_stage_spans as
with ordered as (
  select
    lsh.lead_id,
    lsh.to_stage        as stage_entered,
    lsh.created_at      as entered_at,
    lead(lsh.created_at) over (
      partition by lsh.lead_id order by lsh.created_at
    )                   as next_change_at
  from lead_stage_history lsh
)
select
    l.org_id                          as org_id,
    o.stage_entered                   as stage,
    o.lead_id,
    o.entered_at,
    o.next_change_at,
    extract(epoch from coalesce(o.next_change_at, now()) - o.entered_at)/86400.0 as duration_days
from ordered o
         join leads l on l.id = o.lead_id;

-- (F) VIEW: tempo médio por etapa
create or replace view kanban_avg_days as
select
    org_id,
    stage,
    round(avg(duration_days)::numeric, 1) as avg_days
from lead_stage_spans
group by 1,2;

-- (G) VIEW: conversão por etapa (saiu da etapa / entrou na etapa)
create or replace view kanban_conversion as
with entries as (
  select org_id, stage, count(*) as entered
  from lead_stage_spans
  group by 1,2
),
exits as (
  select org_id, stage, count(*) as exited
  from lead_stage_spans
  where next_change_at is not null
  group by 1,2
)
select
    e.org_id,
    e.stage,
    case when e.entered = 0 then 0
         else round((coalesce(x.exited,0)::numeric / e.entered::numeric)*100, 0)
        end as conversion_pct
from entries e
         left join exits x
                   on x.org_id = e.org_id and x.stage = e.stage;

-- (H) RPC: retorna JSON com avgDays e conversion
create or replace function get_kanban_metrics(p_org uuid)
returns jsonb
language sql
stable
as $$
  with a as (
    select stage, avg_days from kanban_avg_days where org_id = p_org
  ),
  c as (
    select stage, conversion_pct from kanban_conversion where org_id = p_org
  )
select jsonb_build_object(
               'avgDays',    coalesce((select jsonb_object_agg(stage, avg_days) from a), '{}'::jsonb),
               'conversion', coalesce((select jsonb_object_agg(stage, conversion_pct) from c), '{}'::jsonb)
       );
$$;

commit;
