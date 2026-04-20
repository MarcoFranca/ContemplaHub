# Formulário crítico: cadastro de carta

## Onde vive

O formulário de cadastro de carta é implementado principalmente por:

- `src/features/contratos/components/contrato-form-shell-v2.tsx`
- `src/features/contratos/components/create-contrato-sheet.tsx`
- `src/features/contratos/components/sections/formalizacao-section.tsx`
- `src/features/contratos/components/contrato-pdf-upload-card.tsx`
- `src/features/contratos/schemas/contrato-base.schema.ts`
- `src/features/contratos/utils/contrato-payload-mappers.ts`
- `src/features/contratos/hooks/use-contrato-form-submit.ts`

Pontos de entrada:

- fluxo a partir de lead
- fluxo a partir da carteira
- `CreateCarteiraCartaSheet`
- `CreateContratoSheet`

## Estrutura do formulário

O shell é multi-etapas:

1. `Identificação`
2. `Carta / cota`
3. `Formalização`
4. `Estado inicial` apenas no modo `registerExisting`
5. `Revisão final`

Seções relevantes:

- identificação: administradora, grupo, número da cota
- carta / cota: produto, valor da carta, prazo, valor da parcela, data de adesão, assembleia, taxas e modalidades
- formalização: número do contrato, data de assinatura, comissão, parceiro e repasse
- estado inicial: `contractStatus` e `cotaSituacao` apenas em `registerExisting`
- revisão final: modo atual, resumo da carta, resumo do contrato e documento/PDF quando já existir `contractId`

## Validação

Validação via Zod com dois modos:

- `fromLeadSchema`
- `registerExistingSchema`

## Regras condicionais relevantes

- `parcelaReduzida=true` exige `percentualReducao`
- `embutidoPermitido=true` exige `embutidoMaxPercent`
- `seguroPrestamistaAtivo=true` exige percentual e/ou valor mensal
- `taxaAdminAntecipadaAtivo=true` exige forma de pagamento
- pagamento `avista` aceita somente `1` parcela
- pagamento `parcelado` exige mais de uma parcela
- parceiro sem repasse é inválido
- repasse sem parceiro é inválido
- no modo `registerExisting`, `contractStatus` e `cotaSituacao` são obrigatórios
- opções ativas de lance fixo não podem repetir ordem ou percentual

## Payload enviado ao backend

O payload é montado por `mapContratoFormToApi`.

Campos principais:

- `lead_id`
- `deal_id`
- `administradora_id`
- `grupo_codigo`
- `numero_cota`
- `produto`
- `valor_carta`
- `prazo`
- `valor_parcela`
- componentes financeiros e operacionais
- `percentual_comissao`
- `parceiro_id`
- `repasse_percentual_comissao`
- `contract_status`
- `cota_situacao`

Observações:

- valores monetários são serializados como string formatada
- percentuais são serializados com quatro casas
- payload derivado é limpo quando a flag correspondente está desligada
- `fromLead` não envia `contract_status` nem `cota_situacao`
- `registerExisting` envia `contract_status` e `cota_situacao` de forma separada

## Fluxo de persistência

1. O formulário valida localmente.
2. O hook escolhe entre `createContratoFromLeadAction` e `registerExistingContratoAction`.
3. A action obtém sessão Supabase e `orgId`.
4. O backend recebe o payload principal.
5. Após sucesso, `syncCotaExtraFields` complementa campos da cota.
6. O fluxo pode seguir para upload de documento e ações pós-salvamento.

## Riscos comuns de UX e persistência

- conversão ambígua entre moeda/percentual se outro formulário tentar reimplementar o mapper
- persistência parcial caso o contrato principal salve e a sincronização complementar falhe
- erro de entendimento entre `status do contrato` e `situação da cota`
- reuso indevido do modo `registerExisting` para venda nova
- existência de sheets legados fora da feature de contratos pode gerar regressão se voltarem a ser usados sem alinhamento

## Pendentes de confirmação

- o comportamento esperado quando `syncCotaExtraFields` falha após criação bem-sucedida do contrato principal
