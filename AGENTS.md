# AGENTS.md

## Contexto
Este diretório contém o frontend do ContemplaHub.

Stack:
- Next.js 16 com App Router
- React Server Components
- Server Actions quando fizer sentido
- TailwindCSS
- shadcn/ui
- TypeScript
- Supabase auth no servidor

## Regras de arquitetura
- Preferir organização por feature/domínio.
- Evitar lógica de negócio pesada dentro de componentes visuais.
- Separar:
    - components
    - schemas
    - actions / fetchers
    - mappers
    - types
- Não misturar status de contrato com situação de cota.
- Lead e carteira devem ser contextos de entrada; regras centrais devem viver em features reutilizáveis.

## UX e design
- Manter visual premium, limpo e orientado à operação.
- Preferir densidade elegante, não blocos gigantes.
- Usar destaque em verde quando fizer sentido para ações principais.
- Evitar poluição visual.
- Usar ícones para reforçar leitura, não para decorar.
- Mostrar informação útil com boa hierarquia.

## Formulários
- Validar com Zod.
- Máscaras monetárias e percentuais devem evitar bugs de escala.
- Nunca converter valores de forma ambígua entre centavos e reais.
- Campos condicionais devem limpar/ignorar payload derivado quando desativados.

## Dados e segurança
- Preferir auth server-side.
- Nunca expor service keys no cliente.
- BFFs em `app/api` devem apenas intermediar chamadas seguras quando necessário.
- Não duplicar contrato de API sem necessidade.

## Documentação viva
Sempre atualizar `docs/frontend/` quando mudar:
- fluxos críticos
- componentes reutilizáveis
- BFFs
- contratos de payload consumidos do backend
- organização de features
- decisões de UX estruturais

## Checks
Rodar os checks relevantes do frontend definidos no projeto.
Se houver lint/typecheck/testes, executar todos os que se aplicarem.