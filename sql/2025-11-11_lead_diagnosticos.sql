begin;

-- Caso use gen_random_uuid:
-- create extension if not exists pgcrypto;

create table if not exists public.lead_diagnosticos (
                                                        id uuid primary key default gen_random_uuid(),
                                                        org_id uuid not null references public.orgs(id) on delete cascade,
                                                        lead_id uuid not null references public.leads(id) on delete cascade,

                                                        objetivo text,
                                                        prazo_meta_meses int,
                                                        preferencia_produto text,
                                                        regiao_preferencia text,

                                                        renda_mensal numeric,
                                                        reserva_inicial numeric,
                                                        comprometimento_max_pct numeric,
                                                        renda_provada boolean default false,
                                                        score_risco int,

                                                        valor_carta_alvo numeric,
                                                        prazo_alvo_meses int,
                                                        estrategia_lance text,
                                                        lance_base_pct numeric,
                                                        lance_max_pct numeric,
                                                        janela_preferida_semanas int,

                                                        readiness_score int,
                                                        prob_conversao numeric,
                                                        prob_contemplacao_short numeric,
                                                        prob_contemplacao_med numeric,
                                                        prob_contemplacao_long numeric,

                                                        consent_scope text,
                                                        consent_ts timestamptz,
                                                        extras jsonb,

                                                        created_at timestamptz default now(),
                                                        updated_at timestamptz default now()
);

create index if not exists idx_lead_diag_org on public.lead_diagnosticos(org_id);
create index if not exists idx_lead_diag_lead on public.lead_diagnosticos(lead_id);

create or replace function public.tg_touch_updated_at() returns trigger as $$
begin
    new.updated_at = now();
    return new;
end; $$ language plpgsql;

drop trigger if exists tr_lead_diag_touch on public.lead_diagnosticos;
create trigger tr_lead_diag_touch
    before update on public.lead_diagnosticos
    for each row execute procedure public.tg_touch_updated_at();

commit;
