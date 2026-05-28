import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    ArrowUpDown,
    Filter,
    Package,
    Search,
    ShieldCheck,
    SlidersHorizontal,
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

const selectClassName =
    "h-9 min-w-[132px] rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-foreground outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10";

function HiddenFields({
    view,
    mode,
}: Pick<CarteiraFiltersProps, "view" | "mode">) {
    return (
        <>
            <input type="hidden" name="view" value={view} />
            {view === "clientes" ? <input type="hidden" name="mode" value={mode ?? "cards"} /> : null}
        </>
    );
}

function FiltersFields({
    view,
    q,
    produto,
    statusCarteira,
    sort = "entrada_desc",
}: CarteiraFiltersProps) {
    return (
        <>
            <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    name="q"
                    defaultValue={q}
                    placeholder="Buscar cliente, telefone ou email..."
                    className="h-9 rounded-xl border-white/10 bg-black/20 pl-8 shadow-inner shadow-black/10"
                />
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                <Label htmlFor="produto" className="sr-only">
                    Produto
                </Label>
                <select id="produto" name="produto" defaultValue={produto} className={selectClassName}>
                    <option value="">Todos</option>
                    <option value="imobiliario">Imobiliario</option>
                    <option value="auto">Auto</option>
                    <option value="pesados">Pesados</option>
                </select>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                <Label htmlFor="status_carteira" className="sr-only">
                    Status da carteira
                </Label>
                <select
                    id="status_carteira"
                    name="status_carteira"
                    defaultValue={statusCarteira}
                    className={selectClassName}
                >
                    <option value="">Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="arquivado">Arquivado</option>
                </select>
            </div>

            {view === "clientes" ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <Label htmlFor="sort" className="sr-only">
                        Ordenar por
                    </Label>
                    <select id="sort" name="sort" defaultValue={sort} className={selectClassName}>
                        <option value="entrada_desc">Entrada mais recente</option>
                        <option value="nome_asc">Nome (A-Z)</option>
                        <option value="total_desc">Maior valor total</option>
                        <option value="qtd_cartas_desc">Mais cartas</option>
                        <option value="maior_carta_desc">Maior carta</option>
                    </select>
                </div>
            ) : null}
        </>
    );
}

function IncludeAllToggle({ includeAll }: Pick<CarteiraFiltersProps, "includeAll">) {
    return (
        <label className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Incluir todos
            <Switch name="all" value="1" defaultChecked={includeAll} />
        </label>
    );
}

export function CarteiraFilters(props: CarteiraFiltersProps) {
    return (
        <>
            <div className="hidden md:block">
                <form method="GET" className="flex flex-wrap items-center gap-2">
                    <HiddenFields view={props.view} mode={props.mode} />
                    <FiltersFields {...props} />
                    <IncludeAllToggle includeAll={props.includeAll} />

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-white/10 bg-white/[0.03] px-3 text-xs text-muted-foreground hover:bg-white/[0.06] hover:text-foreground xl:hidden"
                    >
                        <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                        Mais filtros
                    </Button>

                    <Button type="submit" size="sm" className="h-9 rounded-xl px-4">
                        Aplicar
                    </Button>
                </form>
            </div>

            <div className="md:hidden">
                <form method="GET" className="flex items-center gap-2">
                    <HiddenFields view={props.view} mode={props.mode} />

                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="q"
                            defaultValue={props.q}
                            placeholder="Buscar cliente..."
                            className="h-9 rounded-xl border-white/10 bg-black/20 pl-9 shadow-inner shadow-black/10"
                        />
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-xl border-white/10 bg-white/[0.03]"
                            >
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
                                <HiddenFields view={props.view} mode={props.mode} />

                                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                    <FiltersFields {...props} />
                                    <IncludeAllToggle includeAll={props.includeAll} />
                                </div>

                                <SheetFooter className="pt-2">
                                    <Button type="submit" className="w-full">
                                        Aplicar filtros
                                    </Button>
                                </SheetFooter>
                            </form>
                        </SheetContent>
                    </Sheet>
                </form>
            </div>
        </>
    );
}
