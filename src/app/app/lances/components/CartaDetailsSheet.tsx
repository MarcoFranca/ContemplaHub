"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Building2,
    CalendarDays,
    ChevronDown,
    CheckCircle2,
    CircleDollarSign,
    History,
    Loader2,
    PencilLine,
    Save,
    ScrollText,
    Target,
    UserRound,
    XCircle,
} from "lucide-react";

import { LanceMesCard } from "./LanceMesCard";
import { StrategyPanel } from "./strategy-panel";
import {
    atualizarResultadoLanceAction,
    getLanceCartaDetalhe,
    salvarEstrategiaCartaAction,
} from "../actions/carta-actions";
import type { LanceCartaListItem, LancesCartaDetalhe } from "../types";
import { formatPercent } from "../lib/operacao";

type Props = {
    item: LanceCartaListItem;
    competencia: string;
};

function money(v?: number | null) {
    if (v == null) return "—";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(v);
}

function fmtDate(v?: string | null) {
    if (!v) return "—";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
        new Date(`${v}T00:00:00`)
    );
}

const resultadoStyle: Record<string, string> = {
    contemplado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    nao_contemplado: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    cancelado: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    desconsiderado: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    pendente: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    sem_lance: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

function resultadoLabel(value?: string | null) {
    switch (value) {
        case "contemplado":
            return "Contemplado";
        case "nao_contemplado":
            return "Não contemplado";
        case "cancelado":
            return "Cancelado";
        case "desconsiderado":
            return "Desconsiderado";
        case "pendente":
            return "Pendente";
        case "sem_lance":
            return "Sem lance";
        default:
            return value || "—";
    }
}

function baseCalculoLabel(value?: string | null) {
    if (value === "valor_carta") return "Valor da carta";
    if (value === "saldo_devedor") return "Saldo devedor";
    return "Não informada";
}

function HistoricoLances({
    detalhe,
    cotaId,
    onUpdated,
}: {
    detalhe: LancesCartaDetalhe | null;
    cotaId: string;
    onUpdated: () => Promise<void>;
}) {
    const lances = detalhe?.historico_lances ?? [];
    const [updatingId, setUpdatingId] = React.useState<string | null>(null);

    async function updateResultado(
        lance: LancesCartaDetalhe["historico_lances"][number],
        resultado: "contemplado" | "nao_contemplado"
    ) {
        if (!lance.assembleia_data) {
            toast.error("Este lance não possui data de assembleia.");
            return;
        }

        setUpdatingId(lance.id);
        try {
            const result = await atualizarResultadoLanceAction({
                lanceId: lance.id,
                cotaId,
                resultado,
                assembleiaData: lance.assembleia_data,
                competencia: `${lance.assembleia_data.slice(0, 7)}-01`,
                percentual: lance.percentual,
            });

            if (!result.ok) {
                toast.error(result.error || "Não foi possível atualizar o resultado.");
                return;
            }

            toast.success(
                resultado === "contemplado"
                    ? "Lance e carta marcados como contemplados."
                    : "Lance marcado como não contemplado."
            );
            await onUpdated();
        } catch {
            toast.error("Não foi possível confirmar a atualização. Reabra o histórico e verifique o resultado.");
        } finally {
            setUpdatingId(null);
        }
    }

    if (!lances.length) {
        return (
            <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                Nenhum lance registrado ainda. Ao dar um lance na operadora (ou em caso de
                sorteio), registre aqui para manter o histórico da carta.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {lances.map((lance) => {
                const isSemLance =
                    lance.origem === "sem_lance" || lance.resultado === "sem_lance";
                const composicao = lance.pagamento?.composicao;
                const recursos = [
                    { label: "Lance embutido", value: Number(composicao?.embutido ?? 0) },
                    { label: "FGTS", value: Number(composicao?.fgts ?? 0) },
                    { label: "Recurso próprio", value: Number(composicao?.proprio ?? 0) },
                    { label: "Outros recursos", value: Number(composicao?.outro ?? 0) },
                ];
                const totalComposicao = recursos.reduce((total, recurso) => total + recurso.value, 0);

                return isSemLance ? (
                    <div
                        key={lance.id}
                        className="rounded-lg border border-white/10 bg-black/20 p-3"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-100">
                                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                {fmtDate(lance.assembleia_data)}
                            </span>

                            <Badge
                                variant="outline"
                                className={resultadoStyle[lance.resultado ?? ""] ?? ""}
                            >
                                {resultadoLabel(lance.resultado)}
                            </Badge>
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Sem lance no mês — foi para sorteio (decisão registrada).
                        </p>
                    </div>
                ) : (
                    <details
                        key={lance.id}
                        className="group rounded-lg border border-white/10 bg-black/20 transition-colors open:border-emerald-500/25 open:bg-emerald-500/[0.04]"
                    >
                        <summary className="cursor-pointer list-none p-3 [&::-webkit-details-marker]:hidden">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-100">
                                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                    {fmtDate(lance.assembleia_data)}
                                </span>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={resultadoStyle[lance.resultado ?? ""] ?? ""}
                                    >
                                        {resultadoLabel(lance.resultado)}
                                    </Badge>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                                </div>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                <span className="capitalize text-slate-200">
                                    {lance.tipo || "—"}
                                </span>
                                <span className="text-white/20">·</span>
                                <span>{formatPercent(lance.percentual ?? undefined)}</span>
                                <span className="text-white/20">·</span>
                                <span>{money(lance.valor)}</span>
                                {lance.origem ? (
                                    <>
                                        <span className="text-white/20">·</span>
                                        <span className="capitalize">{lance.origem}</span>
                                    </>
                                ) : null}
                            </div>

                            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                <CircleDollarSign className="h-3.5 w-3.5" />
                                Ver composição do lance
                            </span>
                        </summary>

                        <div className="border-t border-white/10 px-3 py-3">
                            {composicao ? (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        {recursos.map((recurso) => (
                                            <div
                                                key={recurso.label}
                                                className="rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                                            >
                                                <p className="text-[11px] text-muted-foreground">
                                                    {recurso.label}
                                                </p>
                                                <p className={`mt-1 text-sm font-medium tabular-nums ${
                                                    recurso.value > 0 ? "text-slate-100" : "text-slate-500"
                                                }`}>
                                                    {money(recurso.value)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-sm">
                                        <span className="text-muted-foreground">Total da composição</span>
                                        <strong className="tabular-nums text-emerald-300">
                                            {money(totalComposicao)}
                                        </strong>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Este lance antigo não possui composição financeira registrada.
                                </p>
                            )}

                            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                <span>Base de cálculo</span>
                                <span className="font-medium text-slate-300">
                                    {baseCalculoLabel(lance.base_calculo)}
                                </span>
                            </div>

                            {lance.resultado === "pendente" ? (
                                <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                                        disabled={updatingId === lance.id}
                                        onClick={() => updateResultado(lance, "nao_contemplado")}
                                    >
                                        {updatingId === lance.id ? (
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                        )}
                                        Não contemplado
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                disabled={updatingId === lance.id}
                                            >
                                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                                Contemplado
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirmar contemplação?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    O lance de {fmtDate(lance.assembleia_data)} será marcado
                                                    como contemplado e a carta sairá da carteira ativa.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                    onClick={() => updateResultado(lance, "contemplado")}
                                                >
                                                    Confirmar contemplação
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ) : null}

                            {(lance.pagamento?.observacoes || lance.observacoes) ? (
                                <p className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
                                    {lance.pagamento?.observacoes || lance.observacoes}
                                </p>
                            ) : null}
                        </div>
                    </details>
                );
            })}
        </div>
    );
}

export function CartaDetailsSheet({ item, competencia }: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [detalhe, setDetalhe] = React.useState<LancesCartaDetalhe | null>(null);

    const [editStrategy, setEditStrategy] = React.useState(false);
    const [estrategia, setEstrategia] = React.useState(item.estrategia ?? "");
    const [saving, setSaving] = React.useState(false);

    async function refreshDetalhe() {
        const data = await getLanceCartaDetalhe(item.cota_id, competencia);
        setDetalhe(data);
        router.refresh();
    }

    React.useEffect(() => {
        if (!open) return;

        let active = true;
        setLoading(true);
        getLanceCartaDetalhe(item.cota_id, competencia)
            .then((data) => {
                if (!active) return;
                setDetalhe(data);
                setEstrategia(data.cota.estrategia ?? item.estrategia ?? "");
            })
            .catch((err) => {
                if (!active) return;
                toast.error(
                    err instanceof Error ? err.message : "Erro ao carregar detalhes da carta."
                );
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [open, item.cota_id, item.estrategia, competencia]);

    async function handleSaveStrategy() {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.set("cotaId", item.cota_id);
            formData.set("estrategia", estrategia);
            formData.set("objetivo", detalhe?.cota.objetivo ?? "");
            await salvarEstrategiaCartaAction(formData);
            toast.success("Estratégia atualizada.");
            setEditStrategy(false);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao salvar estratégia.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <ScrollText className="mr-2 h-4 w-4" />
                    Detalhes & histórico
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader className="p-4">
                    <SheetTitle className="flex flex-wrap items-center gap-2 text-base">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {item.administradora_nome || "—"}
                        <span className="text-white/30">•</span>
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        {item.cliente_nome || "—"}
                    </SheetTitle>
                    <SheetDescription>
                        Grupo {item.grupo_codigo} • Cota {item.numero_cota} ·{" "}
                        {money(item.valor_carta)}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 px-4 pb-6">
                    <LanceMesCard item={item} />

                    <StrategyPanel item={item} />

                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                <Target className="h-3.5 w-3.5" />
                                Estratégia da carta
                            </p>

                            {!editStrategy && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditStrategy(true)}
                                >
                                    <PencilLine className="mr-1.5 h-3.5 w-3.5" />
                                    Editar
                                </Button>
                            )}
                        </div>

                        {editStrategy ? (
                            <div className="space-y-2">
                                <Textarea
                                    value={estrategia}
                                    onChange={(e) => setEstrategia(e.target.value)}
                                    rows={5}
                                    placeholder="Descreva a estratégia de lance para este cliente/carta (uma linha por orientação)."
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditStrategy(false);
                                            setEstrategia(
                                                detalhe?.cota.estrategia ?? item.estrategia ?? ""
                                            );
                                        }}
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                        onClick={handleSaveStrategy}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Save className="mr-1.5 h-3.5 w-3.5" />
                                        )}
                                        Salvar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="whitespace-pre-line rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-100">
                                {(detalhe?.cota.estrategia ?? item.estrategia ?? "").trim() ||
                                    "Nenhuma estratégia cadastrada para esta carta."}
                            </p>
                        )}
                    </section>

                    <section className="space-y-3">
                        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <History className="h-3.5 w-3.5" />
                            Histórico de lances
                        </p>

                        {loading ? (
                            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Carregando histórico…
                            </p>
                        ) : (
                            <HistoricoLances
                                detalhe={detalhe}
                                cotaId={item.cota_id}
                                onUpdated={refreshDetalhe}
                            />
                        )}
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
