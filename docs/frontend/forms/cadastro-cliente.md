# Formulário crítico: cadastro de cliente

## Onde vive

- `src/app/app/carteira/ui/CreateCarteiraClienteSheet.tsx`
- `src/app/app/carteira/novo/actions.ts`

## Estrutura do formulário

O fluxo é um sheet lateral com duas camadas:

- `Cadastro rápido`
- `Cadastro completo` em bloco colapsável

## Campos do cadastro rápido

- nome
- telefone
- e-mail
- observações

## Campos do cadastro completo

- CPF
- data de nascimento
- CEP
- cidade
- estado
- bairro
- logradouro
- número
- complemento

## Validação

Não há schema Zod explícito neste fluxo.

Validações observadas:

- nome é obrigatório
- `orgId` é obrigatório
- backend URL deve existir
- endereço é opcional
- `estado` é truncado para 2 caracteres

## Regras condicionais

- os campos de endereço só impactam `address_updated_at` quando algum dado de endereço foi preenchido
- o colapsável `Cadastro completo` é opcional
- o CEP pode preencher automaticamente cidade, UF, bairro e logradouro, mas o usuário ainda pode editar

## Lookup de CEP

O componente consulta ViaCEP diretamente do browser:

- URL `https://viacep.com.br/ws/{cep}/json/`
- debounce curto
- feedback visual de loading
- preenchimento automático parcial quando disponível

## Payload enviado ao backend

A action `createClienteCarteiraAction` envia `POST` para `/carteira/clientes` com:

- `nome`
- `telefone`
- `email`
- `observacoes`
- `owner_id`
- `cep`
- `logradouro`
- `numero`
- `complemento`
- `bairro`
- `cidade`
- `estado`
- `latitude`
- `longitude`
- `address_updated_at`

## Fluxo principal do usuário

1. O operador abre o sheet pela carteira ou pelo header.
2. Preenche cadastro rápido.
3. Se necessário, expande cadastro completo.
4. Informa CEP e pode receber preenchimento automático.
5. Salva.
6. Em caso de sucesso, o fluxo redireciona para `/app/leads/{leadId}` quando o backend retorna o lead criado.

## Riscos comuns de UX e persistência

- ausência de schema Zod centralizado aumenta risco de divergência se outro ponto criar cliente de carteira
- consulta de CEP depende de serviço externo e pode falhar silenciosamente do ponto de vista do negócio
- CPF e data de nascimento aparecem no formulário, mas não são persistidos pela action atual

## Pendentes de confirmação

- `pendente de confirmação`: CPF e nascimento são apenas preparação visual para evolução futura ou o backend já deveria persisti-los
- `pendente de confirmação`: se o cadastro de cliente da carteira deve migrar para schema Zod compartilhado
