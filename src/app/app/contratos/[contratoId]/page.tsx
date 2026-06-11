import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Banknote,
    Building2,
    CalendarDays,
    Clock3,
    CreditCard,
    Layers3,
    ShieldCheck,
} from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
    getCompetenciasContratoAction,
    getLancamentosContratoAction,
    getResumoFinanceiroContratoAction, getTimelineContratoAction
} from "@/app/app/comissoes/actions";
import { ComissoesContratoCard } from "./components/ComissoesContratoCard";
import { ContratoStatusEditor } from "./components/ContratoStatusEditor";
import { EditCotaSheet } from "./components/EditCotaSheet";
import { ContratoPdfUploadCard } from "@/features/contratos/components/contrato-pdf-upload-card";

// ------------------------------------------
// LOAD DO CONTRATO
// ------------------------------------------
async function loadContrato(contratoId: string, orgId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("contratos")
        .select("*, cotas(*)")
        .eq("org_id", orgId)
        .eq("id", contratoId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function loadLeadNome(leadId: string | null | undefined, orgId: string) {
    if (!leadId) return null;

    const supabase = await supabaseServer();
    const { data } = await supabase
        .from("leads")
        .select("nome")
        .eq("org_id", orgId)
        .eq("id", leadId)
        .maybeSingle();

    return data?.nome ?? null;
}

function InfoMiniCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex min-w-0 items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <span className="shrink-0">{icon}</span>
                <span className="truncate">{label}</span>
            </div>
            <div className="mt-2 min-w-0 break-words text-sm font-medium text-foreground">
                {value}
            </div>
        </div>
    );
}

function fmtDate(value: string | null | undefined) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("pt-BR");
}

function fmtCurrency(value: unknown) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ContratoDetailsPage({
    params,
}: {
    params: Promise<{ contratoId: string }>;
}) {
    const { contratoId } = await params;

    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    const contrato = await loadContrato(contratoId, profile.orgId);

    if (!contrato) notFound();

    const cota = contrato.cotas;
    const [lancamentos, competencias, resumoFinanceiro, timeline, leadNome] = await Promise.all([
        getLancamentosContratoAction(contratoId),
        getCompetenciasContratoAction(contratoId),
        getResumoFinanceiroContratoAction(contratoId),
        getTimelineContratoAction(contratoId),
        loadLeadNome(cota?.lead_id, profile.orgId),
    ]);

    const seguroAtivo = Boolean(cota?.seguro_prestamista_ativo);

    return (
        <div className="h-full overflow-auto px-4 py-6 md:px-6">
            <div className="mx-auto max-w-5xl space-y-5">
                {/* VOLTAR */}
                <div className="flex items-center gap-2">
                    <Link
                        href={cota?.lead_id ? `/app/leads/${cota.lead_id}` : "/app/carteira"}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar para o cliente
                    </Link>
                </div>

                {/* HEADER */}
                <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))] shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
                    <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg font-semibold text-foreground">
                                    Cota {cota?.grupo_codigo ?? "—"}-{cota?.numero_cota ?? "—"}
                                </h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Cliente: <span className="text-foreground">{leadNome ?? "—"}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Contrato Nº {contrato.numero ?? "—"} · ID da cota: {cota?.id ?? "—"}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-2">
                                <EditCotaSheet
                                    cota={{
                                        id: cota?.id ?? "",
                                        grupo_codigo: cota?.grupo_codigo ?? null,
                                        numero_cota: cota?.numero_cota ?? null,
                                        produto: cota?.produto ?? null,
                                        valor_carta: cota?.valor_carta ?? null,
                                        valor_parcela: cota?.valor_parcela ?? null,
                                        prazo: cota?.prazo ?? null,
                                        assembleia_dia: cota?.assembleia_dia ?? null,
                                        data_adesao: cota?.data_adesao ?? null,
                                        fgts_permitido: cota?.fgts_permitido ?? null,
                                        embutido_permitido: cota?.embutido_permitido ?? null,
                                        embutido_max_percent: cota?.embutido_max_percent ?? null,
                                        autorizacao_gestao: cota?.autorizacao_gestao ?? null,
                                        parcela_reduzida: cota?.parcela_reduzida ?? null,
                                        percentual_reducao: cota?.percentual_reducao ?? null,
                                        valor_parcela_sem_redutor: cota?.valor_parcela_sem_redutor ?? null,
                                        taxa_admin_percentual: cota?.taxa_admin_percentual ?? null,
                                        taxa_admin_valor_mensal: cota?.taxa_admin_valor_mensal ?? null,
                                        observacoes: cota?.observacoes ?? null,
                                        fundo_reserva_percentual: cota?.fundo_reserva_percentual ?? null,
                                        fundo_reserva_valor_mensal: cota?.fundo_reserva_valor_mensal ?? null,
                                        seguro_prestamista_ativo: cota?.seguro_prestamista_ativo ?? null,
                                        seguro_prestamista_percentual: cota?.seguro_prestamista_percentual ?? null,
                                        seguro_prestamista_valor_mensal: cota?.seguro_prestamista_valor_mensal ?? null,
                                        taxa_admin_antecipada_ativo: cota?.taxa_admin_antecipada_ativo ?? null,
                                        taxa_admin_antecipada_percentual: cota?.taxa_admin_antecipada_percentual ?? null,
                                        taxa_admin_antecipada_forma_pagamento:
                                            cota?.taxa_admin_antecipada_forma_pagamento ?? null,
                                        taxa_admin_antecipada_parcelas: cota?.taxa_admin_antecipada_parcelas ?? null,
                                        taxa_admin_antecipada_valor_total:
                                            cota?.taxa_admin_antecipada_valor_total ?? null,
                                        taxa_admin_antecipada_valor_parcela:
                                            cota?.taxa_admin_antecipada_valor_parcela ?? null,
                                    }}
                                    contrato={{
                                        id: contratoId,
                                        numero: contrato.numero ?? null,
                                        data_assinatura: contrato.data_assinatura ?? null,
                                    }}
                                />
                                <ContratoStatusEditor contratoId={contratoId} status={String(contrato.status ?? "")} />
                            </div>
                            <div className="text-right">
                                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Valor da carta
                                </div>
                                <div className="text-xl font-semibold text-foreground">
                                    {fmtCurrency(cota?.valor_carta)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DADOS DA COTA */}
                <div className="rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.025] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Informações da cota</h2>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <InfoMiniCard
                            icon={<CreditCard className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Produto"
                            value={cota?.produto ?? "—"}
                        />
                        <InfoMiniCard
                            icon={<Layers3 className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Grupo / Cota"
                            value={`${cota?.grupo_codigo ?? "—"} / ${cota?.numero_cota ?? "—"}`}
                        />
                        <InfoMiniCard
                            icon={<Clock3 className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Prazo"
                            value={cota?.prazo ? `${cota.prazo} meses` : "—"}
                        />
                        <InfoMiniCard
                            icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Situação da cota"
                            value={cota?.situacao ?? "—"}
                        />
                        <InfoMiniCard
                            icon={<Banknote className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Parcela"
                            value={fmtCurrency(cota?.valor_parcela)}
                        />
                        <InfoMiniCard
                            icon={<CalendarDays className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Data de adesão"
                            value={fmtDate(cota?.data_adesao)}
                        />
                        <InfoMiniCard
                            icon={<CalendarDays className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Assinatura do contrato"
                            value={fmtDate(contrato.data_assinatura)}
                        />
                        <InfoMiniCard
                            icon={<Building2 className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Assembleia"
                            value={cota?.assembleia_dia ? `Dia ${cota.assembleia_dia}` : "—"}
                        />
                    </div>
                </div>

                {/* SEGURO PRESTAMISTA */}
                <div className="rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.025] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-foreground">Seguro prestamista</h2>
                        <Badge
                            variant="outline"
                            className={
                                seguroAtivo
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                    : "border-white/10 bg-white/5 text-muted-foreground"
                            }
                        >
                            {seguroAtivo ? "Ativo" : "Não contratado"}
                        </Badge>
                    </div>

                    {seguroAtivo ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <InfoMiniCard
                                icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />}
                                label="Percentual"
                                value={
                                    cota?.seguro_prestamista_percentual != null
                                        ? `${Number(cota.seguro_prestamista_percentual).toLocaleString("pt-BR")}%`
                                        : "—"
                                }
                            />
                            <InfoMiniCard
                                icon={<Banknote className="h-3.5 w-3.5 text-emerald-300" />}
                                label="Valor mensal"
                                value={fmtCurrency(cota?.seguro_prestamista_valor_mensal)}
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Esta cota não possui seguro prestamista contratado.
                        </p>
                    )}
                </div>

                {/* CONTRATO PDF */}
                <ContratoPdfUploadCard contractId={contratoId} />

                <ComissoesContratoCard
                    contratoId={contratoId}
                    resumoFinanceiro={resumoFinanceiro.totais}
                    lancamentos={lancamentos.items}
                    competencias={competencias.items}
                    timeline={timeline.items}
                />
            </div>
        </div>
    );
}
