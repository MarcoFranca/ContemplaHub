"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    Banknote,
    Building2,
    CalendarDays,
    Clock3,
    CreditCard,
    FileText,
    Layers3,
    UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateContratoSheet } from "@/features/contratos/components/create-contrato-sheet";
import type { ContratoFormValues } from "@/features/contratos/types/contrato-form.types";
import { fmtCurrency, fmtDate } from "@/app/app/carteira/lib/format";

type CotaRow = {
    id: string;
    lead_id: string | null;
    administradora_id: string | null;
    numero_cota: string | null;
    grupo_codigo: string | null;
    produto: string | null;
    valor_carta: number | null;
    valor_parcela: number | null;
    prazo: number | null;
    assembleia_dia: number | null;
    situacao: string | null;
    fgts_permitido: boolean | null;
    embutido_permitido: boolean | null;
    embutido_max_percent: number | null;
    parcela_reduzida: boolean | null;
    percentual_reducao: number | null;
    valor_parcela_sem_redutor: number | null;
    autorizacao_gestao: boolean | null;
    data_adesao: string | null;
    seguro_prestamista_ativo: boolean | null;
    seguro_prestamista_percentual: number | null;
    seguro_prestamista_valor_mensal: number | null;
    taxa_admin_percentual: number | null;
    taxa_admin_valor_mensal: number | null;
    fundo_reserva_percentual: number | null;
    fundo_reserva_valor_mensal: number | null;
};

type LeadRow = {
    id: string;
    nome: string | null;
    telefone: string | null;
    email: string | null;
} | null;

type Option = { id: string; nome: string };

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

export function CompletarCadastroCarta({
    cota,
    lead,
    administradoras,
    parceiros,
}: {
    cota: CotaRow;
    lead: LeadRow;
    administradoras: Option[];
    parceiros: Option[];
}) {
    const router = useRouter();

    const produto: "imobiliario" | "auto" =
        cota.produto === "auto" ? "auto" : "imobiliario";

    const prefill: Partial<ContratoFormValues> = {
        existingCotaId: cota.id,
        administradoraId: cota.administradora_id ?? "",
        grupoCodigo: cota.grupo_codigo ?? "",
        numeroCota: cota.numero_cota ?? "",
        produto,
        valorCarta: cota.valor_carta ?? 0,
        prazo: cota.prazo ?? 0,
        valorParcela: cota.valor_parcela ?? null,
        assembleiaDia: cota.assembleia_dia ?? null,
        dataAdesao: cota.data_adesao ?? null,
        fgtsPermitido: cota.fgts_permitido ?? false,
        embutidoPermitido: cota.embutido_permitido ?? false,
        embutidoMaxPercent: cota.embutido_max_percent ?? null,
        parcelaReduzida: cota.parcela_reduzida ?? false,
        percentualReducao: cota.percentual_reducao ?? null,
        valorParcelaSemRedutor: cota.valor_parcela_sem_redutor ?? null,
        autorizacaoGestao: cota.autorizacao_gestao ?? false,
        seguroPrestamistaAtivo: cota.seguro_prestamista_ativo ?? false,
        seguroPrestamistaPercentual: cota.seguro_prestamista_percentual ?? null,
        seguroPrestamistaValorMensal: cota.seguro_prestamista_valor_mensal ?? null,
        taxaAdminPercentual: cota.taxa_admin_percentual ?? null,
        taxaAdminValorMensal: cota.taxa_admin_valor_mensal ?? null,
        fundoReservaPercentual: cota.fundo_reserva_percentual ?? null,
        fundoReservaValorMensal: cota.fundo_reserva_valor_mensal ?? null,
    };

    return (
        <div className="h-full overflow-auto px-4 py-6 md:px-6">
            <div className="mx-auto max-w-3xl space-y-5">
                <div className="flex items-center gap-2">
                    <Link
                        href={lead?.id ? `/app/leads/${lead.id}` : "/app/carteira"}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar para o cliente
                    </Link>
                </div>

                <div className="overflow-hidden rounded-[26px] border border-amber-500/20 bg-amber-500/[0.06] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                            <AlertTriangle className="h-4 w-4 text-amber-300" />
                        </span>
                        <div className="space-y-1">
                            <h1 className="text-base font-semibold text-foreground">
                                Esta cota ainda não tem um contrato cadastrado
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Complete o cadastro para liberar a visão completa da carta, a
                                geração de comissões e o upload do contrato em PDF.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.025] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                        Dados já cadastrados da cota
                    </h2>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <InfoMiniCard
                            icon={<UserRound className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Cliente"
                            value={lead?.nome ?? "—"}
                        />
                        <InfoMiniCard
                            icon={<CreditCard className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Produto"
                            value={cota.produto ?? "—"}
                        />
                        <InfoMiniCard
                            icon={<Layers3 className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Grupo / Cota"
                            value={`${cota.grupo_codigo ?? "—"} / ${cota.numero_cota ?? "—"}`}
                        />
                        <InfoMiniCard
                            icon={<Banknote className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Valor da carta"
                            value={fmtCurrency(cota.valor_carta)}
                        />
                        <InfoMiniCard
                            icon={<Clock3 className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Prazo"
                            value={cota.prazo ? `${cota.prazo} meses` : "—"}
                        />
                        <InfoMiniCard
                            icon={<CalendarDays className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Data de adesão"
                            value={fmtDate(cota.data_adesao)}
                        />
                        <InfoMiniCard
                            icon={<Building2 className="h-3.5 w-3.5 text-emerald-300" />}
                            label="Administradora"
                            value={
                                administradoras.find((a) => a.id === cota.administradora_id)
                                    ?.nome ?? "—"
                            }
                        />
                    </div>
                </div>

                <CreateContratoSheet
                    mode="registerExisting"
                    leadId={cota.lead_id ?? ""}
                    administradoras={administradoras}
                    parceiros={parceiros}
                    leadName={lead?.nome}
                    prefill={prefill}
                    trigger={
                        <Button size="lg" className="rounded-xl">
                            <FileText className="mr-2 h-4 w-4" />
                            Completar cadastro do contrato
                        </Button>
                    }
                    onSuccess={({ contractId }) => {
                        if (contractId) {
                            router.push(`/app/contratos/${contractId}`);
                        } else {
                            router.refresh();
                        }
                    }}
                />
            </div>
        </div>
    );
}
