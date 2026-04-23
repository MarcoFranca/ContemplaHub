# Feature Meta Integrações

## Responsabilidade

Este domínio cobre a configuração administrativa das integrações Meta Lead Ads por organização.

Responsabilidades observadas:

- listar integrações Meta da org;
- criar e editar páginas/formulários da Meta;
- iniciar conexão assistida via OAuth;
- listar páginas autorizadas e formulários durante o fluxo assistido;
- finalizar integração assistida sem expor token no client;
- definir responsável padrão do lead;
- acompanhar status operacional da integração;
- testar conexão com a Graph API;
- inscrever a página no app e verificar a assinatura;
- consultar formulários disponíveis da página;
- inspecionar eventos recebidos pelo webhook.

## Principais pontos de código

### Rotas

- `src/app/app/meta-integracoes/page.tsx`
- `src/app/app/meta-integracoes/[integrationId]/page.tsx`

### Actions

- `src/app/app/meta-integracoes/actions.ts`

### Componentes e schemas

- `src/features/meta-integracoes/components/meta-integration-form-dialog.tsx`
- `src/features/meta-integracoes/components/meta-oauth-assistant.tsx`
- `src/features/meta-integracoes/components/meta-integration-operations.tsx`
- `src/features/meta-integracoes/schema.ts`
- `src/features/meta-integracoes/types.ts`

## Fluxo principal do usuário

1. O gestor abre `/app/meta-integracoes`.
2. Escolhe entre `Modo manual` e `Conectar Meta`.
3. No modo manual, cria ou edita a integração informando `page_id`, `form_id`, `source_label`, token e responsável padrão.
4. No modo assistido, clica em `Conectar Meta`, sai para o consentimento OAuth e volta para a mesma tela.
5. O frontend carrega as páginas autorizadas da sessão temporária mantida no backend.
6. O usuário seleciona a página, escolhe o formulário, define nome interno e responsável padrão e finaliza a integração.
5. Usa os botões operacionais para testar conexão, inscrever página e verificar a assinatura.
6. Acompanha `webhook_configured`, `access_token_configured`, `page_subscribed`, `last_webhook_at`, `last_success_at` e `last_error_*`.
7. Abre a tela de eventos da integração para inspecionar payloads recebidos, erros de processamento e formulários retornados pela Graph API.

## Estrutura atual da feature

- a página `src/app/app/meta-integracoes/page.tsx` centraliza a troca entre modo manual e modo assistido;
- `MetaIntegrationFormDialog` continua sendo o fallback/admin para cadastro manual;
- `MetaOAuthAssistant` concentra o stepper simples, a conexão OAuth, a seleção de página/formulário e a confirmação final;
- `MetaIntegrationOperations` concentra badges e ações operacionais reutilizadas na listagem e no detalhe.

## Integrações com backend

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

## Observações arquiteturais

- a UI usa Server Components para carregar listagem e eventos;
- a escolha entre fluxo manual e assistido fica concentrada em tabs na própria página;
- o fluxo assistido usa uma sessão OAuth temporária mantida no backend, sem expor token à camada client;
- o frontend nunca recebe o `access_token` bruto; ele só recebe páginas, formulários e status já sanitizados;
- o formulário usa Zod no client com envio por Server Actions;
- um painel client-side da própria feature concentra badges operacionais e botões de ação para evitar duplicação entre listagem e detalhe;
- `access_token` e `verify_token` nunca voltam para o client depois da persistência;
- o frontend trata Meta Lead Ads como domínio administrativo e não como lugar da lógica de ingestão do lead.
