# Feature Meta Integrações

## Responsabilidade

Este domínio cobre a configuração administrativa das integrações Meta Lead Ads por organização.

Responsabilidades observadas:

- listar integrações Meta da org;
- criar e editar páginas/formulários da Meta;
- definir responsável padrão do lead;
- acompanhar status operacional da integração;
- inspecionar eventos recebidos pelo webhook.

## Principais pontos de código

### Rotas

- `src/app/app/meta-integracoes/page.tsx`
- `src/app/app/meta-integracoes/[integrationId]/page.tsx`

### Actions

- `src/app/app/meta-integracoes/actions.ts`

### Componentes e schemas

- `src/features/meta-integracoes/components/meta-integration-form-dialog.tsx`
- `src/features/meta-integracoes/schema.ts`
- `src/features/meta-integracoes/types.ts`

## Fluxo principal do usuário

1. O gestor abre `/app/meta-integracoes`.
2. Lista as integrações Meta já vinculadas à organização.
3. Cria ou edita a integração informando `page_id`, `form_id`, `source_label`, token e responsável padrão.
4. Acompanha `last_webhook_at`, `last_success_at` e `last_error_*`.
5. Abre a tela de eventos da integração para inspecionar payloads recebidos e erros de processamento.

## Integrações com backend

- `GET /meta/integrations`
- `POST /meta/integrations`
- `PATCH /meta/integrations/{id}`
- `GET /meta/integrations/{id}/events`

## Observações arquiteturais

- a UI usa Server Components para carregar listagem e eventos;
- o formulário usa Zod no client com envio por Server Actions;
- `access_token` e `verify_token` nunca voltam para o client depois da persistência;
- o frontend trata Meta Lead Ads como domínio administrativo e não como lugar da lógica de ingestão do lead.
