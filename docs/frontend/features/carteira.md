# Feature Carteira

## Responsabilidade

Carteira representa a base de clientes já em operação ou em acompanhamento pós-venda, com visualização por cliente e por carta.

Responsabilidades observadas:

- listar clientes da carteira
- alternar visão por clientes ou cartas
- filtrar, ordenar e buscar
- criar cliente da carteira
- cadastrar nova carta para cliente existente
- reabrir negociação a partir da carteira

## Principais pontos de código

### Rotas

- `src/app/app/carteira/page.tsx`
- `src/app/app/carteira/[leadId]/contratos/novo/page.tsx`

### Actions

- `src/app/app/carteira/actions/clientes.ts`
- `src/app/app/carteira/actions/cartas.ts`
- `src/app/app/carteira/actions/index.ts`
- `src/app/app/carteira/actions/shared.ts`
- `src/app/app/carteira/novo/actions.ts`

### Componentes

- `src/app/app/carteira/components/clientes-cards.tsx`
- `src/app/app/carteira/components/clientes-table.tsx`
- `src/app/app/carteira/components/cartas-list.tsx`
- `src/app/app/carteira/components/cliente-cartas-sheet.tsx`
- `src/app/app/carteira/components/carteira-filters.tsx`
- `src/app/app/carteira/ui/CreateCarteiraClienteSheet.tsx`
- `src/app/app/carteira/ui/CreateCarteiraCartaSheet.tsx`

## Schemas e actions relevantes

- não há schema Zod concentrado da carteira
- `createClienteCarteiraAction` monta payload a partir de `FormData`
- a criação de carta reutiliza a feature de contratos por meio de `ContratoFormShellV2`

## Fluxo principal do usuário

1. O operador abre `/app/carteira`.
2. Escolhe visão `clientes` ou `cartas`.
3. Aplica filtros e ordenação.
4. Pode criar um novo cliente via sheet lateral.
5. Pode selecionar um cliente e abrir o fluxo de cadastro de carta.
6. Em alguns casos, pode reativar o cliente para o fluxo de leads.

## Integrações com backend

- `/carteira/clientes`
- chamadas agregadas feitas em `loadCarteiraUniverse`
- atualização de estágio do lead via `/leads/{leadId}/stage`
- reuso de opções de contrato via `getContratoFormOptions()`

## Observações arquiteturais

- carteira é um dos pontos mais híbridos da aplicação: página server-side, actions locais e reuso de feature de contratos
- a visão por carta depende de composições derivadas de cotas, contratos e últimos lances
- a carteira não implementa seu próprio form de carta; ela orquestra o form de contratos

## Pendentes de confirmação

- o limite conceitual entre `carteira` e `cotas` ainda depende da forma como o time quer enxergar o operacional
- `pendente de confirmação`: se a criação de cliente da carteira deve futuramente passar a usar schema Zod compartilhado
