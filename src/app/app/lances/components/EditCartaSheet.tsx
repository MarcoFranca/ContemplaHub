"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    BadgePercent,
    Building2,
    CircleDollarSign,
    FileText,
    FolderKanban,
    Goal,
    Plus,
    Save,
    ShieldCheck,
    Sparkles,
    Trash2,
    WalletCards,
} from "lucide-react";
import {
    getComissaoCotaAction,
    listParceirosForSelectAction,
    saveComissaoCotaAction,
    updateCartaAction,
    getContratoByCotaAction,
} from "../actions";
import type { CotaComissaoPayload, ParceiroSelectOption } from "../types";
import { ComissaoConfigSection } from "./comissao/ComissaoConfigSection";
import { gerarLancamentosContratoAction } from "@/app/app/comissoes/actions";

type LanceFixoOpcaoForm = {
    id?: string;
    localId: string;
    percentual: string;
    ordem: number;
    ativo: boolean;
    observacoes: string;
};

type DiagnosticoSuggestion = {
    estrategia_lance?: string | null;
    lance_base_pct?: number | null;
    lance_max_pct?: number | null;
    readiness_score?: number | null;
};


function getDefaultComissaoPayload(): CotaComissaoPayload {
    return {
        percentual_total: 0,
        base_calculo: "valor_carta",
        modo: "avista",
        imposto_padrao_pct: 10,
        primeira_competencia_regra: "mes_adesao",
        furo_meses_override: null,
        ativo: true,
        observacoes: "",
        regras: [
            {
                ordem: 1,
                tipo_evento: "adesao",
                offset_meses: 0,
                percentual_comissao: 0,
                descricao: "",
            },
        ],
        parceiros: [],
    };
}

function normalizeComissaoPayload(payload?: Partial<CotaComissaoPayload> | null): CotaComissaoPayload {
    const base = getDefaultComissaoPayload();
    return {
        ...base,
        ...payload,
        regras: payload?.regras?.length ? payload.regras : base.regras,
        parceiros: payload?.parceiros ?? [],
    };
}

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cotaId: string;
    competencia?: string;
    initialData: {
        grupo_codigo: string;
        numero_cota: string;
        produto: string;
        valor_carta?: number | string | null;
        valor_parcela?: number | string | null;
        prazo?: number | null;
        status: string;
        autorizacao_gestao: boolean;
        embutido_permitido: boolean;
        embutido_max_percent?: number | string | null;
        fgts_permitido: boolean;
        tipo_lance_preferencial?: string | null;
        estrategia?: string | null;
        objetivo?: string | null;
        assembleia_dia?: number | null;
        data_adesao?: string | null;
    };
    opcoesLanceFixo?: Array<{
        id: string;
        cota_id: string;
        percentual: number | string;
        ordem: number;
        ativo: boolean;
        observacoes?: string | null;
        created_at?: string | null;
    }>;
    onSuccess?: () => void;
};

function toInputNumber(value?: number | string | null) {
    if (value === null || value === undefined) return "";
    return String(value);
}

function makeOpcao(ordem = 1): LanceFixoOpcaoForm {
    return {
        localId: crypto.randomUUID(),
        percentual: "",
        ordem,
        ativo: true,
        observacoes: "",
    };
}

function getCompetenciaDefault() {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    return `${ano}-${mes}-01`;
}

function normalizePreferencial(value?: string | null): string {
    const v = (value ?? "").trim().toLowerCase();

    if (v === "fixo") return "fixo";
    if (v === "livre") return "livre";
    if (v === "embutido") return "embutido";
    if (v === "sorteio") return "sorteio";

    return "";
}

function preferencialLabel(value?: string | null) {
    const v = normalizePreferencial(value);
    if (v === "fixo") return "Fixo";
    if (v === "livre") return "Livre";
    if (v === "embutido") return "Embutido";
    if (v === "sorteio") return "Sorteio";
    return "Não definido";
}

function formatPercent(value?: number | null) {
    if (value == null || Number.isNaN(value)) return "—";
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value) + "%";
}

function buildSuggestedObjetivo(
    diagnostico: DiagnosticoSuggestion | null | undefined,
    hasFixoAtivo: boolean
) {
    const tipo = normalizePreferencial(diagnostico?.estrategia_lance);

    if (tipo === "fixo") return "Contemplação por lance fixo";
    if (tipo === "livre") return "Contemplação por lance livre";
    if (tipo === "embutido") return "Contemplação com apoio de embutido";
    if (tipo === "sorteio") return "Acompanhar chance de contemplação por sorteio";
    if (hasFixoAtivo) return "Avaliar contemplação por lance fixo";

    return "Acompanhar oportunidade de contemplação e definir estratégia mensal";
}

function buildSuggestedStrategyText(args: {
    diagnostico: DiagnosticoSuggestion | null | undefined;
    hasFixoAtivo: boolean;
    fixos: LanceFixoOpcaoForm[];
    embutidoPermitido: boolean;
    embutidoMaxPercent?: string;
    fgtsPermitido: boolean;
}) {
    const {
        diagnostico,
        hasFixoAtivo,
        fixos,
        embutidoPermitido,
        embutidoMaxPercent,
        fgtsPermitido,
    } = args;

    const lines: string[] = [];
    const tipo = normalizePreferencial(diagnostico?.estrategia_lance);

    if (tipo === "fixo") {
        lines.push("Priorizar lance fixo como estratégia principal.");
    } else if (tipo === "livre") {
        lines.push("Priorizar lance livre com ajuste conforme a leitura da assembleia.");
    } else if (tipo === "embutido") {
        lines.push("Avaliar composição com lance embutido como parte da estratégia.");
    } else if (tipo === "sorteio") {
        lines.push("Sem preferência de lance definida no momento. Acompanhar chance de contemplação por sorteio e revisar estratégia mensalmente.");
    } else if (hasFixoAtivo) {
        lines.push("A carta possui opção de lance fixo ativa e deve ser considerada na operação.");
    } else {
        lines.push("Sem preferência definida. Operar com acompanhamento da assembleia e avaliar sorteio como cenário base.");
    }

    if (diagnostico?.lance_base_pct != null || diagnostico?.lance_max_pct != null) {
        lines.push(
            `Faixa sugerida de lance: base ${formatPercent(
                diagnostico?.lance_base_pct ?? null
            )} até máximo ${formatPercent(diagnostico?.lance_max_pct ?? null)}.`
        );
    }

    if (hasFixoAtivo && fixos.length > 0) {
        const ativos = fixos
            .filter((f) => f.ativo)
            .sort((a, b) => a.ordem - b.ordem)
            .map((f) => `${f.percentual}%`)
            .join(", ");

        if (ativos) {
            lines.push(`Opções fixas ativas cadastradas: ${ativos}.`);
        }
    }

    if (embutidoPermitido) {
        if (embutidoMaxPercent?.trim()) {
            lines.push(`Respeitar limite operacional de embutido de até ${embutidoMaxPercent}%.`);
        } else {
            lines.push("Validar composição com embutido antes do envio do lance.");
        }
    }

    if (fgtsPermitido) {
        lines.push("Validar possibilidade de uso de FGTS na composição do lance, quando aplicável.");
    }

    lines.push("Revisar estratégia antes da assembleia e ajustar conforme cenário do cliente.");

    return lines.join("\n");
}

function SectionTitle({
                          icon,
                          title,
                          subtitle,
                      }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="space-y-1">
            <h3 className="font-medium inline-flex items-center gap-2">
                {icon}
                {title}
            </h3>
            {subtitle ? (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
        </div>
    );
}

function SideInfoRow({
                         label,
                         value,
                     }: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <strong className="text-right">{value}</strong>
        </div>
    );
}

export function EditCartaSheet({
                                   open,
                                   onOpenChange,
                                   cotaId,
                                   competencia,
                                   initialData,
                                   opcoesLanceFixo = [],
                                   onSuccess,
                               }: Props) {
    const [grupoCodigo, setGrupoCodigo] = React.useState(initialData.grupo_codigo ?? "");
    const [numeroCota, setNumeroCota] = React.useState(initialData.numero_cota ?? "");
    const [produto, setProduto] = React.useState(initialData.produto ?? "imobiliario");
    const [valorCarta, setValorCarta] = React.useState(toInputNumber(initialData.valor_carta));
    const [valorParcela, setValorParcela] = React.useState(toInputNumber(initialData.valor_parcela));
    const [prazo, setPrazo] = React.useState(toInputNumber(initialData.prazo));
    const [assembleiaDia, setAssembleiaDia] = React.useState(toInputNumber(initialData.assembleia_dia));
    const [estrategia, setEstrategia] = React.useState(initialData.estrategia ?? "");
    const [objetivo, setObjetivo] = React.useState(initialData.objetivo ?? "");
    const [tipoLancePreferencial, setTipoLancePreferencial] = React.useState(
        initialData.tipo_lance_preferencial ?? ""
    );

    const [dataAdesao, setDataAdesao] = React.useState(initialData.data_adesao ?? "");

    const [autorizacaoGestao, setAutorizacaoGestao] = React.useState(
        Boolean(initialData.autorizacao_gestao)
    );
    const [embutidoPermitido, setEmbutidoPermitido] = React.useState(
        Boolean(initialData.embutido_permitido)
    );
    const [embutidoMaxPercent, setEmbutidoMaxPercent] = React.useState(
        toInputNumber(initialData.embutido_max_percent)
    );
    const [fgtsPermitido, setFgtsPermitido] = React.useState(Boolean(initialData.fgts_permitido));

    const [usaLanceFixo, setUsaLanceFixo] = React.useState(opcoesLanceFixo.length > 0);
    const [fixos, setFixos] = React.useState<LanceFixoOpcaoForm[]>(
        opcoesLanceFixo.map((op) => ({
            id: op.id,
            localId: crypto.randomUUID(),
            percentual: String(op.percentual ?? ""),
            ordem: op.ordem,
            ativo: Boolean(op.ativo),
            observacoes: op.observacoes ?? "",
        }))
    );

    const [loadingDiagnostico, setLoadingDiagnostico] = React.useState(false);
    const [diagnostico, setDiagnostico] = React.useState<DiagnosticoSuggestion | null>(null);
    const [suggestionApplied, setSuggestionApplied] = React.useState(false);
    const [loadingComissao, setLoadingComissao] = React.useState(false);
    const [parceirosDisponiveis, setParceirosDisponiveis] = React.useState<ParceiroSelectOption[]>([]);
    const [comissaoPayload, setComissaoPayload] = React.useState<CotaComissaoPayload>(getDefaultComissaoPayload());

    React.useEffect(() => {
        if (!open) return;
        setDataAdesao(initialData.data_adesao ?? "");
        setGrupoCodigo(initialData.grupo_codigo ?? "");
        setNumeroCota(initialData.numero_cota ?? "");
        setProduto(initialData.produto ?? "imobiliario");
        setValorCarta(toInputNumber(initialData.valor_carta));
        setValorParcela(toInputNumber(initialData.valor_parcela));
        setPrazo(toInputNumber(initialData.prazo));
        setAssembleiaDia(toInputNumber(initialData.assembleia_dia));
        setEstrategia(initialData.estrategia ?? "");
        setObjetivo(initialData.objetivo ?? "");
        setTipoLancePreferencial(initialData.tipo_lance_preferencial ?? "");
        setAutorizacaoGestao(Boolean(initialData.autorizacao_gestao));
        setEmbutidoPermitido(Boolean(initialData.embutido_permitido));
        setEmbutidoMaxPercent(toInputNumber(initialData.embutido_max_percent));
        setFgtsPermitido(Boolean(initialData.fgts_permitido));
        setUsaLanceFixo(opcoesLanceFixo.length > 0);
        setFixos(
            opcoesLanceFixo.map((op) => ({
                id: op.id,
                localId: crypto.randomUUID(),
                percentual: String(op.percentual ?? ""),
                ordem: op.ordem,
                ativo: Boolean(op.ativo),
                observacoes: op.observacoes ?? "",
            }))
        );
        setSuggestionApplied(false);
        setComissaoPayload(getDefaultComissaoPayload());
    }, [open, initialData, opcoesLanceFixo]);

    React.useEffect(() => {
        if (!open) return;

        let cancelled = false;

        async function loadDiagnosticoSuggestion() {
            try {
                setLoadingDiagnostico(true);

                const resolvedCompetencia = competencia || getCompetenciaDefault();
                const res = await fetch(
                    `/api/lances/cartas/${cotaId}?competencia=${encodeURIComponent(resolvedCompetencia)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                if (!res.ok) {
                    throw new Error("Falha ao carregar sugestão do diagnóstico.");
                }

                const detail = await res.json();

                if (!cancelled) {
                    setDiagnostico(detail?.diagnostico ?? null);
                }
            } catch (error) {
                console.error(error);
                if (!cancelled) {
                    setDiagnostico(null);
                }
            } finally {
                if (!cancelled) {
                    setLoadingDiagnostico(false);
                }
            }
        }

        void loadDiagnosticoSuggestion();

        return () => {
            cancelled = true;
        };
    }, [open, cotaId, competencia]);


    React.useEffect(() => {
        if (!open) return;

        let cancelled = false;

        async function loadComissao() {
            try {
                setLoadingComissao(true);
                const [configResponse, parceiros] = await Promise.all([
                    getComissaoCotaAction(cotaId),
                    listParceirosForSelectAction(),
                ]);

                if (cancelled) return;

                setParceirosDisponiveis(parceiros);
                setComissaoPayload(
                    normalizeComissaoPayload({
                        ...configResponse.config,
                        regras: configResponse.regras,
                        parceiros: configResponse.parceiros,
                    })
                );
            } catch (error) {
                console.error(error);
                if (!cancelled) {
                    setParceirosDisponiveis([]);
                    setComissaoPayload(getDefaultComissaoPayload());
                }
            } finally {
                if (!cancelled) setLoadingComissao(false);
            }
        }

        void loadComissao();

        return () => {
            cancelled = true;
        };
    }, [open, cotaId]);

    function addFixo() {
        setFixos((prev) => [...prev, makeOpcao(prev.length + 1)]);
    }

    function removeFixo(localId: string) {
        setFixos((prev) =>
            prev
                .filter((item) => item.localId !== localId)
                .map((item, idx) => ({ ...item, ordem: idx + 1 }))
        );
    }

    function updateFixo(localId: string, patch: Partial<LanceFixoOpcaoForm>) {
        setFixos((prev) => prev.map((item) => (item.localId === localId ? { ...item, ...patch } : item)));
    }

    function validateFixos() {
        if (!usaLanceFixo) return true;
        if (!fixos.length) {
            toast.error("Adicione ao menos uma opção de lance fixo.");
            return false;
        }

        const ordens = new Set<number>();
        const percentuais = new Set<string>();

        for (const item of fixos) {
            const percentual = Number(String(item.percentual).replace(",", "."));
            const ordem = Number(item.ordem);

            if (!item.percentual || Number.isNaN(percentual) || percentual <= 0 || percentual > 100) {
                toast.error("Revise os percentuais do lance fixo.");
                return false;
            }

            if (Number.isNaN(ordem) || ordem < 1) {
                toast.error("Revise a ordem das opções de lance fixo.");
                return false;
            }

            const pctKey = percentual.toFixed(4);
            if (percentuais.has(pctKey)) {
                toast.error("Não repita percentual nas opções de lance fixo.");
                return false;
            }

            if (ordens.has(ordem)) {
                toast.error("Não repita a ordem das opções de lance fixo.");
                return false;
            }

            ordens.add(ordem);
            percentuais.add(pctKey);
        }

        return true;
    }

    const fixosJson = React.useMemo(() => {
        if (!usaLanceFixo) return "[]";

        return JSON.stringify(
            fixos.map((item) => ({
                id: item.id ?? null,
                percentual: Number(String(item.percentual).replace(",", ".")),
                ordem: Number(item.ordem),
                ativo: Boolean(item.ativo),
                observacoes: item.observacoes?.trim() || null,
            }))
        );
    }, [usaLanceFixo, fixos]);

    const hasActiveFixo = React.useMemo(
        () => fixos.some((item) => item.ativo && item.percentual.trim()),
        [fixos]
    );

    const canApplySuggestion =
        !!diagnostico &&
        (
            !!normalizePreferencial(diagnostico.estrategia_lance) ||
            diagnostico.lance_base_pct != null ||
            diagnostico.lance_max_pct != null ||
            hasActiveFixo
        );

    function applyDiagnosticoSuggestion() {
        const suggestedTipo =
            normalizePreferencial(diagnostico?.estrategia_lance) ||
            (hasActiveFixo ? "fixo" : "sorteio");

        const suggestedObjetivo = buildSuggestedObjetivo(diagnostico, hasActiveFixo);
        const suggestedText = buildSuggestedStrategyText({
            diagnostico,
            hasFixoAtivo: hasActiveFixo,
            fixos,
            embutidoPermitido,
            embutidoMaxPercent,
            fgtsPermitido,
        });

        if (suggestedTipo) {
            setTipoLancePreferencial(suggestedTipo);
        }

        setObjetivo(suggestedObjetivo);
        setEstrategia(suggestedText);
        setSuggestionApplied(true);

        toast.success("Sugestão do diagnóstico aplicada na carta.");
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-5xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Editar carta</SheetTitle>
                    <SheetDescription>
                        Ajuste os dados operacionais, financeiros e a estratégia vigente da carta.
                    </SheetDescription>
                </SheetHeader>

                <form
                    action={async (formData: FormData) => {
                        if (!grupoCodigo || !numeroCota || !produto || !valorCarta) {
                            toast.error("Preencha os campos obrigatórios.");
                            return;
                        }

                        if (!validateFixos()) return;

                        try {
                            toast.dismiss();
                            toast.loading("Salvando carta...");

                            formData.set("data_adesao", dataAdesao || "");

                            await updateCartaAction(formData);
                            await saveComissaoCotaAction(cotaId, comissaoPayload);

                            const { contrato_id } = await getContratoByCotaAction(cotaId);

                            if (contrato_id) {
                                await gerarLancamentosContratoAction(contrato_id);
                                toast.dismiss();
                                toast.success("Carta, comissionamento e lançamentos atualizados com sucesso.");
                            } else {
                                toast.dismiss();
                                toast.success("Carta e comissionamento atualizados com sucesso. Ainda não existe contrato para gerar lançamentos.");
                            }

                            onOpenChange(false);
                            onSuccess?.();
                        } catch (error) {
                            console.error(error);
                            toast.dismiss();
                            toast.error("Erro ao atualizar carta.");
                        }
                    }}
                    className="mt-6 space-y-6"
                >
                    <input type="hidden" name="cotaId" value={cotaId} />
                    <input type="hidden" name="opcoesLanceFixoJson" value={fixosJson} />

                    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                        <div className="space-y-6">
                            <div
                                className={`rounded-xl border p-4 space-y-4 ${
                                    suggestionApplied
                                        ? "border-emerald-500/30 bg-emerald-500/5"
                                        : "border-emerald-500/20 bg-emerald-500/5"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                        <SectionTitle
                                            icon={<Sparkles className="h-4 w-4 text-emerald-400"/>}
                                            title="Sugestão do diagnóstico"
                                            subtitle="Use o diagnóstico como base e ajuste a estratégia operacional da carta."
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {suggestionApplied && (
                                            <Badge variant="secondary">Aplicada do diagnóstico</Badge>
                                        )}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={applyDiagnosticoSuggestion}
                                            disabled={!canApplySuggestion || loadingDiagnostico}
                                        >
                                            Aplicar sugestão
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="data_adesao">Data de adesão</Label>
                                    <Input
                                        id="data_adesao"
                                        type="date"
                                        value={dataAdesao}
                                        onChange={(e) => setDataAdesao(e.target.value)}
                                    />
                                </div>

                                {loadingDiagnostico ? (
                                    <p className="text-sm text-muted-foreground">
                                        Carregando recomendação do diagnóstico...
                                    </p>
                                ) : diagnostico ? (
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {normalizePreferencial(diagnostico.estrategia_lance) ? (
                                                <Badge variant="secondary">
                                                    Preferencial: {normalizePreferencial(diagnostico.estrategia_lance)}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Sem tipo sugerido</Badge>
                                            )}

                                            {diagnostico.lance_base_pct != null && (
                                                <Badge variant="outline">
                                                    Base: {formatPercent(diagnostico.lance_base_pct)}
                                                </Badge>
                                            )}

                                            {diagnostico.lance_max_pct != null && (
                                                <Badge variant="outline">
                                                    Máximo: {formatPercent(diagnostico.lance_max_pct)}
                                                </Badge>
                                            )}

                                            {diagnostico.readiness_score != null && (
                                                <Badge variant="outline">
                                                    Readiness: {diagnostico.readiness_score}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm whitespace-pre-line">
                                            {buildSuggestedStrategyText({
                                                diagnostico,
                                                hasFixoAtivo: hasActiveFixo,
                                                fixos,
                                                embutidoPermitido,
                                                embutidoMaxPercent,
                                                fgtsPermitido,
                                            })}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhum diagnóstico encontrado para sugerir estratégia automaticamente.
                                    </p>
                                )}
                            </div>

                            <div className="rounded-xl border p-4 space-y-4">
                                <SectionTitle
                                    icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
                                    title="Identificação"
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Grupo</Label>
                                        <Input
                                            name="grupo_codigo"
                                            value={grupoCodigo}
                                            onChange={(e) => setGrupoCodigo(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Número da cota</Label>
                                        <Input
                                            name="numero_cota"
                                            value={numeroCota}
                                            onChange={(e) => setNumeroCota(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Produto</Label>
                                        <select
                                            name="produto"
                                            value={produto}
                                            onChange={(e) => setProduto(e.target.value)}
                                            className="h-10 rounded-md border bg-background px-3 text-sm"
                                        >
                                            <option value="imobiliario">Imóvel</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Dia da assembleia</Label>
                                        <Input
                                            name="assembleia_dia"
                                            type="number"
                                            min={1}
                                            max={31}
                                            value={assembleiaDia}
                                            onChange={(e) => setAssembleiaDia(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border p-4 space-y-4">
                                <SectionTitle
                                    icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />}
                                    title="Dados financeiros"
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Valor da carta</Label>
                                        <Input
                                            name="valor_carta"
                                            value={valorCarta}
                                            onChange={(e) => setValorCarta(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Valor da parcela</Label>
                                        <Input
                                            name="valor_parcela"
                                            value={valorParcela}
                                            onChange={(e) => setValorParcela(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Prazo</Label>
                                        <Input
                                            name="prazo"
                                            type="number"
                                            value={prazo}
                                            onChange={(e) => setPrazo(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Tipo de lance preferencial</Label>
                                        <select
                                            name="tipo_lance_preferencial"
                                            value={tipoLancePreferencial}
                                            onChange={(e) => setTipoLancePreferencial(e.target.value)}
                                            className="h-10 rounded-md border bg-background px-3 text-sm"
                                        >
                                            <option value="">Selecione</option>
                                            <option value="livre">Livre</option>
                                            <option value="fixo">Fixo</option>
                                            <option value="embutido">Embutido</option>
                                            <option value="sorteio">Sorteio</option>
                                        </select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Embutido máximo (%)</Label>
                                        <Input
                                            name="embutido_max_percent"
                                            value={embutidoMaxPercent}
                                            onChange={(e) => setEmbutidoMaxPercent(e.target.value)}
                                            disabled={!embutidoPermitido}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 text-sm">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={autorizacaoGestao}
                                            onChange={(e) => setAutorizacaoGestao(e.target.checked)}
                                            name="autorizacao_gestao"
                                        />
                                        Autorização de gestão
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={embutidoPermitido}
                                            onChange={(e) => setEmbutidoPermitido(e.target.checked)}
                                            name="embutido_permitido"
                                        />
                                        Permite embutido
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={fgtsPermitido}
                                            onChange={(e) => setFgtsPermitido(e.target.checked)}
                                            name="fgts_permitido"
                                        />
                                        Permite FGTS
                                    </label>
                                </div>
                            </div>

                            <div className="rounded-xl border p-4 space-y-4">
                                <SectionTitle
                                    icon={<Goal className="h-4 w-4 text-muted-foreground" />}
                                    title="Estratégia operacional"
                                />

                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label>Objetivo</Label>
                                        <Input
                                            name="objetivo"
                                            value={objetivo}
                                            onChange={(e) => setObjetivo(e.target.value)}
                                            placeholder="Ex.: contemplação por lance fixo"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Estratégia</Label>
                                        <Textarea
                                            name="estrategia"
                                            value={estrategia}
                                            onChange={(e) => setEstrategia(e.target.value)}
                                            rows={7}
                                            placeholder="Descreva a estratégia operacional desta carta"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border p-4 space-y-4">
                                <SectionTitle
                                    icon={<BadgePercent className="h-4 w-4 text-muted-foreground" />}
                                    title="Modalidades de lance fixo"
                                    subtitle="Configure zero, uma ou várias opções por carta."
                                />

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={usaLanceFixo}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setUsaLanceFixo(checked);
                                            if (checked && fixos.length === 0) {
                                                setFixos([makeOpcao(1)]);
                                            }
                                            if (!checked) {
                                                setFixos([]);
                                            }
                                        }}
                                    />
                                    Esta carta possui lance fixo
                                </label>

                                {usaLanceFixo && (
                                    <div className="space-y-3">
                                        {fixos.map((item, index) => (
                                            <div key={item.localId} className="rounded-lg border p-3 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Opção {index + 1}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFixo(item.localId)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label>Percentual (%)</Label>
                                                        <Input
                                                            value={item.percentual}
                                                            onChange={(e) => updateFixo(item.localId, { percentual: e.target.value })}
                                                            placeholder="Ex.: 40"
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Ordem</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.ordem}
                                                            onChange={(e) =>
                                                                updateFixo(item.localId, { ordem: Number(e.target.value || 1) })
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid gap-2 md:col-span-2">
                                                        <Label>Observações</Label>
                                                        <Input
                                                            value={item.observacoes}
                                                            onChange={(e) => updateFixo(item.localId, { observacoes: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.ativo}
                                                        onChange={(e) => updateFixo(item.localId, { ativo: e.target.checked })}
                                                    />
                                                    Opção ativa
                                                </label>
                                            </div>
                                        ))}

                                        <Button type="button" variant="outline" onClick={addFixo}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar opção
                                        </Button>
                                    </div>
                                )}
                            </div>


                            <ComissaoConfigSection
                                value={comissaoPayload}
                                onChange={setComissaoPayload}
                                parceirosDisponiveis={parceirosDisponiveis}
                            />

                            {loadingComissao ? (
                                <p className="text-sm text-muted-foreground">Carregando configuração de comissão...</p>
                            ) : null}
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border p-4 space-y-4 sticky top-4">
                                <SectionTitle
                                    icon={<FolderKanban className="h-4 w-4 text-muted-foreground" />}
                                    title="Resumo rápido"
                                />

                                <div className="space-y-2">
                                    <SideInfoRow label="Grupo" value={grupoCodigo || "—"} />
                                    <SideInfoRow label="Cota" value={numeroCota || "—"} />
                                    <SideInfoRow label="Produto" value={produto || "—"} />
                                    <SideInfoRow
                                        label="Preferência"
                                        value={preferencialLabel(tipoLancePreferencial)}
                                    />
                                    <SideInfoRow
                                        label="Comissão"
                                        value={`${Number(comissaoPayload.percentual_total || 0).toFixed(2)}%`}
                                    />
                                </div>

                                <div className="pt-2 border-t space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {autorizacaoGestao ? (
                                            <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                Autorizada
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">Sem autorização</Badge>
                                        )}

                                        {embutidoPermitido && (
                                            <Badge variant="outline" className="inline-flex items-center gap-1.5">
                                                <WalletCards className="h-3.5 w-3.5" />
                                                Embutido
                                            </Badge>
                                        )}

                                        {fgtsPermitido && (
                                            <Badge variant="outline">FGTS</Badge>
                                        )}

                                        {hasActiveFixo && (
                                            <Badge variant="outline">Fixo ativo</Badge>
                                        )}
                                    </div>
                                </div>

                                {estrategia?.trim() && (
                                    <div className="pt-2 border-t space-y-2">
                                        <SectionTitle
                                            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                                            title="Leitura atual"
                                        />
                                        <p className="text-sm whitespace-pre-line text-muted-foreground">
                                            {estrategia.split("\n").slice(0, 4).join("\n")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Salvar alterações
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}