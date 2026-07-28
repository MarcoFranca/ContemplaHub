-- Adiciona suporte ao produto "pesados" (caminhões/máquinas pesadas).
--
-- O enum Postgres `produto` só tinha ('imobiliario', 'auto'). Adicionar um valor via
-- `ALTER TYPE ... ADD VALUE` não é confiável neste projeto: o cache de schema do
-- PostgREST (Supabase Data API) não passa a reconhecer o novo valor sem restart do
-- serviço, e continua injetando o cast `::produto`, causando erro 22P02
-- ("invalid input value for enum produto") — o mesmo problema já documentado e
-- resolvido para `lance_tipo` na migration 0012.
--
-- Solução: converter as 4 colunas que usam o enum `produto` para `text`. A validação
-- dos valores aceitos (imobiliario | auto | pesados) passa a ser feita no backend via
-- os Literals Python (app/schemas/lances.py::Produto, app/schemas/carteira_import.py::
-- ImportProduto, app/schemas/propostas.py::ProdutoTipo, app/routers/contracts.py) e no
-- Zod do frontend (features/contratos/schemas/contrato-base.schema.ts::produtoSchema).
--
-- O tipo enum `produto` em si NÃO é removido (fica órfão, sem custo/risco — mesmo
-- padrão adotado para `lance_tipo`, que também ficou sem uso em algumas colunas).

ALTER TABLE "cotas" ALTER COLUMN "produto" TYPE text USING "produto"::text;--> statement-breakpoint
ALTER TABLE "grupos" ALTER COLUMN "produto" TYPE text USING "produto"::text;--> statement-breakpoint
ALTER TABLE "lead_interesses" ALTER COLUMN "produto" TYPE text USING "produto"::text;--> statement-breakpoint
ALTER TABLE "propostas" ALTER COLUMN "tipo" TYPE text USING "tipo"::text;
