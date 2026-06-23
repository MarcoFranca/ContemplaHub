# Feature Lances (operação mensal)

## Responsabilidade

Tela operacional do lance do mês em `/app/lances`. Organiza as cartas por
**operadora → cliente → carta** para o operador executar a rotina de assembleia:
ver qual lance dar, registrar o lance dado na operadora (ou o sorteio) e manter o
histórico da carta para consultas futuras e justificativa de estratégia.

## Fluxo principal do usuário

1. Abre `/app/lances` e escolhe a competência/visualização (Pendentes, Planejados,
   Baixados, Sem lance, Todas).
2. Navega por operadora (ex.: Porto) e cliente.
3. No card da carta vê o essencial para decidir: operadora, cliente, grupo/cota,
   **tipo de lance preferencial**, valor, assembleia e o **lance sugerido**.
4. Executa a ação direto no card (Planejar lance, Sem lance, Registrar lance,
   Contemplar, Cancelar) e/ou edita a carta.
5. Para contexto mais profundo, abre **"Detalhes & histórico"** (sheet) sem sair da tela.

## Layout: Cards x Lista

`LancesTable` tem um alternador de layout (estado local `layout: "cards" | "lista"`):
- **Cards** (default): agrupado por operadora → cliente, com `CartaCard` completo.
- **Lista** (`LancesCompactList`): uma linha por carta (cliente · operadora · grupo/cota · lance preferencial sugerido com %/valor · data de assembleia · status do mês · ações), agrupada por operadora e ordenada por status do mês e assembleia. Mais escaneável na hora de lançar. Os filtros de visualização (`OperacaoTabs`) e "Ocultar baixados" valem para os dois layouts (ambos consomem `filteredItems`); as ações reutilizam `LanceActions` + `CartaDetailsSheet`.

`LanceActions` aceita `compact?: boolean` — na visão Lista os botões ficam **só com ícone** (rótulo no `title`), economizando espaço. A barra de filtros (`lances-filters`) e a toolbar (`OperacaoTabs` + alternador de layout + "Ocultar baixados") foram compactadas (controles `h-9`/`h-8`, sem o card descritivo) para ocupar menos espaço vertical.

Terminologia: a ação/aba "Sem lance" foi renomeada para **"Sorteio"** (ícone de dado `Dice5`) — representa a cota participando do mês apenas pelo sorteio, sem lance. O status interno continua `sem_lance`.

## Card x Sheet (decisão de UX)

Para manter o card enxuto e a operação rápida, o `CartaCard`
([lances-table.tsx](../../../src/app/app/lances/components/lances-table.tsx)) mostra
apenas dados fundamentais + ações. O conteúdo de apoio mora no sheet
`CartaDetailsSheet`
([CartaDetailsSheet.tsx](../../../src/app/app/lances/components/CartaDetailsSheet.tsx)):

- detalhe do lance do mês (`LanceMesCard`);
- contexto estratégico (`StrategyPanel`);
- **histórico de lances já dados** (assembleia, tipo, %, valor, origem, resultado),
  carregado sob demanda via `getLanceCartaDetalhe(cotaId, competencia)`. O histórico
  também inclui os meses marcados como **"sem lance"** (sorteio intencional), permitindo
  distinguir, na análise, sorteio decidido de esquecimento (assembleia sem registro);
- **edição da estratégia/objetivo** da carta (campo de texto), salvo por
  `salvarEstrategiaCartaAction` (PATCH parcial, só `estrategia`/`objetivo`).

`LanceMesCard` e `StrategyPanel` deixaram de ser renderizados inline no card e passaram
a ser reutilizados dentro do sheet.

## Actions relevantes

- `listLancesCartas`, `getLanceCartaDetalhe` — leitura (via backend FastAPI).
- `salvarControleMensalAction`, `registrarLanceAction`, `contemplarCotaAction`,
  `cancelarCotaAction`, `reativarCotaAction` — operação mensal.
- `updateCartaAction` — edição completa da carta (`EditCartaSheet`).
- `salvarEstrategiaCartaAction` — edição focada de estratégia/objetivo a partir do sheet.

Todas as mutações passam pelo backend (`/lances/cartas/...`); o frontend não escreve
direto no banco.

## Componentes

- `LancesTable` / `CartaCard` (card enxuto + barra de ações)
- `LancesCompactList` (visão "Lista" resumida — uma linha por carta para escanear rápido na hora de dar os lances)
- `CartaDetailsSheet` (apoio + histórico + edição de estratégia)
- `EditCartaQuickAction` / `EditCartaSheet`
- `LanceActions`
- `LanceMesCard`, `StrategyPanel` (reutilizados no sheet)

## Importar PDF da Porto (pré-preencher cadastro)

Componente reutilizável `ImportarDocumentoButton`
([components/ImportarDocumentoButton.tsx](../../../src/app/app/lances/components/ImportarDocumentoButton.tsx))
+ server action `importarDocumentoCartaAction` enviam o PDF (extrato do consorciado ou
proposta/apólice) para `POST /lances/cartas/importar-documento`, que devolve uma sugestão de
campos (extração via `pypdf` no backend — específico do layout Porto). O resultado **apenas
pré-preenche** o formulário; o usuário revisa e salva.

Integrado em duas telas:
- **Editar carta** ([EditCartaSheet.tsx](../../../src/app/app/lances/components/EditCartaSheet.tsx)):
  preenche o estado local (grupo, cota, produto, valores, prazo, dia da assembleia, data de
  adesão, embutido).
- **Cadastro na carteira** (`features/contratos/components/contrato-form-shell-v2.tsx`, modo
  `registerExisting`): preenche o react-hook-form via `setValue` (os campos mascarados —
  `MoneyField`/`DateField` — reagem ao novo valor) e, após o contrato ser salvo, **anexa
  automaticamente** o PDF via `POST /api/contracts/{id}/document`.

Ver também [cotas.md](cotas.md) para o domínio persistido por trás da tela.
