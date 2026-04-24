# Dados, fetching e actions

## Estratégia geral

O frontend combina quatro mecanismos principais:

- Server Components para leitura inicial
- Server Actions para mutações autenticadas
- BFFs em `src/app/api` para mediação de chamadas HTTP
- chamadas client-side pontuais quando a experiência exige interação direta no browser

## Server Components

Padrão observado nas páginas principais:

- validar sessão e organização no servidor
- buscar dados antes da renderização
- passar listas, filtros e contexto para componentes client

Exemplos:

- `src/app/app/page.tsx`
- `src/app/app/leads/page.tsx`
- `src/app/app/carteira/page.tsx`
- `src/app/app/comissoes/page.tsx`
- `src/app/app/parceiros/page.tsx`
- `src/app/app/lances/page.tsx`

## Server Actions

### Leads

Principais ações em `src/app/app/leads`:

- listar kanban
- mover estágio
- criar lead manual
- listar opções de contrato
- criar contrato a partir do lead
- atualizar status de contrato
- salvar diagnóstico

### Carteira

Principais ações:

- listar clientes e cartas
- criar cliente da carteira
- reativar cliente para negociação

### Contratos

Principais ações em `src/features/contratos/actions`:

- `createContratoFromLeadAction`
- `registerExistingContratoAction`
- sincronização complementar de campos extras da cota

### Comissões

Principais ações:

- listar lançamentos
- listar parceiros para filtro
- atualizar status de lançamento
- atualizar repasse
- gerar lançamentos por contrato
- sincronizar eventos
- processar pagamento

### Parceiros

Principais ações:

- listar parceiros
- listar acessos
- criar e editar parceiro
- convidar usuário parceiro
- ativar/desativar
- checar possibilidade de exclusão
- excluir

### Meta Lead Ads

Principais ações:

- listar integrações Meta da org
- criar integração
- editar integração
- iniciar OAuth assistido
- listar páginas autorizadas da sessão OAuth atual
- listar formulários da página selecionada
- finalizar integração a partir do OAuth
- testar conexão com a Graph API
- inscrever página no app
- verificar status de inscrição
- listar formulários disponíveis da integração
- listar eventos recebidos por integração

## BFFs em `app/api`

## Quando aparecem

Os BFFs são usados para:

- carregar ou aceitar propostas por hash
- encaminhar upload/download de documento
- operar cadastro por token
- expor endpoints internos para client components

## Rotas relevantes

### Propostas

- `/api/lead-propostas/lead/[leadId]`
- `/api/propostas/[hash]`
- `/api/propostas/[hash]/accept`
- `/api/propostas-internal/[propostaId]`

Uso:

- criação, leitura e aceite de propostas
- integração com fluxos do lead e da proposta pública

### Documentos de contrato

- `/api/contracts/[contractId]/document`
- `/api/contracts/[contractId]/document/signed-url`
- `/api/partner/contracts/[contractId]/document`

Uso:

- upload, consulta, remoção e URL assinada de documentos

### Cadastro por token

- `/api/cadastro/[token]/pf`

Uso:

- encaminhar atualização do cadastro PF público para o backend

### Outros

- `/api/session`
- `/api/auth/resolve-destination`
- `/api/lances/cartas/[cotaId]`
- `/api/lp/[slugOrHash]/config`

## Autenticação e callback OAuth

### Callback server-side

- `/auth/callback` é tratado por route handler em `src/app/auth/callback/route.ts`
- o handler recebe `code` ou `token_hash`
- a troca por sessão acontece no servidor com cliente Supabase SSR compatível com cookies
- o redirecionamento final só acontece depois que os cookies da sessão são preparados para `supabaseServer()`

### Por que isso importa

- `/app` e `/partner` dependem de leitura server-side da sessão
- um callback resolvido só no client pode autenticar o browser, mas ainda falhar para layouts protegidos que rodam no servidor
- por isso a resolução de destino do usuário não deve depender exclusivamente de sessão client

### Resolução de destino

- `resolveUserDestination()` usa a sessão SSR atual
- `resolveUserDestinationFromUserId()` resolve o destino logo após o callback
- o destino final é:
  - `/app` para usuário interno
  - `/partner` para parceiro ativo
  - `/login?msg=...` quando não há acesso válido

### Convenção de URLs

- `src/lib/auth/auth-urls.ts` centraliza `getConfiguredSiteUrl()` e `getAuthCallbackUrl()`
- no client, a callback usa a origem atual do navegador
- em server actions, a callback usa a origem do request quando disponível
- preferir `NEXT_PUBLIC_SITE_URL` apenas como fallback configurado
- usar `NEXT_PUBLIC_APP_URL` apenas como fallback de compatibilidade
- convites, magic link, reset password, sign up com confirmação e OAuth devem compartilhar a mesma callback URL

## Contratos consumidos do backend

## Integração Meta Lead Ads

O frontend administrativo de Meta usa Server Actions para falar com o backend autenticado.

Rotas consumidas:

- `GET /meta/integrations`
- `POST /meta/integrations`
- `PATCH /meta/integrations/{id}`
- `GET /meta/oauth/start`
- `GET /meta/pages`
- `GET /meta/pages/{page_id}/forms`
- `POST /meta/integrations/from-oauth`
- `POST /meta/integrations/{id}/test-connection`
- `POST /meta/integrations/{id}/subscribe-page`
- `GET /meta/integrations/{id}/subscription-status`
- `GET /meta/integrations/{id}/forms`
- `GET /meta/integrations/{id}/events`

Cuidados:

- `Authorization` é enviado apenas server-side;
- `access_token` e `verify_token` são enviados ao backend sem reexposição posterior no browser;
- os status operacionais de conexão e inscrição são lidos da response sanitizada da integração, nunca do token;
- o fluxo assistido via OAuth mantém a sessão temporária no backend e só devolve páginas/formulários já sanitizados;
- o callback OAuth da Meta continua concentrado no backend, e o frontend só consome o resultado após o redirect de volta para `/app/meta-integracoes`;
- depois do callback com `success=true` ou `meta_connected=1`, o client faz `router.refresh()` para reexecutar `GET /meta/integrations` no Server Component;
- em seguida, o assistente chama `GET /meta/pages` para preencher a seleção de páginas autorizadas;
- `POST /meta/integrations/from-oauth` só acontece depois que o usuário escolhe página/formulário e confirma a integração;
- quando uma action server-side falha na renderização inicial, a página mostra fallback visual com a mensagem da falha em vez de explodir com o erro genérico de Server Components do Next.js;
- a resolução do tenant continua do lado do backend.

## Padrões de autenticação

Há três padrões principais:

### 1. Backend com `X-Org-Id`

Usado quando a ação depende só do contexto organizacional já resolvido no servidor.

Exemplo:

- `backendFetch(path, { orgId, ... })`

### 2. Backend com `Authorization` + `X-Org-Id`

Usado quando a rota backend exige sessão explícita do usuário.

Exemplos:

- ações de contratos
- documentos de contrato
- comissões

### 3. Fluxos públicos por hash/token

Usados em:

- propostas públicas
- cadastro PF por token

Nesses fluxos não há sessão do usuário operador.

## Helpers centrais

- `src/lib/backend.ts`
- `src/lib/backend-partner.ts`
- `src/lib/backend-auth.ts`
- `src/lib/auth/server.ts`
- `src/lib/auth/partner-server.ts`

## Segurança e multi-tenant

- `getCurrentProfile()` resolve `userId`, `orgId`, `role` e `isManager`
- o frontend não deve assumir acesso sem `orgId`
- chamadas ao backend propagam `X-Org-Id`
- service role existe somente em código server-side
- client code não usa service key

## Observações importantes de integração

- `createClienteCarteiraAction` chama `/carteira/clientes` diretamente no backend
- `CreateCarteiraClienteSheet` consulta CEP no ViaCEP direto do browser
- a feature de contratos converte números para strings compatíveis com o backend via mapper
- `syncCotaExtraFields` complementa dados que não ficam totalmente resolvidos na criação principal do contrato

## Riscos e pontos de atenção

- coexistem chamadas diretas ao backend e chamadas via BFF; isso é funcional, mas aumenta a necessidade de critério arquitetural
- parte do código usa `NEXT_PUBLIC_BACKEND_URL`, parte usa `BACKEND_URL`, parte usa helper centralizado
- há risco de divergência de payload se outras features criarem contratos sem reutilizar `mapContratoFormToApi`

## Pendentes de confirmação

- se algumas rotas hoje diretas ao backend devem migrar para BFF padronizado
- se o fallback via service role em `getCurrentProfile()` é solução transitória ou decisão permanente
