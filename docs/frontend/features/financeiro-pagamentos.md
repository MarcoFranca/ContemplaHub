# Feature Financeiro Pagamentos

## Responsabilidade

As rotas do Financeiro agora se dividem assim:

- `/app/financeiro`: panorama gerencial de comissoes e repasses da empresa.
- `/app/financeiro/pagamentos`: operacao por carta para configurar comissao e cadastrar cronogramas.

## Rotas

- `/app/financeiro`
- `/app/financeiro/pagamentos`

Query params relevantes em pagamentos:

- `item_id`
- `contrato_id`

## Principais pontos de codigo

### Paginas

- `src/app/app/financeiro/page.tsx`
- `src/app/app/financeiro/pagamentos/page.tsx`

### Actions

- `src/app/app/financeiro/pagamentos/actions.ts`

### Tipos

- `src/app/app/financeiro/pagamentos/types.ts`

### Componentes

- `FinanceiroPanorama`
- `ComissaoOperacionalWorkspace`
- `CronogramaPreviewTable`
- `CronogramaOperacionalTable`

## Navegacao

O menu lateral passa a refletir o fluxo financeiro:

- `Financeiro`
- `Panorama`
- `Pagamentos`
- `Comissoes`

## Panorama financeiro

A rota `/app/financeiro` concentra uma leitura gerencial sem alterar o backend:

- comissao da empresa projetada;
- comissao da empresa disponivel para baixa;
- comissao da empresa ja recebida;
- repasse parceiro pendente;
- repasse parceiro pago;
- valores cancelados;
- timeline mensal com projetado, pago, repasse e cancelado;
- ranking dos contratos com maior saldo operacional.

Os dados nascem da leitura consolidada de `listComissaoLancamentosAction()` e sao agregados no frontend para dashboard.

## Fluxo principal em pagamentos

1. O usuario seleciona a carta/contrato.
2. A tela mostra o contexto operacional da venda.
3. Se o numero do contrato estiver pendente, a propria tela permite atualizar esse numero.
4. O usuario configura:
   - percentual total;
   - tipo de recebimento;
   - parcelas/regras;
   - parceiro e imposto retido.
5. A tela gera o preview financeiro local.
6. Ao salvar, persiste a configuracao oficial da cota via `PUT /comissoes/cotas/{cota_id}`.
7. Ao confirmar o cronograma operacional, a tela:
   - salva a configuracao;
   - persiste as parcelas previstas em `public.pagamentos`;
   - reprocessa `cota_pagamento_competencias`;
   - reprocessa `comissao_lancamentos`;
   - atualiza a projecao segura do backend.
8. A aba `Operacao mensal` mostra a carteira prevista mes a mes e permite atuar so nas excecoes:
   - marcar como pago;
   - marcar como inadimplente;
   - reverter para previsto;
   - pular a competencia;
   - cancelar recebimentos futuros;
   - editar detalhes da parcela.

## Ajustes recentes de UX

- O painel de operacao mensal ganhou mais largura e scroll horizontal controlado para nao esmagar as colunas.
- O bloco de preview/operacao fica fixo em telas muito largas para reduzir rolagem.
- As tabs da operacao aceitam quebra de linha quando faltar espaco horizontal.

## Integracao com backend

- `GET /financeiro/contratos-options`
- `PUT /financeiro/contratos/{contrato_id}/numero`
- `POST /financeiro/contratos/{contrato_id}/cronograma`
- `POST /financeiro/pagamentos`
- `PUT /financeiro/pagamentos/{pagamento_id}`
- `POST /financeiro/pagamentos/{pagamento_id}/pular`
- `POST /financeiro/pagamentos/{pagamento_id}/cancelar-futuro`
- `GET /financeiro/contratos/{contrato_id}/pagamentos`
- `GET /comissoes/cotas/{cota_id}`
- `PUT /comissoes/cotas/{cota_id}`
- `POST /comissoes/contratos/{contrato_id}/gerar`
- `GET /comissoes/contratos/{contrato_id}`
- `GET /comissoes/contratos/{contrato_id}/resumo-financeiro`
- `GET /comissoes/contratos/{contrato_id}/timeline`
