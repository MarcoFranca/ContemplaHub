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

## Pendentes de confirmação

- se o resumo financeiro do contrato deve evoluir para um submódulo próprio
