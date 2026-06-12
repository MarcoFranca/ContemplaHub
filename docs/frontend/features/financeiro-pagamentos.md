# Feature Financeiro Pagamentos

## Responsabilidade

A rota `/app/financeiro/pagamentos` virou a tela operacional de comissao da carta:

- selecionar carta/cota/contrato;
- visualizar contexto da venda;
- configurar comissao total;
- definir cronograma de recebimento;
- configurar parceiro e repasse;
- previsualizar cronograma financeiro;
- confirmar o cronograma operacional;
- operar as excecoes mensais do recebimento.

## Rotas

- `/app/financeiro`
- `/app/financeiro/pagamentos`

Query params relevantes:

- `item_id`
- `contrato_id`

## Principais pontos de codigo

### Pagina

- `src/app/app/financeiro/pagamentos/page.tsx`

### Actions

- `src/app/app/financeiro/pagamentos/actions.ts`

### Tipos

- `src/app/app/financeiro/pagamentos/types.ts`

### Componentes

- `ComissaoOperacionalWorkspace`
- `CronogramaPreviewTable`
- `CronogramaOperacionalTable`

## Navegacao

O Financeiro agora aparece como categoria propria no menu lateral:

- `Panorama`
- `Pagamentos`

## Fluxo principal

1. O usuario seleciona a carta/contrato.
   A lista nasce da cota/carta e pode mostrar:
   - carta com contrato completo;
   - carta com numero de contrato pendente;
   - carta sem contrato ainda cadastrado.
2. A tela mostra o contexto operacional:
   - cliente;
   - cota;
   - valor da carta;
   - administradora;
   - status da cota e do contrato;
   - comissao ativa;
   - parceiro vinculado.
3. Se o numero do contrato estiver pendente, a tela solicita o cadastro sem sair do fluxo.
4. O usuario escolhe o tipo de recebimento:
   - a vista;
   - parcelado linear;
   - parcelado variavel/manual.
5. O usuario ajusta:
   - percentual total;
   - regras/parcelas;
   - parceiro e imposto retido.
6. A tela calcula o preview local:
   - comissao bruta;
   - parceiro bruto, imposto e liquido;
   - empresa liquida;
   - cronograma por parcela.
7. Ao salvar, a tela persiste a configuracao oficial da cota via `PUT /comissoes/cotas/{cota_id}`.
8. Ao confirmar o cronograma operacional, a tela:
   - salva a configuracao;
   - persiste as parcelas previstas em `public.pagamentos`;
   - reprocessa `cota_pagamento_competencias`;
   - reprocessa `comissao_lancamentos`;
   - atualiza a projecao segura do backend.
9. A aba `Operacao mensal` mostra a carteira prevista mes a mes e permite atuar so nas excecoes:
   - marcar como pago;
   - marcar como inadimplente;
   - cancelar futuros;
   - pular a proxima competencia e empurrar as demais para frente.
10. A propria tela continua exibindo:
    - lancamentos reais;
    - projecao;
    - resumo financeiro;
    - timeline.

## UX: acoes de salvar duplicadas (topo e rodape)

Os botoes "Salvar regra" e "Confirmar cronograma"/"Reprocessar cronograma" aparecem duas vezes
em `ComissaoOperacionalWorkspace`:

- no cabecalho da secao "Configuracao comercial" (acesso rapido);
- em uma barra de acoes no rodape do bloco de configuracao, apos "Configuracoes avancadas"
  (observacoes/regra da primeira competencia).

Motivo: o `ComissaoConfigSection`/`ComissaoBuilder` (base financeira, estrutura de recebimento,
cronograma de parcelas, parceiros) e longo, e o usuario preenchia tudo e precisava rolar de volta
ao topo para salvar. O botao do rodape usa os mesmos handlers (`handleSaveConfig` /
`handleGenerateProjection`), sem duplicar logica.

## Panorama financeiro

A rota `/app/financeiro` agora concentra uma leitura gerencial:

- comissao da empresa a receber;
- repasse parceiro pendente;
- valores travados por pendencia/inadimplencia;
- valores cancelados;
- timeline mensal com projetado, pago, pendente e cancelado.

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
