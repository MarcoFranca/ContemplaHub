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
- `src/app/app/contratos/[contratoId]/components/HistoricoLancesPanel.tsx`

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

## Identificação do cliente/cota nos lançamentos

Cada `ComissaoLancamento` retornado por `listComissaoLancamentosAction` (via `GET /comissoes/lancamentos`) traz também `cliente_nome`, `numero_cota`, `grupo_codigo` e `contrato_numero` (enriquecidos no backend via join em `contratos`/`cotas`/`leads`). Exibidos em:

- **OperacaoMensal** (`components/OperacaoMensal.tsx`): linha do lançamento mostra cliente + grupo/cota acima do evento.
- **RepassesGestao** (`components/RepassesGestao.tsx`): cabeçalho de cada lançamento por parceiro mostra cliente + grupo/cota acima do evento/parcela.

Em ambos, o trecho cliente/grupo/cota é um `Link` para `/app/contratos/{item.contrato_id}` (detalhes da carta/contrato), com ícone `ExternalLink` indicando navegação.

## Semântica de "Dar baixa" (Operação Mensal)

"Dar baixa" em `OperacaoMensal` marca apenas que **a empresa recebeu a comissão da operadora** — não significa que o cliente pagou a parcela. O pagamento do cliente é controlado separadamente em `/app/financeiro/pagamentos`. Tooltips do botão e legenda da tela deixam essa distinção explícita.

## Breakdown de valor total no lançamento da empresa

O `valor_bruto` de um lançamento `beneficiario_tipo: "empresa"` é **apenas a parte da empresa** naquele evento — não é o valor cheio recebido da operadora. Quando existe(m) parceiro(s) associado(s) à mesma cota/ordem, `fetch_lancamentos` (backend) anexa `repasse_parceiros` ao lançamento da empresa, contendo `nome`, `valor_bruto`, `valor_liquido` e `repasse_status` de cada lançamento `beneficiario_tipo: "parceiro"` correspondente.

O **valor total recebido da operadora** para aquele evento = `valor_bruto` (empresa) + soma de `repasse_parceiros[].valor_bruto`.

Em `OperacaoMensal.tsx`, as colunas da tabela foram renomeadas de "Bruto"/"Líquido" para **"Total"/"Empresa"**:

- **Total**: se houver repasse associado, mostra `valor_bruto (empresa) + soma(repasse_parceiros.valor_bruto)` (o que entra da operadora); senão, mostra `valor_bruto` normalmente.
- **Empresa**: se houver repasse associado, mostra `valor_bruto` (a parte que fica com a empresa); senão, mostra `valor_liquido` normalmente.

Abaixo do evento, quando há repasse, aparece uma linha "Repassa `R$X` p/ `{nome do parceiro}`".

## Página de detalhes do contrato/carta (`/app/contratos/[contratoId]`)

`ComissoesContratoCard` (componente principal do card financeiro nessa página) recebe agora também `cotaId`, `historicoLances` e `contemplacao`, vindos de `getLanceCartaDetalhe(cota.id, hoje)` (action existente em `src/app/app/lances/actions/carta-actions.ts`, sem mudança de backend). A chamada é feita com `.catch(() => null)` para não quebrar a página caso a carta não tenha dados de lance.

### Visão geral (status do mês atual)

No topo do `CardContent`, uma faixa com 3 `StatusPill` (ícone + label + badge) resume o status do mês corrente (`mesAtualKey()`/`compKey()` comparando `YYYY-MM`):

- **Pagamento do cliente (mês)**: `CompetenciaStatusBadge` da competência cujo `competencia` cai no mês atual.
- **Comissão da empresa (mês)**: `ComissaoStatusBadge` do lançamento `beneficiario_tipo: "empresa"` do mês.
- **Repasse ao parceiro (mês)**: `RepasseStatusBadge` do lançamento `beneficiario_tipo: "parceiro"` do mês.

Quando não há item correspondente no mês, exibe texto "Sem competência/lançamento/parceiro no mês".

### Aba "Lances"

A `Tabs` do card ganhou uma 4ª aba ("Lances", ao lado de Competências/Lançamentos/Timeline), renderizando `HistoricoLancesPanel` (`src/app/app/contratos/[contratoId]/components/HistoricoLancesPanel.tsx`):

- mostra destaque de contemplação (quando `contemplacao` existe): data, percentual do lance e motivo;
- lista `historico_lances` com badge de resultado (`contemplado`/`desclassificado`/`não_contemplado`/pendente), tipo, percentual+valor e data da assembleia/origem;
- link "Ver carta completa" para `/app/lances/{cotaId}`.

### Valores em "Resumo financeiro" (ResumoPill)

`resumoFinanceiro.totais.*` chega do backend como strings numéricas (ex.: `"12000.20"`). `ComissoesContratoCard` aplica `fmtMoney()` (formatação `pt-BR`/`BRL`) antes de exibir em cada `ResumoPill` (Total bruto, Empresa bruto, Parceiro bruto, Imposto parceiro, Parceiro líquido).

### Ações rápidas na "Visão geral"

- **Pagamento do cliente (mês)**: link "Gerenciar" para `/app/financeiro/pagamentos?contrato_id={contratoId}`.
- **Comissão da empresa (mês)**: quando há lançamento no mês, exibe `LancamentoStatusDialog` para editar status/competência/observações diretamente.
- **Repasse ao parceiro (mês)**: quando há lançamento no mês, exibe `RepasseDialog` para marcar repasse como pago/pendente.

### Configurar comissão do contrato

Botão "Configurar comissão" no cabeçalho do card leva para `/app/financeiro/pagamentos?contrato_id={contratoId}`, onde `ComissaoOperacionalWorkspace` permite criar/editar a configuração comercial da comissão (percentuais, parceiros, regras) — reaproveitado sem duplicar o editor nesta página.

### `LancamentosTable` — prop `showContratoLink`

Novo prop opcional `showContratoLink` (default `true`). Em `/app/comissoes`, o link "ver contrato" continua aparecendo na coluna Ações. Na aba "Lançamentos" do card do contrato, é passado `showContratoLink={false}` para remover o link redundante (já estamos na página do contrato).

### Cards "Informações da cota"

O card "Seguro prestamista", antes separado, foi incorporado como um `InfoMiniCard` dentro da grade "Informações da cota" (mostra percentual + valor mensal, ou "Não contratado").

### Coluna "Assembleia" — texto auxiliar

Na 2ª linha da célula "Assembleia" (`CompetenciasTable`), quando `participou_assembleia === true` e não há `motivo_nao_participacao`, exibe-se "Sorteio" (em vez de "—"). Isso reflete que, ao participar da assembleia sem um lance livre/fixo registrado, a cota concorre pelo sorteio padrão daquele mês. É apenas texto informativo no frontend — não há, ainda, cruzamento com o histórico de lances para diferenciar "lance dado" de "sorteio".

### Badges de status de competência

`CompetenciasTable` agora usa `CompetenciaStatusBadge` (novo componente em `status-badges.tsx`, cobrindo os 6 valores de `CompetenciaStatus`) na coluna Status, e colore as colunas Pagamento/Comissão (verde quando `pago`/`gera_comissao`, cinza caso contrário).

### Ações na tabela de Competências

`CompetenciasTable` ganhou uma coluna "Ações" com `CompetenciaPagamentoDialog` (novo componente), que permite editar o pagamento da competência (status, valor, vencimento, data de pagamento, observações) chamando `editFinanceiroPagamentoAction` (já existente em `src/app/app/financeiro/pagamentos/actions.ts`), usando `item.pagamento_id` da `CotaPagamentoCompetencia`. Quando a competência ainda não possui `pagamento_id` (cronograma não gerado), o botão fica desabilitado com tooltip explicativo.

`editFinanceiroPagamentoAction` agora também chama `revalidatePath(\`/app/contratos/${contrato_id}\`)`, para que a edição reflita imediatamente na página de detalhes do contrato.

### Ações rápidas na tabela de Lançamentos (`LancamentoQuickActions`)

Novo componente `LancamentoQuickActions` (`src/app/app/comissoes/components/LancamentoQuickActions.tsx`) replica, dentro de `LancamentosTable`, o padrão de botões de ícone usado em `OperacaoMensal` ("AÇÕES": ✓ verde, 🔔 laranja, ⊘ vermelho/rosa, ↺ cinza), para lançamentos `beneficiario_tipo: "empresa"`:

- **Previsto (sem cobrança)**: ✓ dar baixa (`marcarPagoAction`), 🔔 marcar para cobrança (`marcarParaCobrancaAction`, com modal de motivo), ↳ **pular competência** (`skipComissaoLancamentoAction`), ⊘ cancelar este lançamento (`marcarCanceladoAction`, com modal de confirmação).
- **Previsto + inadimplente**: ✓ dar baixa, 🔕 remover alerta de cobrança (`removerFlagCobrancaAction`).
- **Pago/Cancelado**: ↺ reverter para previsto (`reverterPrevistoAction`).

> **Pular competência** (ícone ↳ `CornerDownRight`): marca o mês como sem pagamento (ex.: assembleia ainda não iniciada) e **empurra as competências futuras +1 mês**. Disponível em todos os ambientes de gestão dos lançamentos — `OperacaoMensal` (aba Operação), `LancamentoQuickActions` (aba Lançamentos e detalhes do contrato) e no cronograma de `/app/financeiro/pagamentos` (que já tinha "Pular competência"). Chama `POST /comissoes/lancamentos/{id}/pular`, que resolve o pagamento correspondente e reaproveita o mesmo deslocamento/reprocessamento do Financeiro. Retorna `409` (com toast explicativo) quando o cronograma de pagamentos ainda não foi gerado para aquela competência.

Após cada ação, chama `router.refresh()` (não depende de `revalidatePath` adicional). Renderizado ao lado do `LancamentoStatusDialog`/`RepasseDialog` existentes — não os substitui, apenas adiciona o atalho de 1 clique também presente em `/app/comissoes`. Como `LancamentosTable` é compartilhada, esse atalho aparece tanto em `/app/comissoes` (aba "Todos os lançamentos") quanto na aba "Lançamentos" da página de detalhes do contrato — mantendo a mesma UX de avaliação/alteração rápida da cota nos dois lugares.

## Pendentes de confirmação

- se o resumo financeiro do contrato deve evoluir para um submódulo próprio
