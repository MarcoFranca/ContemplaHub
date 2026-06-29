# Feature Portal do Parceiro (`/partner`)

## Responsabilidade

Área logada do parceiro de negócio. Mostra apenas dados vinculados ao acesso do parceiro,
respeitando as permissões (`canViewContracts`, `canViewCommissions`, `canViewClientData`).
Autenticação e vínculo via `getCurrentPartnerAccess` (server). Dados vêm do backend por
`partnerBackendFetch` (token da sessão) nos endpoints `/partner/*`.

## Estrutura

- `app/partner/layout.tsx` → `components/partner/PartnerShell` (Sidebar + Header).
  O shell real fica em `components/partner/` (as duplicatas órfãs em `app/partner/` foram removidas).
- `app/partner/page.tsx` — **Início (painel)**: KPIs (a receber, recebido, contratos),
  gráfico de comissão líquida por mês (`components/partner/PartnerHomeChart`) e lançamentos recentes.
  Antes a home só redirecionava para contratos.
- `app/partner/commissions/page.tsx` — lista de comissões: mostra **cliente, número do contrato,
  grupo/cota** (em vez de UUID), competência e datas formatadas, badge de repasse ("A receber" /
  "Recebido") e métricas a receber/recebido. Consome `contrato_numero`/`numero_cota`/`grupo_codigo`/
  `cliente_nome` e `resumo.valor_liquido_pendente|pago` enriquecidos no backend.
- `app/partner/contracts/page.tsx` — lista de contratos: nome do cliente em destaque, badge de status
  colorido, grupo/cota, valor líquido e lançamentos, paginação. Sem travessão/UUID.
- `app/partner/contracts/[contractId]/page.tsx` — detalhe: cabeçalho com cliente + status, resumo do
  contrato (datas e valores formatados), cliente, resumo financeiro (A receber / Recebido / Líquido /
  Lançamentos) e lista de lançamentos (competência por extenso, repasse colorido). "A receber/Recebido"
  do detalhe são derivados dos `commission_items` por `repasse_status`.
  O detalhe também mostra a **estratégia de lance** da cota (sorteio / lance fixo / lance livre /
  embutido, de `cota.tipo_lance_preferencial`) e a seção **"Lances dados"** (lista de `item.lances`
  com data da assembleia, tipo, percentual/valor e resultado).
- `app/partner/repasses/page.tsx` — **Meus repasses**: lista os lotes de repasse pagos ao parceiro
  (`GET /partner/repasses/lotes`), com total recebido, forma de pagamento e **download do comprovante**
  (`PartnerRepasseList` + server action `getPartnerComprovanteUrlAction` → `.../comprovante/signed-url`,
  validando a posse do lote). Fecha o ciclo de confiança: o parceiro vê e baixa o comprovante do que recebeu.
- `app/partner/simuladores/page.tsx` — **Simuladores** (reusa `SimuladoresHub` do app: consórcio/lance
  e comparativo consórcio × financiamento; componentes puros, sem dados da org).
- `app/partner/me/page.tsx` — minha conta (placeholders "Não informado" em vez de travessão).

Navegação inclui "Simuladores" no `PartnerSidebar`.

## Navegação

`PartnerSidebar`: Início, Contratos, Comissões, Minha conta. O ativo de "Início" é por match exato
de `/partner` (os demais por prefixo), pois a home agora é uma página real.

## Copy

Sem travessão (—) nos textos; usar "·", dois pontos ou reescrever.
