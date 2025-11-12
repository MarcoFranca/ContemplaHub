begin;

create or replace function public.get_lance_otimo(p_lead uuid)
returns numeric
language plpgsql
stable
as $$
declare
v_base numeric := 0.20; -- 20% base
  v_ready int;
  v_ajuste numeric := 0;
  v_result numeric;
begin
select coalesce(d.readiness_score,50) into v_ready
from public.lead_diagnosticos d where d.lead_id = p_lead;

if v_ready >= 75 then v_ajuste := 0.05; end if; -- +5pp
  if v_ready <= 40 then v_ajuste := -0.05; end if; -- -5pp

  v_result := greatest(0, v_base + v_ajuste);
return v_result; -- fração (ex.: 0.25 = 25%)
end;
$$;

commit;
