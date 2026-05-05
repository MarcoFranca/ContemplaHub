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
2. Visualiza o kanban no funil comercial de consórcio:
   - `novo`
   - `tentativa_contato`
   - `contato_realizado`
   - `diagnostico`
   - `proposta`
   - `negociacao`
   - `contrato`
3. Pode abrir colunas suplementares para `pós-venda`, `frios` e `perdidos` sem poluir o fluxo principal.
4. Cria lead via `CreateLeadSheet` ou abre um lead existente.
5. Leads capturados por Meta Lead Ads entram na mesma feature já em `etapa = novo`, mas a configuração dessa captura vive em `/app/meta-integracoes`.
6. No detalhe do lead, consulta interesse, cotas, propostas, diagnóstico e, quando houver, a origem Meta Ads com destaque para o criativo/anúncio, campanha/formulário e respostas iniciais do formulário.
7. A partir do lead, pode iniciar proposta ou formalização de contrato.

## Integrações com backend

- `/kanban`
- `/leads/{leadId}/stage`
- `/contracts/from-lead`
- tabelas Supabase como `leads`, `lead_interesses`, `cotas`, `contratos` e `administradoras`
- BFFs de proposta e proposta pública
- ingestões externas como Meta Lead Ads passam pelo backend e aterrissam na mesma tabela `leads`
- o kanban agora também consome resumo de `lead_diagnosticos.extras.meta_ads` para exibir origem, criativo (`ad_name`) e objetivo/faixa declarada sem poluir o card
- ações rápidas no card permitem marcar `Contatado`, `Sem resposta` (`frio`) e `Perdido` sem sair do quadro
- o estado local do Kanban mantém todas as etapas (`novo` até `perdido`) mesmo quando `frios` e `perdidos` estão ocultos; assim, mover um card para uma coluna escondida remove o item da visão ativa sem quebrar o drag & drop nem exigir ativar o toggle
- os cards priorizam leitura vertical: nome, contato, bloco de origem Meta Ads/criativo, chips compactos de diagnóstico inicial e ações rápidas em `flex-wrap`

## Observações arquiteturais

- a feature de leads ainda mistura responsabilidade de funil, diagnóstico, proposta e transição para contrato
- o detalhe do lead funciona como hub operacional de subfluxos
- o componente `CreateLeadSheet` faz criação direta em Supabase via service role server-side na action

## Pendentes de confirmação

- qual parte de propostas deve continuar acoplada a leads e qual parte deve migrar para feature própria
- se o domínio de diagnóstico deve permanecer como subfeature de leads ou módulo transversal
