# Feature Simuladores

## Responsabilidade

Seção de ferramentas de apoio comercial em `/app/simuladores`. Pensada para abrigar vários
simuladores ao longo do tempo (estratégia de lance, fechamento de venda, etc.). O primeiro
é o **Simulador de Consórcio — Lance**, baseado na planilha Porto Bank.

## Simulador de Consórcio

Réplica fiel da planilha (abas Imóvel, Auto, Pesados), com cálculo 100% client-side
(sem banco). O usuário preenche os dados, vê a estimativa em tempo real e gera um **PDF**
para enviar ao cliente.

### Motor de cálculo

`src/app/app/simuladores/lib/consorcio.ts` — função pura `calcularConsorcio(input)`.
Modelo único para os 3 produtos, com variações em:

- embutido máximo: Imóvel 30%, Auto 20%, Pesados 30%;
- FGTS: apenas Imóvel;
- taxa de adesão diluída nas 12 primeiras parcelas: apenas Imóvel;
- taxas administrativas padrão por produto (editáveis na tela).

Principais saídas: saldo devedor, categoria, parcela integral/reduzida, economia mensal,
adesão diluída, representatividade do lance, embutido máximo do grupo, e estimativa
pós-contemplação em dois cenários (reduzir parcela x reduzir somente o prazo).

Também há a simulação de **lance por percentual** (ex.: lance fixo de 40%): a partir do %
desejado, mostra o valor total necessário (`categoria × %`) e o total necessário usando o
embutido (`total − lance embutido`).

> As fórmulas foram validadas célula a célula contra a planilha original (39 valores nos
> 3 produtos batem exatamente). Ao alterar o motor, revalidar com os exemplos da planilha.

### PDF

`src/app/app/simuladores/lib/pdf.ts` gera um HTML branded e abre a janela de impressão do
navegador (`window.print()`), onde o usuário escolhe "Salvar como PDF". Sem dependências
externas de PDF.

### Componentes

- `ConsorcioSimulator` (`components/ConsorcioSimulator.tsx`) — abas de produto, formulário
  (com máscaras monetárias e percentuais), taxas avançadas recolhíveis, resultado e botão
  de PDF.
- `lib/format.ts` — formatadores `brl`, `pct`, `meses`.

### Navegação

Item "Simuladores" na seção Operação (`Sidebar.tsx` e `MobileNav.tsx`).

## Comparativo Consórcio x Financiamento

Segundo simulador (`components/ComparativoSimulator.tsx`), para mostrar ao cliente a
diferença entre as duas formas de aquisição do mesmo bem.

- Motor de financiamento: `lib/financiamento.ts` (`calcularFinanciamento`) — sistemas
  **Price** (parcela fixa) e **SAC** (decrescente); aceita taxa ao mês ou ao ano
  (`anualParaMensal`). Validado contra exemplos conhecidos.
- Combinação: `lib/comparativo.ts` (`calcularComparativo`) reutiliza o motor de consórcio
  (cenário base, sem lance/redutor) e o de financiamento, retornando parcela, custo total,
  custo extra sobre o bem e a economia do consórcio.
- **Prazos independentes**: consórcio e financiamento têm prazos próprios (ex.: consórcio
  200 meses x financiamento 360/420), para refletir cotações reais de mercado.
- A **taxa de administração e o fundo de reserva do consórcio são editáveis** (variam por
  campanha; default do produto, repostos ao trocar de produto).
- **Reajuste anual estimado** (opcional): projeta o valor do bem ao fim do prazo apenas como
  contexto (crédito do consórcio acompanha a valorização; financiamento trava o preço de
  hoje). Não entra no custo total para não distorcer a comparação.
- UI lado a lado + gráfico de custo total (recharts) + PDF (`abrirComparativoPdf`).

Os dois simuladores ficam sob `components/SimuladoresHub.tsx`, que alterna entre eles na
rota `/app/simuladores` via o parâmetro `?sim=consorcio|comparativo` (default `consorcio`).
O Hub lê/escreve esse parâmetro com `useSearchParams`/`router.replace`, então as abas internas
e os **subitens do Sidebar** ("Consórcio (lance)" e "Consórcio × Financiamento", apontando para
`/app/simuladores?sim=…`) ficam sincronizados — dá para entrar direto em um simulador específico.

## Extensão futura

Novos simuladores entram como novos componentes/cards nesta mesma rota (ou sub-rotas),
reaproveitando o padrão de motor puro em `lib/` + UI client-side + exportação em PDF.
Persistência (salvar simulação por lead) e simuladores de fechamento de venda são
evoluções previstas.
