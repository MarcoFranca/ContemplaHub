# Tooling de banco no frontend

## Objetivo

O app Next.js do ContemplaHub **não é a autoridade operacional do banco**.

A autoridade operacional atual é:

- backend FastAPI
- Supabase/Postgres
- validações de autorização e `org_id` no backend
- RLS no banco

O pacote `packages/database` existe apenas para:

- preservar o histórico de migrations do Drizzle
- manter schema tipado legado/histórico
- concentrar seeds e tooling de banco fora do runtime do app Next

## O que mudou

O tooling de banco foi movido do app para [`packages/database`](/E:/Autentika/Projetos/Programas/CONTEMPLAHUB/contemplahub/packages/database/package.json:1).

Conteúdo movido:

- `drizzle.config.ts`
- `drizzle/`
- `src/db/schema/`
- `src/db/rls/`
- `src/db/seed.ts`
- scripts auxiliares ligados ao schema

O app Next continua com scripts de conveniência no `package.json`, mas eles apenas delegam para `packages/database`.

## Runtime do app Next

No runtime do frontend:

- não há uso de `drizzle-orm`
- não há uso de `postgres`
- `DATABASE_URL` não deve ser necessária para `dev`, `build` ou `start`

O `DATABASE_URL` continua sendo exigido **apenas** pelo tooling em `packages/database/drizzle.config.ts`.

## Inventário de tabelas

### Representadas no Drizzle

O schema histórico em `packages/database/src/schema` representa, entre outras, estas tabelas:

- `orgs`
- `profiles`
- `leads`
- `lead_diagnosticos`
- `lead_interesses`
- `landing_pages`
- `administradoras`
- `cotas`
- `lances`
- `contemplacoes`
- `contratos`
- `pagamentos`
- `audit_logs`
- `consent_logs`
- `deals`
- `propostas`
- `grupos`
- `lead_stage_history`
- `activities`
- `notes`
- `attachments`

### Usadas operacionalmente pelo backend FastAPI

O backend atual opera diretamente no Supabase com `supabase.table(...)` e usa, entre outras, estas tabelas:

- `orgs`
- `profiles`
- `leads`
- `lead_diagnosticos`
- `lead_interesses`
- `landing_pages`
- `administradoras`
- `cotas`
- `lances`
- `contemplacoes`
- `contratos`
- `pagamentos`
- `audit_logs`
- `consent_logs`
- `meta_lead_integrations`
- `meta_webhook_events`
- `partner_users`
- `lead_propostas`
- `lead_cadastros`
- `lead_cadastros_pf`
- `carteira_clientes`
- `contrato_parceiros`
- `parceiros_corretores`
- `cota_comissao_config`
- `cota_comissao_regras`
- `cota_comissao_parceiros`
- `comissao_lancamentos`
- `cota_pagamento_competencias`
- `cota_lance_competencias`
- `cota_lance_fixo_opcoes`
- `administradora_regras_lance`
- `event_outbox`

### Divergências e legado

Há divergências importantes entre o schema Drizzle e o domínio realmente operado pelo backend:

- o bloco Meta Ads (`meta_lead_integrations`, `meta_webhook_events`) não está representado no Drizzle
- o bloco de propostas/cadastros operacionais do backend usa `lead_propostas` e `lead_cadastros`, enquanto o Drizzle ainda carrega `deals` e `propostas`
- a tabela `propostas` (Drizzle) hoje só é **lida** pelo frontend (`get-dashboard-data.ts`, métricas do dashboard) — nenhum fluxo atual insere nela. Quem cria proposta de verdade (`NovaPropostaForm` → server action, e o agente de IA em `app/ai/tools.py::gerar_proposta`) grava em `lead_propostas`, com o conteúdo do cenário em `payload jsonb`. Trate `propostas` como legado/somente-leitura ao decidir onde validar/alterar regras de proposta.
- tabelas como `lead_stage_history`, `activities`, `notes` e `attachments` existem no Drizzle, mas não são fonte operacional central do backend atual
- o schema Drizzle deve ser tratado como **histórico/auxiliar**, não como fonte de verdade do banco

## Como as mudanças de schema chegam de fato no Supabase

**Importante — leia antes de propor qualquer migration:** não existe pipeline de CI
(`drizzle-kit migrate`/`db:push`) aplicando essas migrations automaticamente. Na prática,
mudanças de schema são aplicadas **manualmente pelo Marco direto no SQL Editor do
dashboard do Supabase**. Os arquivos em `drizzle/*.sql` + `schema.ts` documentam a
intenção e mantêm a tipagem do ORM consistente, mas não são o mecanismo real de deploy —
podem inclusive ficar defasados do estado real do banco (ver guardrail equivalente no
`MIGRATION_RUNBOOK.md` da raiz do projeto: "se houver divergência entre schema real e
migrations do repo, o schema real do banco vence").

Consequência prática: ao propor uma migration aqui, sempre entregar também o SQL puro,
pronto para colar no SQL Editor — isso é o artefato que efetivamente desbloqueia a
feature, não só o arquivo `.sql` no repo.

### Cuidado com `ALTER TYPE ... ADD VALUE` em enums Postgres

Já tivemos dois incidentes reais com isso (`lance_tipo` na migration `0012`, `produto` na
migration `0013`): adicionar um valor a um enum existente via `ALTER TYPE ... ADD VALUE`
não é confiável neste projeto. O cache de schema do PostgREST (Supabase Data API) não
passa a reconhecer o valor novo sem um restart do serviço, e continua injetando o cast
`::nome_do_enum` nas queries — o que gera erro `22P02` ("invalid input value for enum").

Padrão adotado sempre que isso acontecer: converter a coluna de `enum` para `text`
(`ALTER TABLE ... ALTER COLUMN ... TYPE text USING coluna::text`) e mover a validação dos
valores aceitos para o backend (`Literal` no Pydantic) e para o Zod no frontend. Não é
necessário apagar o tipo enum em si — pode ficar órfão, sem custo.

## Regras de manutenção

- não apagar migrations históricas sem inventário e revisão
- não alterar RLS sem migration revisada
- não executar migrations contra produção sem processo controlado
- novas regras de negócio multi-tenant devem continuar centralizadas no backend FastAPI e no banco, nunca no client

## Próximos passos recomendados

- reduzir o uso de `SUPABASE_SERVICE_ROLE_KEY` no frontend server-side
- decidir se `packages/database` continuará como arquivo histórico interno ou será extraído para um workspace dedicado de infraestrutura
- revisar periodicamente as divergências entre schema legado e modelo operacional real do backend
