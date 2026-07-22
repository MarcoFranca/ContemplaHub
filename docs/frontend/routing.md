# Rotas e navegação

## Visão geral

O App Router está organizado em quatro zonas principais:

- público e marketing
- autenticação
- aplicação autenticada principal em `/app`
- portal do parceiro em `/partner`

## Seguro Azos

- `/app/seguros-azos`: carteira de apólices e comissões sincronizadas da Azos; exige sessão e
  organização ativa.

## Layouts relevantes

### `src/app/layout.tsx`

Layout raiz para todo o projeto.

Responsabilidades:

- fontes `Geist` e `Geist Mono`
- `ThemeProvider`
- `SonnerProvider`
- `GlobalNetTracker`
- `GlobalPending`
- metadados globais e OG image

### `src/app/app/layout.tsx`

Layout da área autenticada principal.

Responsabilidades:

- validar usuário autenticado
- redirecionar parceiro para `/partner`
- permitir sessão autenticada sem `orgId` para concluir onboarding em `/app/organizacao`
- aplicar `AppShell`
- aplicar fundo visual premium com `SectionFX`

Observações:

- quando o usuário ainda não tem organização, o shell continua acessível, mas a navegação lateral fica reduzida ao essencial (`Painel` e `Organização`);
- isso evita o ciclo de logout para contas novas e preserva o isolamento multi-tenant até a criação da primeira organização.

### `src/app/partner/layout.tsx`

Layout do portal do parceiro.

Responsabilidades:

- validar sessão
- garantir acesso de parceiro via `getCurrentPartnerAccess()`
- aplicar `PartnerShell`

## Rotas públicas e de marketing

- `/`:
  home institucional do ContemplaHub como plataforma SaaS B2B para operações de consórcio, com hero, mockup de dashboard, funcionalidades, IA, segurança, dashboards e CTA de demonstração
- `/politica-de-privacidade`:
  página pública institucional para compliance e cadastro do app, cobrindo uso da plataforma web, app mobile, autenticação, mensageria, captação, agenda e direitos de exclusão
- `/exclusao-de-dados`:
  página pública institucional com instruções para solicitação de exclusão/correção de dados
- `/guia-consorcio`:
  conteúdo de marketing em grupo `(marketing)`
- `/guia-consorcio/obrigado`
- `/guia-consorcio/print`
- `/propostas/[publicHash]`:
  proposta pública compartilhável
- `/cadastro/[token]`:
  cadastro PF por token

Observação:

- `/privacidade` existe como redirecionamento de compatibilidade para `/politica-de-privacidade`

## Rotas de autenticação

Grupo `(auth)`:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

Observação:

- o cadastro público pode ser desligado via `NEXT_PUBLIC_PUBLIC_SIGNUP_ENABLED`;
- quando a flag está desativada, o link "Criar conta" some da tela de login e `/register` redireciona para `/login`, preservando o fluxo pronto para futura reativação comercial.

Outras rotas de auth:

- `/auth/callback`

Observação:

- `/auth/callback` é um route handler server-side, não uma página client
- ele conclui OAuth, magic link, recovery e confirmação de conta usando cookies compatíveis com `supabaseServer()`

## Área autenticada principal

## Leitura macro por domínio

- `/app/leads` concentra a camada comercial
- `/app/leads/[leadId]/contrato/novo` e fluxos equivalentes concentram a formalização
- `/app/lances` concentra a operação da cota
- `/app/carteira` concentra o pós-venda operacional

### Entrada principal

- `/app`:
  dashboard operacional

### Leads

- `/app/leads`
- `/app/leads/[leadId]`
- `/app/leads/[leadId]/propostas/nova`
- `/app/leads/[leadId]/propostas/[propostaId]`
- `/app/leads/[leadId]/contrato/novo`

Observação:

- a tela `/app/leads` é a porta principal do funil comercial
- várias interações são feitas por sheets e dialogs reutilizáveis, então a página funciona mais como contexto operacional do que como única dona da feature

### Carteira

- `/app/carteira`
- `/app/carteira/[leadId]/contratos/novo`

Observação:

- `/app/carteira` é simultaneamente listagem de clientes e de cartas, alternando entre visões por query string
- o cadastro de carta é disparado por `CreateCarteiraCartaSheet`, que reutiliza a feature de contratos
- a rota representa o pós-venda operacional, não apenas uma consequência visual do contrato

### Contratos

- `/app/contratos/[contratoId]`

Observação:

- não há listagem dedicada de contratos em `/app/contratos`
- a rota atual é um detalhe de contrato com foco em comissão, resumo financeiro e cota associada
- a página também expõe edição de status do contrato (`ContratoStatusEditor`) e upload/visualização do PDF (`ContratoPdfUploadCard`)
- `pendente de confirmação`: se haverá uma listagem própria de contratos no futuro
- a rota não substitui a operação de assembleia/lance/contemplação, que hoje vive no domínio de cotas/lances

### Cartas (cota sem contrato)

- `/app/cartas/[cotaId]`

Observação:

- rota chaveada por `cota_id` (não por `contrato_id`), pois nem toda cota da carteira já possui contrato
- se já existir um contrato vinculado àquela cota, a página redireciona para `/app/contratos/[contratoId]`
- caso contrário, exibe os dados já cadastrados da cota e um botão "Completar cadastro do contrato", que abre `CreateContratoSheet` (modo `registerExisting`) pré-preenchido com os dados da cota via `prefill`
- esse é o destino do link "Ver carta" na carteira quando a cota ainda não tem contrato

### Cotas / lances

- `/app/lances`
- `/app/lances/[cotaId]`

Observação:

- embora o domínio pedido seja `cotas`, o ponto de entrada operacional atual está nomeado como `lances`
- a leitura de cota também reaparece em carteira e contrato
- assembleia, lance e contemplação pertencem a essa camada operacional

### Comissões

- `/app/comissoes`

### Parceiros

- `/app/parceiros`

### Meta integrações

- `/app/meta-integracoes`
- `/app/meta-integracoes/[integrationId]`

Observação:

- esta área é administrativa e orientada a configuração por organização;
- a tela principal prioriza o fluxo assistido de `Conectar Meta`;
- o cadastro manual fica recolhido em `Configuração avançada` como fallback técnico/admin;
- o detalhe por `integrationId` existe para inspeção de `meta_webhook_events`.

### Administração complementar

- `/app/usuarios`
- `/app/organizacao`
- `/app/landing-pages`
- `/app/landing-pages/[id]`

## Portal do parceiro

- `/partner`:
  redireciona para `/partner/contracts`
- `/partner/contracts`
- `/partner/contracts/[contractId]`
- `/partner/commissions`
- `/partner/me`

## BFFs e endpoints internos do App Router

Principais rotas em `src/app/api`:

- `/api/session`
- `/api/auth/resolve-destination`
- `/api/lead`
- `/api/leads`
- `/api/leads/create`
- `/api/lead-propostas/lead/[leadId]`
- `/api/propostas/[hash]`
- `/api/propostas/[hash]/accept`
- `/api/propostas-internal/[propostaId]`
- `/api/contracts/[contractId]/document`
- `/api/contracts/[contractId]/document/signed-url`
- `/api/partner/contracts/[contractId]/document`
- `/api/cadastro/[token]/pf`
- `/api/lances/cartas/[cotaId]`
- `/api/lp/[slugOrHash]/config`

Observação:

- `/api/auth/resolve-destination` segue existindo como endpoint interno de resolução
- o callback principal de autenticação, porém, já resolve sessão e destino diretamente no servidor em `/auth/callback`

## Relação entre rotas e features

### Rotas que são contexto de entrada para feature reutilizável

- `/app/carteira`:
  abre `CreateCarteiraCartaSheet`, que delega o fluxo real para `ContratoFormShellV2`
- `/app/leads/[leadId]/contrato/novo`:
  usa a mesma base da feature de contratos
- `/app/leads`:
  coordena funil, diagnóstico, criação de lead e criação de contrato via componentes reusáveis

### Rotas que concentram a feature no próprio diretório

- `/app/comissoes`
- `/app/parceiros`
- `/app/lances`

## Query params relevantes

- `/app/leads`:
  `ativos=1`, `frios=1`, `perdidos=1`
- `/app/carteira`:
  `view`, `mode`, `q`, `produto`, `status_carteira`, `all`, `sort`
- `/app/comissoes`:
  `parceiro_id`, `status`, `repasse_status`, `competencia_de`, `competencia_ate`
- `/app/lances`:
  `competencia`, `status_cota`, `administradora_id`, `produto`, `q`, `somente_autorizadas`

## Pendentes de confirmação

- a nomenclatura definitiva do domínio `cotas` versus `lances`
- se a rota `/app/contratos/[contratoId]` deve evoluir para um módulo completo de contratos
