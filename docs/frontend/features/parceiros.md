# Feature Parceiros

## Responsabilidade

O módulo de parceiros gerencia parceiros de negócio e seus acessos ao portal.

Responsabilidades observadas:

- listar parceiros
- cadastrar e editar parceiro
- ativar ou desativar parceiro
- convidar e gerenciar usuário parceiro
- validar possibilidade de exclusão
- ver o **panorama/detalhe** de cada parceiro (clientes, cartas, repasses, extrato)
- visão **gerencial/ranking** com gráficos (vendas, volume, cancelamento, repasses)

## Principais pontos de código

### Rota

- `src/app/app/parceiros/page.tsx` (lista/cadastro)
- `src/app/app/parceiros/[parceiroId]/page.tsx` (detalhe/panorama do parceiro)
- `src/app/app/parceiros/gerencial/page.tsx` (visão gerencial / ranking)

No `Sidebar`, "Parceiros" tem subitens: **Cadastro** (`/app/parceiros`) e **Gerencial** (`/app/parceiros/gerencial`).

### Actions

- `src/app/app/parceiros/actions.ts`

### Componentes

- `ParceiroSheet`
- `ParceirosTable`
- `ParceiroStatusBadge`
- `ParceiroAcessoBadge`
- `DeleteParceiroDialog`

## Schemas e actions relevantes

Não há schema Zod centralizado exposto nesta pasta.

Actions relevantes:

- `listParceirosAction`
- `listPartnerUsersAction`
- `createParceiroAction`
- `updateParceiroAction`
- `invitePartnerUserAction`
- `updatePartnerUserAction`
- `toggleParceiroAction`
- `resendInviteAction`
- `getParceiroDeleteCheckAction`
- `deleteParceiroAction`
- `getParceiroExtratoAction` — consome `GET /comissoes/parceiros/{id}/extrato` (retorna `parceiro`, `items` = lançamentos de repasse e `resumo`). Tipado por `ParceiroExtratoResponse` (reutiliza `ComissaoLancamento`/`ComissaoResumo` de `comissoes/types`).

## Detalhe do parceiro (`/app/parceiros/[parceiroId]`)

Página server-side que monta um panorama do parceiro a partir do extrato (sem novo endpoint no backend — derivações são feitas no frontend a partir de `items`):

- **Header**: nome, status do parceiro, status de acesso ao portal (cruzado com `listPartnerUsersAction`), e-mail/telefone (com máscara) e CPF/CNPJ.
- **KPIs**: Clientes distintos, Cartas (cotas) vinculadas, Repasse total líquido, A pagar (soma + contagem de repasses `pendente`) e Já pago (repasses `pago`).
- **Cartas vinculadas**: agrupadas por `cota_id` (cliente, grupo/cota, nº de lançamentos, repasse líquido, pendências); cada linha linka para `/app/contratos/{contrato_id}`.
- **Extrato de repasses**: lançamentos ordenados por competência (bruto, líquido, badge de status de repasse).

Acessível pelo botão "Ver detalhes" em `ParceirosTable`.

## Visão gerencial / ranking (`/app/parceiros/gerencial`)

Subcategoria separada do cadastro para não poluir a página inicial. Página server-side lê o intervalo `?de=YYYY-MM&ate=YYYY-MM` (default mês atual; ainda aceita `?mes=` legado), converte para `competencia_de` (1º dia de `de`) / `competencia_ate` (último dia de `ate`) e chama `getParceirosRankingAction` → `GET /comissoes/parceiros/ranking`.

Componente client `ParceirosRankingView` (recharts):
- **Seletor de período**: dois `<input type="month">` (De/Até) + atalhos rápidos (Mês atual, Últimos 3/6/12 meses, Ano atual) que navegam via `?de=&ate=`.
- **KPIs do período**: vendas, volume vendido, repassado, a repassar.
- **Gráficos** (barras horizontais, top 7): Ranking de vendas (nº de cartas) e Volume de cartas vendidas; e um gráfico empilhado **Repasses pago × a pagar**.
- **Ranking completo** (tabela com medalhas 🥇🥈🥉): vendas, volume, taxa de cancelamento (badge colorido por severidade) e repasse pago/pendente; cada linha linka para o detalhe do parceiro.

Notas de métrica: vendas/volume/repasses são do **período selecionado**; a **taxa de cancelamento** considera a carteira vitalícia do parceiro (cotas canceladas / total de cotas). O modelo pensado para, no futuro, embasar bonificação por desempenho.

## Fluxo principal do usuário

1. O operador acessa `/app/parceiros`.
2. Consulta total de parceiros e acessos.
3. Cria ou edita parceiro via `ParceiroSheet`.
4. Pode liberar acesso ao portal, reenviar convite ou desativar.
5. A exclusão exige checagem prévia.

## Integrações com backend

- endpoints de parceiros
- endpoints de partner users
- fluxo de convite e reenvio de acesso

Observação:

- os caminhos exatos são montados em `src/app/app/parceiros/actions.ts` a partir de constantes internas do módulo

## Relação com outras features

- parceiros aparece em contratos para configuração de repasse/comissionamento
- parceiros também alimenta filtros de comissões
- o portal em `/partner` depende desse domínio para autorização e navegação

## Pendentes de confirmação

- o modelo exato de sincronização entre parceiro comercial e usuário parceiro do portal
