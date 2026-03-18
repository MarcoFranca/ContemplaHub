import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    ArrowUpDown,
    Filter,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Package,
    Users,
} from "lucide-react";

type CarteiraFiltersProps = {
    view: "clientes" | "cartas";
    q: string;
    produto: string;
    statusCarteira: string;
    includeAll: boolean;
    sort?: string;
    mode?: "cards" | "lista";
};

function FiltersFields({
                           view,
                           q,
                           produto,
                           statusCarteira,
                           includeAll,
                           sort = "entrada_desc",
                           mode = "cards",
                       }: CarteiraFiltersProps) {
    return (
        <>
            <input type="hidden" name="view" value={view} />
            {view === "clientes" && <input type="hidden" name="mode" value={mode} />}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className="xl:col-span-2">
                    <Label className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Search className="h-3.5 w-3.5" />
                        Buscar cliente
                    </Label>
                    <Input
                        name="q"
                        defaultValue={q}
                        placeholder="Nome, telefone ou email..."
                        className="h-9"
                    />
                </div>

                <div>
                    <Label className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        Produto
                    </Label>
                    <select
                        name="produto"
                        defaultValue={produto}
                        className="h-9 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                    >
                        <option value="">Todos</option>
                        <option value="imobiliario">Imobiliário</option>
                        <option value="auto">Auto</option>
                        <option value="pesados">Pesados</option>
                    </select>
                </div>

                <div>
                    <Label className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Status da carteira
                    </Label>
                    <select
                        name="status_carteira"
                        defaultValue={statusCarteira}
                        className="h-9 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                    >
                        <option value="">Todos</option>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="arquivado">Arquivado</option>
                    </select>
                </div>

                {view === "clientes" && (
                    <div>
                        <Label className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            Ordenar por
                        </Label>
                        <select
                            name="sort"
                            defaultValue={sort}
                            className="h-9 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
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

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                    <Switch name="all" value="1" defaultChecked={includeAll} />
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Incluir todos
          </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button type="submit" size="sm">
                        Aplicar
                    </Button>
                </div>
            </div>
        </>
    );
}

export function CarteiraFilters(props: CarteiraFiltersProps) {
    return (
        <>
            <div className="hidden md:block">
                <Card className="border-white/10 bg-white/5">
                    <CardContent className="py-3">
                        <form className="flex flex-col gap-3" method="GET">
                            <FiltersFields {...props} />
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="md:hidden">
                <Card className="border-white/10 bg-white/5">
                    <CardContent className="py-3">
                        <form method="GET" className="flex items-center gap-2">
                            <input type="hidden" name="view" value={props.view} />
                            {props.view === "clientes" && (
                                <input type="hidden" name="mode" value={props.mode ?? "cards"} />
                            )}

                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    name="q"
                                    defaultValue={props.q}
                                    placeholder="Buscar cliente..."
                                    className="h-9 pl-9"
                                />
                            </div>

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button type="button" variant="outline" size="sm">
                                        <SlidersHorizontal className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>

                                <SheetContent side="bottom" className="rounded-t-2xl border-white/10 bg-slate-950/95">
                                    <SheetHeader className="mb-4">
                                        <SheetTitle className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            Filtros da carteira
                                        </SheetTitle>
                                    </SheetHeader>

                                    <form method="GET" className="space-y-4">
                                        <FiltersFields {...props} />
                                        <SheetFooter className="pt-2">
                                            <Button type="submit" className="w-full">
                                                Aplicar filtros
                                            </Button>
                                        </SheetFooter>
                                    </form>
                                </SheetContent>
                            </Sheet>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}