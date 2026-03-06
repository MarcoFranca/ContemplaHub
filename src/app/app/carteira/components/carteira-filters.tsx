import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type CarteiraFiltersProps = {
    view: "clientes" | "cartas";
    q: string;
    produto: string;
    statusCarteira: string;
    includeAll: boolean;
    sort?: string;
    mode?: "cards" | "lista";
};

export function CarteiraFilters({
                                    view,
                                    q,
                                    produto,
                                    statusCarteira,
                                    includeAll,
                                    sort = "entrada_desc",
                                    mode = "cards",
                                }: CarteiraFiltersProps) {
    return (
        <Card className="bg-white/5 border-white/10">
            <CardContent className="py-4">
                <form className="flex flex-col gap-3" method="GET">
                    <input type="hidden" name="view" value={view} />
                    {view === "clientes" && <input type="hidden" name="mode" value={mode} />}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                        <div className="xl:col-span-2">
                            <Label>Buscar cliente</Label>
                            <Input
                                name="q"
                                defaultValue={q}
                                placeholder="Nome, telefone ou email..."
                            />
                        </div>

                        <div>
                            <Label>Produto</Label>
                            <select
                                name="produto"
                                defaultValue={produto}
                                className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="imobiliario">Imobiliário</option>
                                <option value="auto">Auto</option>
                                <option value="pesados">Pesados</option>
                            </select>
                        </div>

                        <div>
                            <Label>Status da carteira</Label>
                            <select
                                name="status_carteira"
                                defaultValue={statusCarteira}
                                className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                                <option value="arquivado">Arquivado</option>
                            </select>
                        </div>

                        {view === "clientes" && (
                            <div>
                                <Label>Ordenar por</Label>
                                <select
                                    name="sort"
                                    defaultValue={sort}
                                    className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                                >
                                    <option value="entrada_desc">Entrada mais recente</option>
                                    <option value="nome_asc">Nome (A-Z)</option>
                                    <option value="total_desc">Maior valor total</option>
                                    <option value="qtd_cartas_desc">Mais cartas</option>
                                    <option value="maior_carta_desc">Maior carta</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Switch name="all" value="1" defaultChecked={includeAll} />
                            <span className="text-sm text-muted-foreground">Incluir todos</span>
                        </div>

                        <Button type="submit">Aplicar</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}