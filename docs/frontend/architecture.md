# Arquitetura do frontend

## Stack

- Next.js `16.0.10` com App Router
- React `19`
- TailwindCSS `v4`
- shadcn/ui sobre Radix
- TypeScript
- Supabase SSR para autenticação e leitura de perfil
- Backend HTTP externo consumido via `NEXT_PUBLIC_BACKEND_URL` ou `BACKEND_URL`

## Estrutura principal

### `src/app`

Responsável por:

- `layout.tsx` raiz com fontes, tema, toasts, trackers globais e metadados
- grupos de rota de marketing e auth
- área autenticada principal em `src/app/app`
- portal de parceiros em `src/app/partner`
- páginas públicas como home, propostas públicas e cadastro por token
- BFFs em `src/app/api`

### `src/features`

Responsável por blocos mais próximos do modelo ideal por domínio:

- `contratos`: schema Zod, tipos, mappers, hooks de submit, actions e form shell premium
- `diagnostic`: engine e persistência do diagnóstico
- `leads`: catálogos e inputs reutilizáveis ligados ao domínio

### `src/components`

Responsável por composição compartilhada:

- `app`: shell autenticado, sidebar, header e elementos comuns da experiência interna
- `ui`: wrappers shadcn/ui
- `marketing`: landing e blocos públicos
- `form`: inputs especializados
- `system`: componentes globais de estado de rede e pending
- `auth`, `partner`, `lead`, `commun`, `theme`

### `src/lib`

Responsável por infraestrutura do frontend:

- auth server-side
- clientes Supabase server/client
- helpers de chamada ao backend
- formatadores e máscaras
- utilitários de UI e domínio

## Relação entre rotas e features

A arquitetura atual é híbrida:

- rotas em `src/app/app/*` costumam conter a composição final da feature e parte relevante da lógica de dados
- `src/features/*` concentra principalmente contratos e diagnóstico reutilizável
- algumas features ainda não têm pasta própria em `src/features`, embora já existam como domínio de negócio completo na navegação

Exemplos:

- `contratos` usa `src/features/contratos/*` como núcleo de formulário e integra páginas em `src/app/app`, `src/app/partner`, `src/app/app/carteira` e pontos de entrada de lead/kanban
- `leads` mistura actions em `src/app/app/leads/actions*.ts`, UI em `src/app/app/leads/ui/*` e componentes auxiliares em `src/features/leads/*`
- `carteira`, `comissões`, `parceiros` e `lances` vivem principalmente dentro de `src/app/app/*`

## Fluxo macro do produto

O frontend já expõe um fluxo de domínio em camadas.

### 1. Pré-venda comercial

- `lead` é a unidade do funil;
- diagnóstico e proposta pertencem a esse contexto.

### 2. Formalização

- o `contrato` nasce na formalização/fechamento;
- ele formaliza a operação, mas não substitui a cota.

### 3. Operação da cota

- a `cota` é o ativo operacional do consórcio;
- assembleia, lance e contemplação pertencem a esse domínio;
- Hoje a entrada visual principal dessa camada é `/app/lances`,
  porém o domínio pertence a `cotas`.

### 4. Pós-venda operacional

- `carteira` é a camada de pós-venda;
- ela organiza cliente, cartas e contratos para acompanhamento contínuo.

## Contrato e cota

- contrato != cota
- o contrato formaliza a operação
- a cota é o ativo operacional do consórcio
- assembleia, lance e contemplação pertencem à cota
- se o contrato refletir marcos operacionais, isso deve ser lido como efeito derivado, não como origem do evento

## Modos de criação de contrato

O frontend possui dois fluxos distintos para criação/cadastro de contrato, refletidos em `ContratoFormMode` e usados por `useContratoFormSubmit`.

### 1. Nova venda (fromLead)

Origem:
- lead vindo do funil

Comportamento:
- contrato nasce como fluxo comercial de formalização
- usa `createContratoFromLeadAction`
- não permite definir estados avançados de contrato
- não permite iniciar a cota em situação avançada
- é aberto a partir de lead/kanban pela mesma shell reutilizável da feature

Uso:
- venda nova
- operação comercial padrão

### 2. Cadastro operacional (registerExisting)

Origem:
- cliente já ativo na carteira

Comportamento:
- usa `registerExistingContratoAction`
- permite definir status inicial do contrato
- permite definir situação inicial da cota
- representa contrato/carta já existentes fora do fluxo comercial novo
- é aberto a partir da carteira pela mesma shell reutilizável da feature

Uso:
- importação de carteira
- cadastro manual
- clientes antigos

Regra crítica:

- esses fluxos não devem ser misturados
- `fromLead` pertence à formalização de nova venda
- `registerExisting` pertence ao cadastro operacional de carteira/base existente

## Padrões arquiteturais observados

### 1. Server Components como padrão de página

As páginas principais são assíncronas e server-side:

- validam sessão e `orgId`
- lêem `searchParams`
- carregam dados no servidor
- montam a composição final com componentes client somente quando há interação rica

### 2. Server Actions para operação autenticada

Há uso consistente de `"use server"` para:

- mover estágio de lead
- criar lead manual
- listar e mutar carteira
- operar comissões e repasses
- criar parceiro e convite
- submeter fluxo de contrato

### 3. BFFs em `app/api`

Os BFFs aparecem quando o frontend precisa:

- encaminhar token/sessão do usuário
- isolar upload/download de documento
- expor endpoint consumível pelo client mantendo controle server-side
- atender fluxos públicos por hash ou token

### 4. Schemas e mappers

O padrão mais maduro está em `src/features/contratos`:

- schema Zod em `schemas/contrato-base.schema.ts`
- tipos em `types/contrato-form.types.ts`
- defaults em `utils/contrato-default-values.ts`
- mapper para payload do backend em `utils/contrato-payload-mappers.ts`
- hook de submit em `hooks/use-contrato-form-submit.ts`

Esse conjunto é a referência atual mais próxima do padrão desejado no `AGENTS.md`.

## Padrões de componentes

### Componentes de composição

Exemplos:

- `AppShell`
- `PartnerShell`
- `DashboardShell`
- `ContratoFormShellV2`
- `CreateContratoSheet`

Função:

- organizar layout, navegação e hierarquia
- delegar renderização de subpartes

### Componentes de seção

Exemplos:

- `IdentificacaoSection`
- `CotaFinanceiraSection`
- `FormalizacaoSection`
- `CondicoesOperacionaisSection`
- `ParceiroSection`

Função:

- encapsular trechos coesos de um fluxo
- reduzir acoplamento visual de páginas grandes
- manter a separação entre dados da cota, formalização do contrato e estados iniciais

### Componentes de ação contextual

Exemplos:

- `CreateLeadSheet`
- `CreateCarteiraClienteSheet`
- `CreateCarteiraCartaSheet`
- `CreateContratoSheet`
- `RepasseDialog`
- `LancamentoStatusDialog`

Função:

- abrir sheets/dialogs
- enviar ação
- atualizar rota ou estado após persistência

## Padrões de segurança

- autenticação priorizada no servidor com `supabaseServer()`
- leitura de perfil via `getCurrentProfile()`
- multi-tenant aplicado via `orgId`
- chamadas ao backend incluem `X-Org-Id`
- fluxos que exigem autorização explícita usam `Authorization: Bearer <access_token>`
- service role aparece apenas em código server-side

## Camadas de estado do sistema

O frontend já lida com pelo menos três camadas de estado distintas.

### Status do contrato

- `pendente_assinatura`
- `pendente_pagamento`
- `alocado`
- `contemplado`
- `cancelado`

### Situação da cota

- `ativa`
- `contemplada`
- `cancelada`

### Status da carteira

- `ativo` observado no código
- demais estados ficam `pendente de confirmação`

Regra de leitura:

- não misturar status de contrato com situação de cota;
- não usar status da carteira para inferir estado de contrato ou da cota.
- não usar status do contrato para inferir assembleia, lance ou contemplação.

## Inconsistências e dívida técnica observadas

- `src/features` ainda não cobre todos os domínios operacionais presentes na navegação
- existe duplicação/ruído de arquivos em `src/features/contratos/components/form-shell/ section-base/*` e `.../form-shell/section-base/*`
- a rota de contratos existe mais como detalhe de contrato do que como módulo listável próprio
- parte das integrações usa `NEXT_PUBLIC_BACKEND_URL`, parte usa `BACKEND_URL`, e parte usa helper centralizado

## Pendentes de confirmação

- o papel definitivo de `src/features/leads/*` versus `src/app/app/leads/*` como fronteira arquitetural
- se o módulo de `lances` deve ser documentado futuramente como feature separada ou permanecer como subdomínio operacional de `cotas`
- se os arquivos duplicados em `form-shell/ section-base` são legado morto ou ainda fazem parte do build
