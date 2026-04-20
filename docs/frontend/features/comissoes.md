# Feature Comissões

## Responsabilidade

O módulo de comissões acompanha o financeiro de comissionamento e repasses vinculados a contratos e cartas.

Responsabilidades observadas:

- listar lançamentos
- resumir totais financeiros
- filtrar por parceiro, status e competência
- atualizar status do lançamento
- controlar repasses
- consultar competências, timeline e resumo financeiro por contrato

## Principais pontos de código

### Rota

- `src/app/app/comissoes/page.tsx`

### Actions

- `src/app/app/comissoes/actions.ts`

### Componentes

- `ComissoesFilters`
- `LancamentosTable`
- `LancamentoStatusDialog`
- `RepasseDialog`
- `CompetenciasTable`
- `ContratoTimeline`
- `status-badges`

### Integração com contrato

- `src/app/app/contratos/[contratoId]/components/ComissoesContratoCard.tsx`

## Schemas e actions relevantes

Não há schema Zod local visível para filtros ou mutações neste módulo.

As actions são o principal contrato do frontend:

- `listComissaoLancamentosAction`
- `listParceirosOptionsAction`
- `updateLancamentoStatusAction`
- `updateRepasseAction`
- `gerarLancamentosContratoAction`
- `sincronizarEventosContratoAction`
- `processarPagamentoComissaoAction`
- `marcarRepassePagoAction`

## Fluxo principal do usuário

1. O usuário abre `/app/comissoes`.
2. Consulta KPIs de lançamentos e repasses.
3. Filtra o conjunto desejado.
4. Atualiza status financeiro ou repasse.
5. Em detalhes de contrato, consulta visão específica por contrato.

## Integrações com backend

- `/comissoes/lancamentos`
- `/comissoes/contratos/{contratoId}`
- `/comissoes/parceiros?ativos=true`
- `/comissoes/lancamentos/{id}/status`
- `/comissoes/lancamentos/{id}/repasse`
- `/comissoes/contratos/{contratoId}/gerar`
- `/comissoes/contratos/{contratoId}/sincronizar-eventos`
- `/comissoes/contratos/{contratoId}/competencias`
- `/comissoes/contratos/{contratoId}/resumo-financeiro`
- `/comissoes/contratos/{contratoId}/timeline`

## Observações arquiteturais

- o módulo usa padrão consistente de action autenticada com `Authorization` e `X-Org-Id`
- o detalhe de contrato reutiliza as mesmas actions para montar a visão financeira
- comissões depende fortemente da qualidade dos eventos e vínculos gerados no backend

## Pendentes de confirmação

- se o resumo financeiro do contrato deve evoluir para um submódulo próprio
