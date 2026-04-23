# Frontend do ContemplaHub

Documentação técnica viva do frontend em Next.js 16 com App Router, TailwindCSS, shadcn/ui e TypeScript.

## Objetivo

Esta pasta existe para acelerar manutenção, onboarding e leitura arquitetural do frontend real do produto.

Ela documenta:

- organização atual do código
- rotas e layouts principais
- padrões de UI e formulários
- uso de Server Components, Server Actions e BFFs
- responsabilidades por domínio de negócio

## Índice

- [Arquitetura](./architecture.md)
- [Rotas e navegação](./routing.md)
- [Design system e UI](./design-system.md)
- [Dados e integrações](./data-fetching-and-actions.md)
- [Feature Leads](./features/leads.md)
- [Feature Meta Integrações](./features/meta-integracoes.md)
- [Feature Carteira](./features/carteira.md)
- [Feature Contratos](./features/contratos.md)
- [Feature Cotas](./features/cotas.md)
- [Feature Comissões](./features/comissoes.md)
- [Feature Parceiros](./features/parceiros.md)
- [Formulário: cadastro de carta](./forms/cadastro-carta.md)
- [Formulário: cadastro de cliente](./forms/cadastro-cliente.md)

## Visão rápida

O frontend está organizado em formato híbrido:

- `src/app/` concentra rotas, layouts, páginas públicas, áreas autenticadas, portal do parceiro e BFFs.
- `src/features/` concentra parte das features reutilizáveis, hoje principalmente `contratos`, `diagnostic` e parte de `leads`.
- `src/components/` concentra componentes compartilhados, shell da aplicação, blocos de marketing, auth, sistema e wrappers do shadcn/ui.
- `src/lib/` concentra autenticação, clientes Supabase, helpers de backend, máscaras e utilitários.

## Leitura correta do domínio

- `lead` é a unidade comercial de entrada
- `contrato` nasce na formalização/fechamento
- `cota` é o ativo operacional do consórcio
- `assembleia`, `lance` e `contemplação` pertencem à operação da cota
- `carteira` representa o pós-venda operacional em dimensão própria

## Observações importantes

- A organização desejada pelo `AGENTS.md` do frontend é orientada a feature/domínio, mas a implementação atual ainda distribui parte relevante da lógica em `src/app/app`.
- `leads` e `contratos` já possuem mais estrutura de feature reutilizável.
- `carteira`, `comissões`, `parceiros` e `cotas/lances` ainda dependem fortemente de páginas, actions e componentes locais dentro das rotas.
- Ambiguidades ou inconsistências reais encontradas no código são registradas como `pendente de confirmação`, em vez de serem assumidas como comportamento definitivo.

## Áreas cobertas nesta documentação

- área pública e marketing
- autenticação
- shell autenticado `/app`
- portal `/partner`
- domínios operacionais de leads, carteira, contratos, cotas, comissões e parceiros
- integrações administrativas de captura, como Meta Lead Ads
- formulários críticos de cadastro operacional
