# Feature Parceiros

## Responsabilidade

O módulo de parceiros gerencia parceiros de negócio e seus acessos ao portal.

Responsabilidades observadas:

- listar parceiros
- cadastrar e editar parceiro
- ativar ou desativar parceiro
- convidar e gerenciar usuário parceiro
- validar possibilidade de exclusão

## Principais pontos de código

### Rota

- `src/app/app/parceiros/page.tsx`

### Actions

- `src/app/app/parceiros/actions.ts`

### Componentes

- `ParceiroSheet`
- `ParceirosTable`
- `ParceiroStatusBadge`
- `ParceiroAcessoBadge`
- `DeleteParceiroDialog`

## Schemas e actions relevantes

Não há schema Zod centralizado exposto nesta pasta.

Actions relevantes:

- `listParceirosAction`
- `listPartnerUsersAction`
- `createParceiroAction`
- `updateParceiroAction`
- `invitePartnerUserAction`
- `updatePartnerUserAction`
- `toggleParceiroAction`
- `resendInviteAction`
- `getParceiroDeleteCheckAction`
- `deleteParceiroAction`

## Fluxo principal do usuário

1. O operador acessa `/app/parceiros`.
2. Consulta total de parceiros e acessos.
3. Cria ou edita parceiro via `ParceiroSheet`.
4. Pode liberar acesso ao portal, reenviar convite ou desativar.
5. A exclusão exige checagem prévia.

## Integrações com backend

- endpoints de parceiros
- endpoints de partner users
- fluxo de convite e reenvio de acesso

Observação:

- os caminhos exatos são montados em `src/app/app/parceiros/actions.ts` a partir de constantes internas do módulo

## Relação com outras features

- parceiros aparece em contratos para configuração de repasse/comissionamento
- parceiros também alimenta filtros de comissões
- o portal em `/partner` depende desse domínio para autorização e navegação

## Pendentes de confirmação

- o modelo exato de sincronização entre parceiro comercial e usuário parceiro do portal
