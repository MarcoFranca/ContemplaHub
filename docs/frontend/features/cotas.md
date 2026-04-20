# Feature Cotas

## Responsabilidade

No frontend atual, o domínio de cotas aparece distribuído entre:

- formulário de contrato
- carteira
- módulo de lances
- detalhe de contrato

Por isso, `cotas` não existe hoje como pasta de feature dedicada em `src/features`, mas existe claramente como conceito de negócio.

## Principais pontos de código

### Rotas

- `src/app/app/lances/page.tsx`
- `src/app/app/lances/[cotaId]/page.tsx`
- `src/app/app/carteira/page.tsx`
- `src/app/app/contratos/[contratoId]/page.tsx`

### Actions e helpers

- `src/app/app/lances/actions/carta-actions.ts`
- `src/app/app/lances/actions/comissao-actions.ts`
- `src/app/app/lances/components/actions/update-carta-operacao.ts`
- `src/app/app/lances/components/actions/update-carta-modalidades.ts`
- `src/app/app/lances/components/schemas/carta-operacao.schema.ts`
- `src/app/app/lances/components/schemas/carta-modalidades.schema.ts`

### Componentes

- `LancesTable`
- `LancesFilters`
- `LanceDetailHero`
- `LanceExecutiveSummary`
- `LanceActionRail`
- `LanceReadinessChecklist`
- `LanceStrategyCard`
- `EditCartaSheet`
- `CartaSheet`

## Papel funcional da feature

- acompanhar a cota no mês corrente
- definir lance e operação
- revisar contemplação, histórico e prontidão
- editar regras operacionais da carta
- ligar a cota ao financeiro de comissão quando aplicável

## Fluxo principal do usuário

1. O operador abre `/app/lances`.
2. Filtra por competência, status da cota, administradora e produto.
3. Entra no detalhe de uma cota em `/app/lances/[cotaId]`.
4. Analisa painel executivo, assembleia, histórico, contemplação e checklists.
5. Atualiza modalidades ou operação quando necessário.

## Integrações com backend

- BFF `/api/lances/cartas/[cotaId]`
- actions de `carta-actions`
- dados de cota também são consumidos de forma derivada em carteira e contratos

## Observações arquiteturais

- o nome de navegação da feature é `lances`, mas o domínio documentado aqui é `cotas` porque essa é a unidade operacional persistida
- a cota é um ponto de integração entre contrato, lance, contemplação e comissão

## Pendentes de confirmação

- se o módulo deve ser renomeado conceitualmente para `cotas` no frontend
- se a operação mensal de lance continuará sendo a principal forma de entrada para gestão da cota
