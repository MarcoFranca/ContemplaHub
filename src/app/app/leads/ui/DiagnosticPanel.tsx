// src/app/app/leads/ui/DiagnosticPanel.tsx
"use client";

import * as React from "react";
import { useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
    getLeadDiagnostic,
    saveLeadDiagnostic,
    type DiagnosticRecord,
    type DiagnosticInputDTO,
} from "@/app/app/leads/actions.diagnostic";

type Props = {
    leadId: string;
};

type FormState = {
    objetivo: string;
    prazo_meta_meses: string;
    preferencia_produto: string;
    regiao_preferencia: string;
    renda_mensal: string;
    reserva_inicial: string;
    comprometimento_max_pct: string;
    renda_provada: "sim" | "nao" | "";
    valor_carta_alvo: string;
    prazo_alvo_meses: string;
    estrategia_lance: string;
    lance_base_pct: string;
    lance_max_pct: string;
    janela_preferida_semanas: string;
    comentarios: string;
    perfil_psicologico: string;
};

const emptyForm: FormState = {
    objetivo: "",
    prazo_meta_meses: "",
    preferencia_produto: "",
    regiao_preferencia: "",
    renda_mensal: "",
    reserva_inicial: "",
    comprometimento_max_pct: "30",
    renda_provada: "",
    valor_carta_alvo: "",
    prazo_alvo_meses: "",
    estrategia_lance: "",
    lance_base_pct: "",
    lance_max_pct: "",
    janela_preferida_semanas: "",
    comentarios: "",
    perfil_psicologico: "",
};

function toFormState(rec: DiagnosticRecord | null): FormState {
    if (!rec) return emptyForm;
    const extras = (rec.extras || {}) as any;
    return {
        objetivo: rec.objetivo ?? "",
        prazo_meta_meses: rec.prazo_meta_meses?.toString() ?? "",
        preferencia_produto: rec.preferencia_produto ?? "",
        regiao_preferencia: rec.regiao_preferencia ?? "",
        renda_mensal: rec.renda_mensal?.toString() ?? "",
        reserva_inicial: rec.reserva_inicial?.toString() ?? "",
        comprometimento_max_pct: rec.comprometimento_max_pct?.toString() ?? "30",
        renda_provada:
            rec.renda_provada == null ? "" : rec.renda_provada ? "sim" : "nao",
        valor_carta_alvo: rec.valor_carta_alvo?.toString() ?? "",
        prazo_alvo_meses: rec.prazo_alvo_meses?.toString() ?? "",
        estrategia_lance: rec.estrategia_lance ?? "",
        lance_base_pct: rec.lance_base_pct?.toString() ?? "",
        lance_max_pct: rec.lance_max_pct?.toString() ?? "",
        janela_preferida_semanas: rec.janela_preferida_semanas?.toString() ?? "",
        comentarios: extras.comentarios ?? "",
        perfil_psicologico: extras.perfil_psicologico ?? "",
    };
}

function toDTO(form: FormState): DiagnosticInputDTO {
    const num = (v: string): number | null =>
        v.trim() ? Number(v.replace(",", ".")) || null : null;

    return {
        objetivo: form.objetivo || null,
        prazo_meta_meses: form.prazo_meta_meses
            ? Number(form.prazo_meta_meses)
            : null,
        preferencia_produto: form.preferencia_produto || null,
        regiao_preferencia: form.regiao_preferencia || null,
        renda_mensal: num(form.renda_mensal),
        reserva_inicial: num(form.reserva_inicial),
        comprometimento_max_pct: num(form.comprometimento_max_pct),
        renda_provada:
            form.renda_provada === ""
                ? null
                : form.renda_provada === "sim"
                    ? true
                    : false,
        valor_carta_alvo: num(form.valor_carta_alvo),
        prazo_alvo_meses: form.prazo_alvo_meses
            ? Number(form.prazo_alvo_meses)
            : null,
        estrategia_lance: form.estrategia_lance || null,
        lance_base_pct: num(form.lance_base_pct),
        lance_max_pct: num(form.lance_max_pct),
        janela_preferida_semanas: form.janela_preferida_semanas
            ? Number(form.janela_preferida_semanas)
            : null,
        extras: {
            comentarios: form.comentarios || "",
            perfil_psicologico: form.perfil_psicologico || "",
        },
        consent_scope: "diagnostico_form",
    };
}

// --- helpers de insight simples ---

function formatMoneySimple(v: number | null | undefined): string {
    if (v == null) return "—";
    // R$ 300.000
    const s = Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `R$ ${s}`;
}

function insightLinhaDoTempo(rec: DiagnosticRecord | null): string {
    if (!rec?.prazo_meta_meses || !rec?.prazo_alvo_meses) return "Definir prazo meta e prazo da carta para traçar a jornada.";
    if (rec.prazo_meta_meses < rec.prazo_alvo_meses) {
        return "Prazo meta menor que o prazo da carta: trabalhar estratégia de lances e eventuais aportes para antecipar contemplação.";
    }
    return "Prazo da carta alinhado à meta: reforçar disciplina de pagamento e planos de lance para reduzir risco de frustração.";
}

function insightCapacidade(rec: DiagnosticRecord | null): string {
    if (!rec) return "Preencha renda, comprometimento e valor da carta para avaliar capacidade de parcela.";
    if (
        rec.renda_mensal == null ||
        rec.comprometimento_max_pct == null ||
        rec.valor_carta_alvo == null ||
        rec.prazo_alvo_meses == null
    ) {
        return "Dados financeiros incompletos: sem isso o score de prontidão pode estar subestimado.";
    }
    const maxParcela = rec.renda_mensal * (rec.comprometimento_max_pct / 100);
    const parcelaTeorica = rec.valor_carta_alvo / Math.max(rec.prazo_alvo_meses, 1);
    const ratio = parcelaTeorica > 0 ? maxParcela / parcelaTeorica : 0;

    if (ratio >= 1.5) {
        return "Parcela cabe folgadamente na renda: validar se faz sentido aumentar carta ou reduzir prazo para acelerar objetivo.";
    }
    if (ratio >= 1.0) {
        return "Parcela compatível com a renda: foco em manter disciplina e planejar lances estratégicos.";
    }
    if (ratio >= 0.7) {
        return "Parcela no limite da renda: alinhar expectativas e talvez ajustar prazo ou valor da carta para conforto maior.";
    }
    return "Parcela acima do confortável: revisar carta/prazo ou buscar composição de renda para reduzir risco de inadimplência.";
}

function insightReserva(rec: DiagnosticRecord | null): string {
    if (!rec?.reserva_inicial || !rec?.valor_carta_alvo) {
        return "Sem informação de reserva inicial: entender se há FGTS, poupança ou bens para estratégia de lance.";
    }
    const pct = rec.reserva_inicial / Math.max(rec.valor_carta_alvo, 1);
    if (pct >= 0.2) return "Boa reserva inicial: forte candidato a lances agressivos nas primeiras assembleias.";
    if (pct >= 0.1) return "Reserva razoável: definir janelas ideais de lance e porcentagens progressivas.";
    return "Reserva baixa: trabalhar mais foco em disciplina de pagamento e eventuais aportes futuros.";
}

export function DiagnosticPanel({ leadId }: Props) {
    const [loading, setLoading] = React.useState(true);
    const [record, setRecord] = React.useState<DiagnosticRecord | null>(null);
    const [form, setForm] = React.useState<FormState>(emptyForm);
    const [isPending, startTransition] = useTransition();

    // carrega diagnóstico (se existir)
    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const rec = await getLeadDiagnostic(leadId);
                if (!cancelled) {
                    setRecord(rec);
                    setForm(toFormState(rec));
                }
            } catch (e) {
                console.error("Erro ao carregar diagnóstico:", e);
                if (!cancelled) toast.error("Erro ao carregar diagnóstico.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [leadId]);

    function handleChange<K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        startTransition(async () => {
            try {
                toast.loading("Salvando diagnóstico…");
                const dto = toDTO(form);
                const resp = await saveLeadDiagnostic(leadId, dto);
                toast.dismiss();
                toast.success("Diagnóstico salvo com sucesso!");

                if (resp?.record) {
                    setRecord(resp.record);
                    setForm(toFormState(resp.record));
                }
            } catch (err) {
                console.error(err);
                toast.dismiss();
                toast.error("Erro ao salvar diagnóstico.");
            }
        });
    }

    const ready = record?.readiness_score ?? null;
    const risco = record?.score_risco ?? null;
    const probConv = record?.prob_conversao ?? null;

    if (loading) {
        return (
            <div className="py-10 text-center text-sm text-muted-foreground">
                Carregando diagnóstico…
            </div>
        );
    }

    const hasRecord = !!record;

    // --- conteúdo do formulário (reaproveitado em aba "Editar") ---
    const formNode = (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Objetivo & contexto */}
            <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                    <Label>Objetivo</Label>
                    <Input
                        value={form.objetivo}
                        onChange={(e) => handleChange("objetivo", e.target.value)}
                        placeholder="Comprar primeiro imóvel, trocar carro, etc."
                    />
                </div>
                <div className="grid gap-1">
                    <Label>Prazo meta (meses)</Label>
                    <Input
                        type="number"
                        value={form.prazo_meta_meses}
                        onChange={(e) => handleChange("prazo_meta_meses", e.target.value)}
                        placeholder="Ex.: 60"
                    />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                    <Label>Preferência de produto</Label>
                    <Input
                        value={form.preferencia_produto}
                        onChange={(e) =>
                            handleChange("preferencia_produto", e.target.value)
                        }
                        placeholder="Imóvel residencial, renda (Airbnb), auto, etc."
                    />
                </div>
                <div className="grid gap-1">
                    <Label>Região preferida</Label>
                    <Input
                        value={form.regiao_preferencia}
                        onChange={(e) =>
                            handleChange("regiao_preferencia", e.target.value)
                        }
                        placeholder="Ex.: RJ / Niterói"
                    />
                </div>
            </div>

            {/* Capacidade financeira */}
            <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1">
                    <Label>Renda mensal (R$)</Label>
                    <Input
                        inputMode="decimal"
                        value={form.renda_mensal}
                        onChange={(e) => handleChange("renda_mensal", e.target.value)}
                        placeholder="Ex.: 8000"
                    />
                </div>
                <div className="grid gap-1">
                    <Label>Reserva inicial (R$)</Label>
                    <Input
                        inputMode="decimal"
                        value={form.reserva_inicial}
                        onChange={(e) =>
                            handleChange("reserva_inicial", e.target.value)
                        }
                        placeholder="Ex.: 20000"
                    />
                </div>
                <div className="grid gap-1">
                    <Label>Comprometimento máximo (%)</Label>
                    <Input
                        inputMode="decimal"
                        value={form.comprometimento_max_pct}
                        onChange={(e) =>
                            handleChange("comprometimento_max_pct", e.target.value)
                        }
                        placeholder="Ex.: 30"
                    />
                </div>
            </div>

            <div className="grid gap-1">
                <Label>Renda provada?</Label>
                <div className="flex gap-3 text-sm">
                    <button
                        type="button"
                        className={`rounded-full border px-3 py-1 ${
                            form.renda_provada === "sim"
                                ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                                : "border-white/15 text-muted-foreground"
                        }`}
                        onClick={() => handleChange("renda_provada", "sim")}
                    >
                        Sim
                    </button>
                    <button
                        type="button"
                        className={`rounded-full border px-3 py-1 ${
                            form.renda_provada === "nao"
                                ? "border-red-400 bg-red-500/10 text-red-200"
                                : "border-white/15 text-muted-foreground"
                        }`}
                        onClick={() => handleChange("renda_provada", "nao")}
                    >
                        Não
                    </button>
                </div>
            </div>

            {/* Carta alvo / estratégia */}
            <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                    <Label>Valor da carta alvo (R$)</Label>
                    <Input
                        inputMode="decimal"
                        value={form.valor_carta_alvo}
                        onChange={(e) =>
                            handleChange("valor_carta_alvo", e.target.value)
                        }
                        placeholder="Ex.: 300000"
                    />
                </div>
                <div className="grid gap-1">
                    <Label>Prazo alvo (meses)</Label>
                    <Input
                        type="number"
                        value={form.prazo_alvo_meses}
                        onChange={(e) =>
                            handleChange("prazo_alvo_meses", e.target.value)
                        }
                        placeholder="Ex.: 180"
                    />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1">
                    <Label>Estratégia de lance</Label>
                    <Input
                        value={form.estrategia_lance}
                        onChange={(e) =>
                            handleChange("estrategia_lance", e.target.value)
                        }
                        placeholder="Ex.: agressivo_inicio"
                    />
                </div>
                <div className="grid gap-1">
                    <Label>Lance base (%)</Label>
                    <Input
                        inputMode="decimal"
                        value={form.lance_base_pct}
                        onChange={(e) =>
                            handleChange("lance_base_pct", e.target.value)
                        }
                        placeholder="Ex.: 20"
                    />
                </div>
                <div className="grid gap-1">
                    <Label>Lance máximo (%)</Label>
                    <Input
                        inputMode="decimal"
                        value={form.lance_max_pct}
                        onChange={(e) =>
                            handleChange("lance_max_pct", e.target.value)
                        }
                        placeholder="Ex.: 35"
                    />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                    <Label>Janela preferida (semanas)</Label>
                    <Input
                        type="number"
                        value={form.janela_preferida_semanas}
                        onChange={(e) =>
                            handleChange("janela_preferida_semanas", e.target.value)
                        }
                        placeholder="Ex.: 12"
                    />
                </div>
                <div className="grid gap-1">
                    <Label>Perfil psicológico</Label>
                    <Input
                        value={form.perfil_psicologico}
                        onChange={(e) =>
                            handleChange("perfil_psicologico", e.target.value)
                        }
                        placeholder="moderado, conservador, agressivo…"
                    />
                </div>
            </div>

            <div className="grid gap-1">
                <Label>Comentários / hipóteses</Label>
                <Textarea
                    value={form.comentarios}
                    onChange={(e) => handleChange("comentarios", e.target.value)}
                    placeholder="Cliente está animado, mas inseguro com prazos…"
                    className="min-h-[80px]"
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando…" : "Salvar diagnóstico"}
                </Button>
            </div>
        </form>
    );

    // --- se ainda não tem registro, mostra só o formulário ---
    if (!hasRecord) {
        return (
            <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                        Primeiro diagnóstico deste lead
                    </p>
                    <p className="text-sm font-medium">
                        Preencha os dados abaixo para o sistema calcular o Ready% e o risco.
                    </p>
                </div>
                {formNode}
            </div>
        );
    }

    // --- já existe diagnóstico: Tabs Resumo / Editar ---
    return (
        <div className="space-y-4">
            {/* Header com chips de score */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                    <p className="text-xs text-muted-foreground">
                        Diagnóstico consultivo
                    </p>
                    <p className="text-sm font-medium">
                        Visão geral do lead e ajustes finos de estratégia.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {ready != null && (
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">
              Ready <span className="font-semibold">{ready}%</span>
            </span>
                    )}
                    {risco != null && (
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-300">
              Risco {risco}%
            </span>
                    )}
                    {probConv != null && (
                        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-300">
              Prob. conversão {(probConv * 100).toFixed(0)}%
            </span>
                    )}
                </div>
            </div>

            <Tabs defaultValue="resumo">
                <TabsList className="mb-3">
                    <TabsTrigger value="resumo">Resumo</TabsTrigger>
                    <TabsTrigger value="editar">Editar</TabsTrigger>
                </TabsList>

                {/* RESUMO */}
                <TabsContent value="resumo" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Objetivo & contexto
                            </p>
                            <div className="mt-2 space-y-1 text-sm">
                                <div>
                                    <span className="text-muted-foreground text-xs">Objetivo: </span>
                                    {record?.objetivo || "—"}
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs">Prazo meta: </span>
                                    {record?.prazo_meta_meses
                                        ? `${record.prazo_meta_meses} meses`
                                        : "—"}
                                </div>
                                <div>
                  <span className="text-muted-foreground text-xs">
                    Produto / região:{" "}
                  </span>
                                    {(record?.preferencia_produto || "—") +
                                        " · " +
                                        (record?.regiao_preferencia || "—")}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Carta & capacidade financeira
                            </p>
                            <div className="mt-2 space-y-1 text-sm">
                                <div>
                                    <span className="text-muted-foreground text-xs">Carta alvo: </span>
                                    {formatMoneySimple(record?.valor_carta_alvo)}
                                    {record?.prazo_alvo_meses
                                        ? ` · ${record.prazo_alvo_meses}m`
                                        : ""}
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs">Renda: </span>
                                    {record?.renda_mensal
                                        ? formatMoneySimple(record.renda_mensal)
                                        : "—"}
                                    {record?.comprometimento_max_pct
                                        ? ` · ${record.comprometimento_max_pct}% máx.`
                                        : ""}
                                </div>
                                <div>
                  <span className="text-muted-foreground text-xs">
                    Reserva / FGTS:{" "}
                  </span>
                                    {record?.reserva_inicial
                                        ? formatMoneySimple(record.reserva_inicial)
                                        : "—"}
                                </div>
                                <div>
                  <span className="text-muted-foreground text-xs">
                    Estratégia de lance:{" "}
                  </span>
                                    {record?.estrategia_lance || "—"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                            <p className="text-[11px] uppercase tracking-wide text-emerald-300 mb-1">
                                Linha do tempo
                            </p>
                            <p>{insightLinhaDoTempo(record)}</p>
                        </div>
                        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-sm">
                            <p className="text-[11px] uppercase tracking-wide text-sky-300 mb-1">
                                Capacidade de parcela
                            </p>
                            <p>{insightCapacidade(record)}</p>
                        </div>
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
                            <p className="text-[11px] uppercase tracking-wide text-amber-300 mb-1">
                                Reserva & lances
                            </p>
                            <p>{insightReserva(record)}</p>
                        </div>
                    </div>

                    {/* Comentários / extras */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                            Comentários do consultor
                        </p>
                        <p className="text-sm whitespace-pre-wrap">
                            {(record?.extras as any)?.comentarios || "Sem comentários ainda."}
                        </p>
                    </div>
                </TabsContent>

                {/* EDITAR */}
                <TabsContent value="editar">{formNode}</TabsContent>
            </Tabs>
        </div>
    );
}
