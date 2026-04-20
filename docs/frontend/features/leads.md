# Feature Leads

## Responsabilidade

O domínio de leads é a porta principal do funil comercial.

Responsabilidades observadas:

- entrada de novos leads
- visualização do funil em kanban
- leitura do detalhe do lead
- registro e leitura de diagnóstico
- criação e gestão de propostas
- transição do lead para contrato

## Principais pontos de código

### Rotas

- `src/app/app/leads/page.tsx`
- `src/app/app/leads/[leadId]/page.tsx`
- `src/app/app/leads/[leadId]/propostas/nova/page.tsx`
- `src/app/app/leads/[leadId]/propostas/[propostaId]/page.tsx`
- `src/app/app/leads/[leadId]/contrato/novo/page.tsx`

### Actions

- `src/app/app/leads/actions.ts`
- `src/app/app/leads/actions.diagnostic.ts`
- `src/app/app/leads/actions.propostas.ts`
- `src/app/app/leads/metrics-actions.ts`
- `src/app/app/leads/[leadId]/actions.ts`

### UI principal

- `src/app/app/leads/ui/KanbanBoard.tsx`
- `src/app/app/leads/ui/CreateLeadSheet.tsx`
- `src/app/app/leads/ui/DiagnosticPanel.tsx`
- `src/app/app/leads/ui/ContractSheet.tsx`
- `src/app/app/leads/ui/CreateContractDialog.tsx`
- `src/app/app/leads/ui/InterestDetailsDialog.tsx`

### Suporte de feature

- `src/features/leads/*`
- `src/features/diagnostic/*`
- `src/components/lead/*`

## Schemas e actions relevantes

- criação manual usa `createLeadManual`
- diagnóstico usa `saveLeadDiagnostic` e `getLeadDiagnostic`
- movimentação do funil usa `moveLeadStage`
- propostas usam BFF `/api/lead-propostas/lead/[leadId]`

Não há um schema Zod único do domínio de leads concentrado como em contratos.

## Fluxo principal do usuário

1. O operador entra em `/app/leads`.
2. Visualiza o kanban por estágio.
3. Cria lead via `CreateLeadSheet` ou abre um lead existente.
4. No detalhe do lead, consulta interesse, cotas, propostas e diagnóstico.
5. A partir do lead, pode iniciar proposta ou formalização de contrato.

## Integrações com backend

- `/kanban`
- `/leads/{leadId}/stage`
- `/contracts/from-lead`
- tabelas Supabase como `leads`, `lead_interesses`, `cotas`, `contratos` e `administradoras`
- BFFs de proposta e proposta pública

## Observações arquiteturais

- a feature de leads ainda mistura responsabilidade de funil, diagnóstico, proposta e transição para contrato
- o detalhe do lead funciona como hub operacional de subfluxos
- o componente `CreateLeadSheet` faz criação direta em Supabase via service role server-side na action

## Pendentes de confirmação

- qual parte de propostas deve continuar acoplada a leads e qual parte deve migrar para feature própria
- se o domínio de diagnóstico deve permanecer como subfeature de leads ou módulo transversal
