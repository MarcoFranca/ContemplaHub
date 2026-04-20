# Feature Contratos

## Responsabilidade

Contratos formalizam a venda nova ou o cadastro operacional de uma carta já existente.

Responsabilidades observadas:

- captar os dados estruturais da carta e do contrato
- validar regras operacionais e financeiras
- mapear payload para o backend
- permitir dois modos de operação
- integrar documento do contrato
- alimentar visão de detalhe com comissão e resumo financeiro

## Posição no fluxo macro

- contrato nasce na formalização/fechamento;
- contrato não é a cota;
- assembleia, lance e contemplação pertencem à cota.

## Principais pontos de código

### Núcleo da feature

- `src/features/contratos/components/contrato-form-shell-v2.tsx`
- `src/features/contratos/components/create-contrato-sheet.tsx`
- `src/features/contratos/components/contrato-pdf-upload-card.tsx`
- `src/features/contratos/actions/create-from-lead.ts`
- `src/features/contratos/actions/register-existing.ts`
- `src/features/contratos/actions/_sync-cota-extra-fields.ts`
- `src/features/contratos/schemas/contrato-base.schema.ts`
- `src/features/contratos/utils/contrato-payload-mappers.ts`
- `src/features/contratos/utils/contrato-default-values.ts`
- `src/features/contratos/hooks/use-contrato-form-submit.ts`
- `src/features/contratos/server/get-form-options.ts`

### Seções do formulário

- `identificacao-section`
- `cota-financeira-section`
- `componentes-financeiros-section`
- `condicoes-operacionais-section`
- `formalizacao-section`
- `parceiro-section`
- `status-inicial-section`
- `documento-section`

### Pontos de entrada

- `src/features/contratos/components/create-contrato-sheet.tsx`
- `src/app/app/leads/[leadId]/contrato/novo/page.tsx`
- `src/app/app/leads/[leadId]/LeadCotasCard.tsx`
- `src/app/app/leads/ui/KanbanBoard.tsx`
- `src/app/app/carteira/ui/CreateCarteiraCartaSheet.tsx`
- `src/app/app/carteira/[leadId]/contratos/novo/page.tsx`

### Detalhe do contrato

- `src/app/app/contratos/[contratoId]/page.tsx`

## Schemas e actions relevantes

### Schemas

- `contratoBaseSchema`
- `fromLeadSchema`
- `registerExistingSchema`

### Actions

- `createContratoFromLeadAction`
- `registerExistingContratoAction`

### Mapper

`mapContratoFormToApi(mode, values)` faz:

- normalização de strings vazias para `null`
- serialização monetária em string brasileira
- serialização percentual com quatro casas
- remoção de payload derivado quando flag correspondente estiver desligada

## Fluxo principal do usuário

1. O usuário entra no fluxo a partir de lead ou carteira.
   Lead e kanban abrem o modo `fromLead`; carteira abre `registerExisting`.
2. Escolhe ou recebe o `mode`:
   `fromLead` ou `registerExisting`.
3. Preenche o formulário step-by-step em blocos:
   identificação, carta/cota, formalização, estado inicial quando aplicável e revisão final.
4. O schema Zod valida obrigatórios e regras condicionais.
5. O hook de submit escolhe a action correta.
6. O mapper converte os valores para o contrato esperado pelo backend.
7. Após sucesso, o fluxo pode seguir para documento, pós-salvamento ou detalhe do contrato.

Leitura correta do domínio:

- a formalização cria ou referencia a cota;
- depois registra o contrato como formalização dessa operação.

## Integrações com backend

- `/contracts/from-lead`
- `/contracts/register-existing`
- `/contracts/{contractId}/document`
- `/contracts/{contractId}/document/signed-url`
- sincronização complementar de campos da cota após criação

## Regras importantes observadas no frontend

- nova venda não deve nascer com status inicial avançado
- contrato existente exige `contractStatus` e `cotaSituacao`
- `fromLead` envia apenas o payload compatível com `/contracts/from-lead`
- `registerExisting` envia também `contract_status` e `cota_situacao`
- parceiro e repasse são dependentes entre si
- campos condicionais precisam limpar ou ignorar payload derivado
- opções ativas de lance fixo não podem repetir ordem nem percentual

## Contrato != cota

- contrato controla formalização e status comercial/jurídico;
- cota controla o ativo operacional;
- contemplação não nasce no contrato;
- carteira não é um status de contrato.

## Camada de estado do contrato

O estado do contrato é apenas uma das camadas do sistema:

- status do contrato
- situação da cota
- status da carteira

## Inconsistências observadas

- há arquivos duplicados ou com caminho anômalo em `components/form-shell/ section-base/*`
- ainda existem sheets legados em `src/app/app/leads/ui/ContractSheet.tsx` e `src/components/app/ContractSheet.tsx`, hoje fora do fluxo principal
- `pendente de confirmação`: se esses arquivos ainda têm função operacional ou são resquício de reorganização
