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

Observação estrutural:

- o upload de documento do contrato agora vive dentro da própria feature, sem depender de componente localizado em `lances`

### Pontos de entrada

- `src/features/contratos/components/create-contrato-sheet.tsx`
- `src/app/app/leads/[leadId]/contrato/novo/page.tsx`
- `src/app/app/leads/[leadId]/LeadCotasCard.tsx`
- `src/app/app/leads/ui/KanbanBoard.tsx`
- `src/app/app/carteira/ui/CreateCarteiraCartaSheet.tsx`
- `src/app/app/carteira/[leadId]/contratos/novo/page.tsx`
- `src/app/app/cartas/[cotaId]/page.tsx` + `src/app/app/cartas/[cotaId]/components/completar-cadastro-carta.tsx`
  (completar cadastro de contrato para uma cota já existente sem contrato, modo `registerExisting` com `prefill`)

### Detalhe do contrato

- `src/app/app/contratos/[contratoId]/page.tsx`
- `src/app/app/contratos/[contratoId]/components/ContratoStatusEditor.tsx`
  (edição inline do status do contrato via `updateContractStatus` / `PATCH /contracts/{contractId}/status`)
- `src/app/app/contratos/[contratoId]/components/EditCotaSheet.tsx` + `src/app/app/contratos/[contratoId]/actions.ts`
  (sheet de edição sempre disponível, espelhando os campos do cadastro: número do contrato e data de assinatura
  (`updateContratoDadosAction` / `PATCH /contracts/{contratoId}/dados`); identificação (grupo, número da cota, produto),
  valores e prazo, assembleia, data de adesão; taxa administrativa total/distribuição mensal e redutor (`parcela_reduzida`,
  `percentual_reducao`, `valor_parcela_sem_redutor`); modalidades (autorização de gestão, FGTS, lance embutido); fundo de
  reserva; seguro prestamista; taxa adm. antecipada; e observações da cota — via `updateCotaDadosAction` /
  `PATCH /lances/cartas/{cota_id}`)
- `src/features/contratos/components/contrato-pdf-upload-card.tsx` (`ContratoPdfUploadCard`)

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
- separação entre payload principal do endpoint de contrato e sincronização complementar de campos extras da cota

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

## Pré-preenchimento do formulário (`prefill`)

`ContratoFormShellV2Props` aceita `prefill?: Partial<ContratoFormValues>`, mesclado por cima dos defaults em `getContratoDefaultValues` (último spread). Usado por `CompletarCadastroCarta` para abrir o form de `registerExisting` já preenchido com os dados existentes da cota (administradora, grupo, número, valores, taxas, seguro prestamista etc.).

`ContratoFormValues` inclui `existingCotaId?: string | null`, registrado via `prefill` (sem campo visível no form). Ele é mapeado por `mapContratoFormToApi` para `existing_cota_id` no payload de `registerExisting`.

## Integrações com backend

- `/contracts/from-lead`
- `/contracts/register-existing`
- `/contracts/{contractId}/document`
- `/contracts/{contractId}/document/signed-url`
- `/contracts/{contractId}/status` (via `ContratoStatusEditor`)
- `PATCH /lances/cartas/{cota_id}` (via `EditCotaSheet` / `updateCotaDadosAction`, edição da cota sempre disponível em `/app/contratos/[contratoId]`)
- `PATCH /contracts/{contratoId}/dados` (via `EditCotaSheet` / `updateContratoDadosAction`, edição de número do contrato e data de assinatura)
- sincronização complementar de campos da cota após criação

Observação de contrato com o backend:

- o POST principal envia apenas os campos aceitos pelo schema atual do backend;
- campos extras de operação da cota, como `assembleiaDia`, `taxaAdminPercentual` e `taxaAdminValorMensal`, continuam a ser sincronizados depois por `syncCotaExtraFields`;
- quando `existingCotaId` está preenchido (fluxo de "completar cadastro"), o backend atualiza a cota existente em vez de criar uma nova — ver `existing_cota_id` em `/contracts/register-existing`.

## Regras importantes observadas no frontend

- nova venda não deve nascer com status inicial avançado
- contrato existente exige `contractStatus` e `cotaSituacao`
- `fromLead` envia apenas o payload compatível com `/contracts/from-lead`
- `registerExisting` envia também `contract_status` e `cota_situacao`
- parceiro e repasse são dependentes entre si
- campos condicionais precisam limpar ou ignorar payload derivado
- opções ativas de lance fixo não podem repetir ordem nem percentual

## Terminologia financeira da feature

- usar `Taxa administrativa` ou `Taxa administrativa total` para a taxa principal da operação
- usar `Fundo de reserva` como componente separado
- usar `Base total da carta` para a base financeira formada por valor da carta + taxa administrativa total + fundo de reserva
- usar `Parcela cheia sem redutor` como valor-base de consulta comercial
- usar `Parcela com redutor (estimada)` quando a redução depender de variáveis não totalmente modeladas
- usar `Taxa adm. antecipada` quando houver cobrança antecipada
- usar `Custo total estimado` como leitura resumida da operação

Evitar:

- `Taxa adm. anual`

Regra de cálculo hoje centralizada em `src/features/contratos/utils/financial-calculations.ts`:

- totais de taxa administrativa e fundo de reserva derivam preferencialmente do percentual sobre `valorCarta`
- na falta do percentual, o frontend usa a leitura mensal multiplicada por `prazo`
- `Base total da carta` não inclui automaticamente prestamista nem taxa antecipada
- `Parcela cheia sem redutor` deriva de `baseTotalCarta / prazo`
- `Parcela com redutor` é tratada como estimativa, podendo usar a parcela cheia informada manualmente quando o corretor já tiver um valor confirmado pela administradora
- `Seguro prestamista` pode aparecer como valor informado ou estimado, mas não como regra exata da administradora quando o modelo atual não reproduz toda a composição

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
