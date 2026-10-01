import { LayoutGrid } from "lucide-react";

export type CellStatus = "pago" | "pendente" | "atrasado" | "a_receber";

export type CartaCell = {
    mes: string; // YYYY-MM
    valor: number;
    status: CellStatus;
};

export type CartaTimeline = {
    cota_id: string;
    cliente_nome: string;
    numero_cota: string;
    grupo_codigo: string;
    cells: CartaCell[];
};

const money = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const mesAbbr = (key: string) => {
    if (!key) return "—";
    const [y, m] = key.split("-");
    const s = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(Number(y), Number(m) - 1, 1));
    return s.replace(".", "");
};
const mesFull = (key: string) => {
    if (!key) return "sem competência";
    const [y, m] = key.split("-");
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(Number(y), Number(m) - 1, 1));
};

const CELL: Record<CellStatus, { cls: string; label: string }> = {
    pago: { cls: "border-emerald-500/40 bg-emerald-500/25 text-emerald-100", label: "Pago" },
    pendente: { cls: "border-amber-400/40 bg-amber-400/25 text-amber-100", label: "Este mês" },
    atrasado: { cls: "border-rose-500/40 bg-rose-500/25 text-rose-100", label: "Atrasado" },
    a_receber: { cls: "border-white/10 bg-white/[0.04] text-muted-foreground", label: "A receber" },
};

function Legenda() {
    return (
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            {(Object.keys(CELL) as CellStatus[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                    <span className={`inline-block h-3 w-3 rounded border ${CELL[s].cls}`} />
                    {CELL[s].label}
                </span>
            ))}
        </div>
    );
}

export function CartasVisao({ cartas }: { cartas: CartaTimeline[] }) {
    if (cartas.length === 0) return null;

    return (
        <details className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <LayoutGrid className="h-4 w-4 text-emerald-400" />
                    Visão das cartas ({cartas.length})
                </span>
                <span className="text-xs text-muted-foreground group-open:hidden">abrir panorama</span>
                <span className="hidden text-xs text-muted-foreground group-open:inline">fechar</span>
            </summary>

            <div className="space-y-4 border-t border-white/5 p-4">
                <Legenda />
                <div className="space-y-4">
                    {cartas.map((c) => {
                        const cont = { pago: 0, pendente: 0, atrasado: 0, a_receber: 0 } as Record<CellStatus, number>;
                        c.cells.forEach((cell) => (cont[cell.status] += 1));
                        return (
                            <div key={c.cota_id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                    <div className="min-w-0 text-sm">
                                        <span className="font-semibold text-foreground">{c.cliente_nome}</span>
                                        <span className="text-muted-foreground"> · {c.grupo_codigo} · Cota {c.numero_cota}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                        {cont.atrasado > 0 && <span className="text-rose-300">{cont.atrasado} atrasado{cont.atrasado !== 1 ? "s" : ""}</span>}
                                        {cont.pendente > 0 && <span className="text-amber-300">{cont.pendente} este mês</span>}
                                        <span className="text-emerald-300">{cont.pago} pago{cont.pago !== 1 ? "s" : ""}</span>
                                        <span>{cont.a_receber} a receber</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.cells.map((cell, i) => (
                                        <span
                                            key={`${cell.mes}-${i}`}
                                            title={`${mesFull(cell.mes)} · ${money(cell.valor)} · ${CELL[cell.status].label}`}
                                            className={`inline-flex h-7 w-11 items-center justify-center rounded-md border text-[10px] font-medium capitalize ${CELL[cell.status].cls}`}
                                        >
                                            {mesAbbr(cell.mes)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </details>
    );
}
