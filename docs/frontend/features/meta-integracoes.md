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
- remover a página/integracao com confirmação e tentativa de desinscrição;
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
2. A tela abre com cards-resumo de saúde operacional: total, ativas, último lead e erros recentes.
3. O fluxo assistido aparece como caminho principal da tela, com linguagem orientada a resultado.
4. O usuário clica em `Conectar Meta`, sai para o consentimento OAuth e volta para a mesma tela com `success=true`, `meta_connected=1` ou `error=...`.
5. Ao voltar do callback, o frontend faz refresh da rota e recarrega `GET /meta/integrations`.
6. Em seguida, o assistente chama `GET /meta/pages` para carregar as páginas autorizadas persistidas temporariamente pelo backend para o usuário atual.
7. O usuário seleciona a página, escolhe o formulário, define nome interno, rótulo da origem e responsável padrão e finaliza a integração.
8. A listagem principal mostra apenas os campos essenciais: integração, página, formulário, responsável, status, último lead e ações.
9. A configuração manual fica recolhida em `Avançado e diagnóstico` como fallback técnico/admin.
10. Usa os botões operacionais para testar conexão, inscrever página e verificar a assinatura apenas dentro do bloco avançado da linha.
11. Quando quiser encerrar a integração, usa `Remover` com confirmação explícita de desconexão.
12. Abre a tela de eventos da integração para inspecionar payloads recebidos, erros de processamento e formulários retornados pela Graph API.

## Estrutura atual da feature

- a página `src/app/app/meta-integracoes/page.tsx` trata o OAuth como caminho principal, usa cards-resumo para responder rapidamente “está funcionando?” e move o manual para uma área recolhida de `Avançado e diagnóstico`;
- `MetaIntegrationFormDialog` continua sendo o fallback/admin para cadastro manual;
- `MetaOAuthAssistant` concentra o stepper simples, a conexão OAuth, o refresh pós-callback, a seleção de página/formulário e a confirmação final;
- `MetaIntegrationOperations` concentra ativar/desativar, remover com confirmação e o bloco recolhido de diagnóstico técnico, reutilizado na listagem e no detalhe.

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
- `DELETE /meta/integrations/{id}`
- `GET /meta/integrations/{id}/subscription-status`
- `GET /meta/integrations/{id}/forms`
- `GET /meta/integrations/{id}/events`
- `PATCH /meta/integrations/{id}` também é usado pelo painel operacional para ativar ou desativar integrações importadas.

## Observações arquiteturais

- a UI usa Server Components para carregar listagem e eventos;
- as páginas server-side do domínio tratam falhas de actions com fallback visual, para evitar a mensagem genérica de erro de renderização em produção do Next.js;
- `MetaIntegrationOperations` consome Server Actions operacionais com retorno estruturado `{ ok, data | error }`, então falhas de token/permissão da Meta aparecem como erro funcional no toast em vez de quebrar a renderização;
- a experiência principal evita expor termos técnicos como webhook/token logo de cara; esses detalhes ficam recolhidos em accordion de diagnóstico;
- o fluxo assistido usa uma sessão OAuth temporária mantida no backend, sem expor token à camada client;
- o frontend nunca recebe o `access_token` bruto; ele só recebe páginas, formulários e status já sanitizados;
- o formulário usa Zod no client com envio por Server Actions;
- um painel client-side da própria feature concentra badges operacionais e botões de ação para evitar duplicação entre listagem e detalhe;
- `access_token` e `verify_token` nunca voltam para o client depois da persistência;
- `GET /meta/integrations` não é a fonte primária das páginas autorizadas logo após o callback; essa função fica com `GET /meta/pages`;
- `POST /meta/integrations/from-oauth` só roda depois da seleção explícita de página/formulário e do clique em salvar;
- quando `GET /meta/pages` volta vazio, a UI mostra erro claro orientando revisar permissões e acesso a páginas na conta Meta;
- o frontend trata Meta Lead Ads como domínio administrativo e não como lugar da lógica de ingestão do lead.
