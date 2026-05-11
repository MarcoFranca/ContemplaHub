# Home pública do ContemplaHub

## Responsabilidade

A rota pública `/` apresenta o ContemplaHub como produto SaaS B2B para operações de consórcio.

Ela não deve:

- reutilizar copy de corretora ou consultoria específica;
- vender consórcio diretamente para cliente final;
- acoplar a home a Supabase, service role ou fluxos sensíveis do backend.

## Estrutura atual

Arquivos principais:

- `src/app/page.tsx`
- `src/components/marketing/contemplahub/HomePage.tsx`
- `src/components/marketing/contemplahub/PublicHeader.tsx`
- `src/components/marketing/contemplahub/PublicFooter.tsx`
- `src/app/layout.tsx` também carrega os metadados globais públicos da marca

## Identidade visual aplicada

- logos oficiais em `public/logo_horizontal_branca_verde.png` e `public/icon.png`
- base escura com palette principal:
  - `#0B1220`
  - `#0F1B2E`
  - `#00C389`
  - `#27E0A5`
  - `#E2E8F0`
- tipografia mantida no stack global já configurado do projeto (`Geist`), por ser a opção mais próxima disponível sem introduzir dependência adicional de fonte remota

## Mensagem da página

A home posiciona o ContemplaHub como:

- CRM multi-tenant
- sistema operacional de consórcio
- automação comercial e operacional
- IA para suporte à decisão
- plataforma de governança e segurança por organização

Headline principal:

- `O sistema operacional para operações de consórcio modernas.`

## Seções

1. Header institucional com navegação:
   - Produto
   - Funcionalidades
   - Operação
   - IA
   - Segurança
   - Entrar

2. Hero com:
   - headline e subheadline B2B
   - CTA de demonstração
   - CTA de funcionalidades
   - mockup construído em HTML/CSS/Tailwind

3. Fluxo `Da captação à contemplação`

4. Cards de funcionalidades principais

5. Seção de IA aplicada ao contexto de consórcio

6. Seção de segurança e multi-tenant

7. Dashboard fictício com KPIs operacionais

8. Seção `Para quem é`

9. CTA final para demonstração e login

10. Footer com nota de compliance

## CTAs

Os CTAs públicos atuais usam apenas destinos seguros:

- `#demo`
- `mailto:comercial@contemplahub.com`
- `/login`

Nenhum CTA depende de formulário legado da landing anterior.

## Hero

O hero usa mockup construído com HTML/Tailwind, sem imagem externa.

Princípios da composição atual:

- o hero prioriza texto acima e mockup abaixo em faixa ampla, inclusive no desktop, para evitar compressão visual do dashboard;
- em tablet e mobile o mockup desce abaixo do texto;
- o mockup foi reduzido para poucos blocos legíveis:
  - kanban comercial
  - apoio ao atendimento
  - mini métricas operacionais

Isso evita a compressão visual do mockup e mantém a leitura do produto clara.

## Restrições importantes

- não exibir referências a WLG Capital, Autentika, Wagner ou corretora específica;
- não prometer contemplação;
- não expor credenciais, chaves privadas ou detalhes internos de backend;
- preservar `/app` como área autenticada.
