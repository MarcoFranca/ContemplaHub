# Feature Painel (Dashboard)

## Responsabilidade

Visão de gestão em `/app` (`src/app/app/page.tsx`). Reúne KPIs, análise visual (gráficos),
cruzamento de dados comercial/operacional/financeiro e listas de ação.

## Camada de dados

`src/app/app/_data/dashboard/get-dashboard-data.ts` — `getDashboardData()` (server, usa
service role apenas no servidor, sempre filtrando por `org_id`). Consolida em paralelo:
leads, diagnósticos, propostas, contratos, cotas, comissões, administradoras, atividades,
profiles e deals. Saídas principais:

- `summary` + `delta` (KPIs do mês x mês anterior);
- `analytics` — KPIs cruzados: carteira sob gestão (Σ crédito das cotas em operação),
  ticket médio da carta, conversão lead→contrato;
- `monthlySeries` (6 meses) — leads, contratos e comissão prevista por mês;
- `cotasPorStatus` e `cotasPorProduto` — distribuição da carteira;
- `financialPreview` — previsto/disponível/pago/repasse + por administradora;
- `commercialFunnel`, `operationalAgenda`, `activityItems`, `sellerRanking`,
  `priorityItems`, `attentionItems`.

`src/app/app/_data/dashboard/get-vendas-analytics.ts` — `getVendasAnalytics(de, ate)` (server,
service role). "Venda" = cota com `data_adesao` preenchida e `status` ≠ cancelada; crédito =
`valor_carta`; cliente novo = `lead_id` distinto no período. Retorna `creditoAno`, `creditoMes`,
`clientesNovosMes` (sempre ano/mês atuais), `creditoPeriodo`/`clientesNovosPeriodo`/`vendasPeriodo`
(intervalo `de..ate`, YYYY-MM) e `serie[]` por mês com `credito` e `creditoAnoAnterior` (mesmo mês,
ano-1) para comparativo YoY. A página (`page.tsx`) lê `?de=&ate=` (default = ano atual).

## Gráficos (recharts)

Componentes client em `_components/dashboard/` (recharts está disponível; tema escuro via
`contentStyle` nos tooltips):

- `dashboard-evolucao.tsx` — `ComposedChart` 6 meses: barras de contratos, linha de leads e
  área de comissão prevista (eixo secundário em R$).
- `dashboard-distribuicao.tsx` — donuts (`PieChart`) de cotas por situação e por produto.
- `dashboard-comissao-chart.tsx` — fluxo previsto/disponível/pago + barras horizontais de
  comissão líquida por administradora.
- `dashboard-analytics-kpis.tsx` — faixa de KPIs cruzados (cards).
- `dashboard-vendas.tsx` — bloco "Vendas & crédito": seletor de período (De/Até + atalhos:
  ano atual, últimos 6/12 meses, 1º trimestre), KPIs (crédito no ano/mês, clientes novos no mês,
  crédito e clientes no período) e gráfico de barras **crédito por mês: este ano × ano anterior**
  (comparativo YoY). Navega via `?de=&ate=`.

- `dashboard-distribuicao.tsx` — donuts (`PieChart`) com **total no centro** e legenda **abaixo**
  do gráfico (layout vertical, evita o recorte/sobreposição das legendas).

Header e topo:
- Cabeçalho enxuto (sem emoji), com a faixa "Painel", saudação e subtítulo.
- `dashboard-attention-bell.tsx` — sininho no topo com a contagem de pendências (vermelho = alta,
  âmbar = média) que leva à página dedicada `/app/pendencias`.

### Página de pendências (`/app/pendencias`)

`src/app/app/_data/dashboard/get-pendencias.ts` — `getPendencias()` (server, service role) lista as
pendências **item a item** (não só contagens), agrupadas por categoria: cartas ativas sem comissão
configurada (→ `/app/financeiro/pagamentos?item_id=…` já com a carta do cliente pré-selecionada;
usa o contrato quando existe, senão `cota:{cotaId}`, mesma regra de `selection_id` do módulo),
contratos sem lançamentos (→ `/app/contratos/{id}`),
**comissões em cobrança** (lançamentos com `observacoes` contendo "INADIMPLENTE" → contrato),
repasses de parceiro pendentes (→ contrato do repasse), **cartas sem dia de assembleia**
(cota ativa com `assembleia_dia` nulo → `/app/lances/{cotaId}`) e **clientes sem contrato**
(lead com cartas não canceladas e nenhum contrato → `/app/leads/{leadId}`).

`getPendencias` é a **fonte única** das pendências do painel: o sininho (`DashboardAttentionBell`,
recebe `high`/`medium`) e a seção "Precisa da sua atenção" (`DashboardAttention`, recebe `grupos`
como cards por subcategoria que linkam para `/app/pendencias?cat=…`) usam esses mesmos números, então
batem com a página. A regra de competência dos repasses (só até o mês vigente) vale em tudo. `src/app/app/pendencias/page.tsx` renderiza
os grupos com filtro por **subcategoria** (`?cat=<categoria>`) e por **severidade**
(`?sev=all|high|medium`); cada linha mostra a ação ("Configurar comissão", "Gerar lançamentos",
"Dar baixa no repasse") e leva direto ao local de resolução. Os cards de "Precisa da sua atenção"
no painel apontam para `/app/pendencias?cat=…` (categoria correspondente), encaminhando para a
subcategoria certa.

Regra dos repasses: só contam como pendência os de competência **até o mês vigente**; competências
futuras são apenas provisão (ainda não venceram) e ficam de fora.

Acesso e contadores no Sidebar: "Pendências" (Operação, ícone de sino) tem **badge com o total** e
**subitens por subcategoria** (Sem comissão, Sem lançamentos, Em cobrança, Repasses, Sem assembleia),
cada um com seu próprio badge. "Lances" mostra um badge com os **lances em aberto do mês vigente**.
"Comissões" mostra um badge com as pendências de comissão (sem lançamentos + em cobrança + repasses),
e o subitem "Repasses" mostra os repasses pendentes. Em "Plataforma", os itens foram agrupados sob
**Configurações** (Organização, Usuários, Meta Ads, Landing Pages) como subitens.
Os números vêm de `src/app/app/_data/dashboard/get-sidebar-badges.ts` (`getSidebarBadges()`),
calculado no `layout.tsx` (server) e passado via `AppShell` → `Sidebar` (`badges: Record<href, n>`).
Lances em aberto = cotas ativas sem registro `feito`/`sem_lance` em `cota_lance_competencias` na
competência atual.
- `dashboard-shortcuts.tsx` — atalhos discretos (chips) logo no cabeçalho, em vez do bloco grande no fim.

Copy: não usar travessão (—) nos textos; preferir "·", dois pontos ou reescrever.

Os blocos anteriores (KPIs, funil comercial, agenda operacional, atividades, ranking,
prioridades, atenção) permanecem. `dashboard-financial.tsx` foi substituído no layout por
`dashboard-comissao-chart.tsx` (mantido em disco para reuso).

## Observações

- Tudo é leitura server-side; nenhuma escrita pelo front.
- A série mensal usa `created_at` (leads/contratos) e `competencia_prevista` (comissão).
- Ao adicionar novos cruzamentos, estender `getDashboardData` e tipar a saída em
  `DashboardData`.
