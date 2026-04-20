# Design system e UI

## Direção visual do produto

O frontend interno segue uma direção visual premium, escura e operacional, com destaque recorrente em verde/emerald para:

- ações principais
- estados de confirmação
- progressão guiada
- foco comercial positivo

Elementos recorrentes:

- fundos com blur e transparência
- gradientes e efeitos com `SectionFX`
- cards com borda suave e contraste alto
- hierarquia compacta, evitando blocos excessivamente altos

## Base tecnológica

- TailwindCSS v4 em `src/app/globals.css`
- tema por CSS variables
- componentes baseados em shadcn/ui dentro de `src/components/ui`
- ícones via `lucide-react`
- animações pontuais com `framer-motion`

## Tokens observados

### Tipografia

- `Geist` para texto principal
- `Geist Mono` para conteúdos monoespaçados

### Cores

- suporte a tema claro e escuro por CSS variables
- na prática, o produto interno privilegia estética escura
- marketing e formulários premium usam muito `slate`, `emerald`, transparências e gradientes

### Radius e superfícies

- radius base em `--radius`
- uso frequente de cantos maiores em sheets e cards premium, como `rounded-2xl`, `rounded-[24px]`, `rounded-[28px]`

## Hierarquia visual

Padrão recorrente nas telas internas:

- título principal com `text-2xl` ou `text-3xl`
- subtítulo curto em `text-sm text-muted-foreground`
- cards de KPI com ícone e número
- área de filtros logo após header
- tabela, cards ou board como bloco principal rolável

## Padrões de componentes

### Badges

Uso:

- status
- variante visual de resultado
- marcação de modo do fluxo
- resumos rápidos

Base:

- `src/components/ui/badge.tsx`

Variações reais observadas:

- `default`
- `secondary`
- `outline`
- `destructive`

### Cards

Uso:

- KPIs
- resumo de entidade
- agrupamento de seções
- estados de erro e vazio

Padrões observados:

- cards simples para dashboard e listagens
- cards premium com bordas translúcidas e fundo escuro para fluxos críticos

### Sheets

Uso:

- criação de lead
- criação de cliente da carteira
- cadastro de carta/contrato
- edição rápida e ações contextuais

O sheet é uma primitiva central da UX interna. Ele reduz troca de contexto e mantém o operador na mesma tela.

### Dialogs

Uso:

- confirmação de deleção
- atualização de status
- repasse
- detalhes de interesse
- pós-salvamento

Regra prática observada:

- `Sheet` para fluxo mais extenso
- `Dialog` para decisão, confirmação ou edição curta

## shadcn/ui no produto

O projeto usa wrappers padrão do shadcn/ui em `src/components/ui/*`, incluindo:

- `button`
- `input`
- `textarea`
- `select`
- `card`
- `sheet`
- `dialog`
- `badge`
- `table`
- `form`
- `sidebar`
- `tabs`
- `tooltip`

Isso cria um baseline consistente, mas várias telas críticas aplicam camada visual extra por cima para diferenciar a experiência do produto.

## Princípios de UX identificados

### 1. Operação com contexto

O usuário costuma agir sem sair da tela atual:

- cria lead no header
- cria cliente na carteira sem navegar
- formaliza carta em sheet full-screen

### 2. Densidade elegante

As telas tentam manter:

- informação suficiente por viewport
- subtítulos curtos
- filtros próximos da listagem
- scroll concentrado no conteúdo, não na página inteira

### 3. Revisão viva

Nos fluxos mais críticos, especialmente contratos, a interface mostra:

- stepper
- resumo lateral
- checklist visual
- progresso de etapa

### 4. Feedback imediato

Padrões observados:

- `toast` via Sonner
- estados de erro em cards destacados
- `router.refresh()` após persistência
- mensagens curtas de sucesso/erro

## Componentes críticos por experiência

- `AppShell`, `Sidebar`, `Header`
- `KanbanBoard`
- `CreateLeadSheet`
- `CreateCarteiraClienteSheet`
- `CreateCarteiraCartaSheet`
- `ContratoFormShellV2`
- `ParceiroSheet`
- `LancamentosTable`

## Riscos de consistência visual

- existe forte customização local em formulários premium, então mudanças globais em `ui/*` podem não ser suficientes para manter consistência
- parte das features usa visual mais maduro que outras, especialmente contratos em relação a módulos administrativos

## Pendentes de confirmação

- se o modo claro continua sendo requisito de operação interna ou se o produto já pode ser tratado como dark-first
- se os componentes premium de contrato devem virar um padrão formal para outros formulários complexos
