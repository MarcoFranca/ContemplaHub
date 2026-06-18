"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    ArrowUpRight,
    BadgeDollarSign,
    Building2,
    CalendarDays,
    Car,
    Clock3,
    Home,
    PencilLine,
    Plus,
    Receipt,
    ShieldCheck,
    Sparkles,
    Target,
    WalletCards,
} from "lucide-react";

import { updateContractStatus } from "@/app/app/leads/actions";
import type { ContractStatus } from "@/app/app/leads/types";
import { CreateContratoSheet } from "@/features/contratos/components/create-contrato-sheet";
import { EditCartaSheet } from "@/app/app/lances/components/EditCartaSheet";

type AdminOption = { id: string; nome: string };

type OpcaoFixo = {
    id: string;
    cota_id: string;
    percentual: number | string;
    ordem: number;
    ativo: boolean;
    observacoes?: string | null;
    created_at?: string | null;
};

type CotaRow = {
    id: string;
    administradora_id: string | null;
    valor_carta: number | string | null;
    produto: string | null;
    data_adesao: string | null;
    numero_cota: string | null;
    grupo_codigo: string | null;
    status?: string | null;
    prazo: number | null;
    assembleia_dia?: number | null;
    autorizacao_gestao?: boolean | null;
    tipo_lance_preferencial?: string | null;
    estrategia?: string | null;
    objetivo?: string | null;
    valor_parcela?: number | string | null;
    embutido_permitido?: boolean | null;
    embutido_max_percent?: number | string | null;
    fgts_permitido?: boolean | null;
    forma_pagamento: string | null;
};

type ContratoRow = {
    id: string;
    org_id: string;
    cota_id: string | null;
    numero: string | null;
    data_assinatura: string | null;
    status: ContractStatus | string | null;
};

const statusLabel: Record<ContractStatus, string> = {
    pendente_assinatura: "Pendente assinatura",
    pendente_pagamento: "Pendente pagamento",
    alocado: "Alocado",
    contemplado: "Contemplado",
    cancelado: "Cancelado",
};

const statusClass: Record<ContractStatus, string> = {
    pendente_assinatura: "bg-amber-900/40 text-amber-200 border-amber-700",
    pendente_pagamento: "bg-yellow-900/40 text-yellow-200 border-yellow-700",
    alocado: "bg-emerald-900/40 text-emerald-200 border-emerald-700",
    contemplado: "bg-indigo-900/40 text-indigo-200 border-indigo-700",
    cancelado: "bg-red-900/40 text-red-200 border-red-700",
};

function fmtBRL(v: number | string | null | undefined) {
    if (v === null || v === undefined || v === "") return "—";
    const n = typeof v === "number" ? v : Number(String(v).replace(/\./g, "").replace(",", "."));
    const num = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    const value = Number.isFinite(num) ? num : n;
    if (!Number.isFinite(value)) return "—";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(v: string | null | undefined) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(d);
}

const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
    cartao: "Cartão",
    boleto: "Boleto",
    debito_conta: "Débito em conta",
};

function fmtFormaPagamento(v: string | null | undefined) {
    if (!v) return "—";
    return FORMA_PAGAMENTO_LABEL[v] ?? v;
}

const TIPO_LANCE_LABEL: Record<string, string> = {
    livre: "Lance livre",
    fixo: "Lance fixo",
    embutido: "Lance embutido",
    sorteio: "Sorteio",
};

function fmtTipoLance(v: string | null | undefined) {
    if (!v) return "—";
    return TIPO_LANCE_LABEL[v.toLowerCase()] ?? v;
}

function ProdutoIcon({ produto, className }: { produto: string | null | undefined; className?: string }) {
    const p = (produto ?? "").toLowerCase();
    if (p.includes("auto") || p.includes("veic")) return <Car className={className} />;
    return <Home className={className} />;
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
            <div className="mt-1.5 min-w-0 break-words text-sm font-medium text-foreground">
                {value}
            </div>
        </div>
    );
}

function CotaItem({
    cota,
    contrato,
    administradoraNome,
    leadName,
    competencia,
    opcoes,
    onChangeStatus,
    onRefresh,
}: {
    cota: CotaRow;
    contrato?: ContratoRow;
    administradoraNome: string;
    leadName: string;
    competencia: string;
    opcoes: OpcaoFixo[];
    onChangeStatus: (contratoId: string, current: ContractStatus, next: ContractStatus) => void;
    onRefresh: () => void;
}) {
    const [editOpen, setEditOpen] = React.useState(false);
    const currentStatus = (contrato?.status as ContractStatus | null) ?? "pendente_assinatura";
    const detalheHref = contrato ? `/app/contratos/${contrato.id}` : `/app/cartas/${cota.id}`;

    return (
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-emerald-400/25 hover:bg-white/5">
            {/* Header: identidade + ações */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
                            <ProdutoIcon produto={cota.produto} className="h-4 w-4 text-emerald-300" />
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                            Cota {cota.numero_cota ?? "—"}
                        </span>
                        <Badge variant="outline">Grupo {cota.grupo_codigo ?? "—"}</Badge>
                        {contrato && (
                            <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0.5 border ${statusClass[currentStatus]}`}
                            >
                                {statusLabel[currentStatus]}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {cota.produto ?? "—"} · Lead: <span className="text-foreground">{leadName}</span>
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditOpen(true)}
                        className="gap-1.5"
                    >
                        <PencilLine className="h-3.5 w-3.5 text-emerald-300" />
                        Editar carta
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                        <Link href={detalheHref}>
                            Ver detalhes
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-300" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Fatos principais (com máscaras) */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <InfoMiniCard
                    icon={<Building2 className="h-3.5 w-3.5 text-emerald-300" />}
                    label="Administradora"
                    value={<span className="block truncate" title={administradoraNome}>{administradoraNome}</span>}
                />
                <InfoMiniCard
                    icon={<BadgeDollarSign className="h-3.5 w-3.5 text-emerald-300" />}
                    label="Valor da carta"
                    value={fmtBRL(cota.valor_carta)}
                />
                <InfoMiniCard
                    icon={<Receipt className="h-3.5 w-3.5 text-emerald-300" />}
                    label="Parcela"
                    value={fmtBRL(cota.valor_parcela)}
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
                    icon={<WalletCards className="h-3.5 w-3.5 text-emerald-300" />}
                    label="Forma de pagamento"
                    value={fmtFormaPagamento(cota.forma_pagamento)}
                />
                <InfoMiniCard
                    icon={<Target className="h-3.5 w-3.5 text-emerald-300" />}
                    label="Tipo de lance"
                    value={fmtTipoLance(cota.tipo_lance_preferencial)}
                />
            </div>

            {/* Contrato + status */}
            {contrato ? (
                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                            Contrato
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-foreground">
                            <p>Nº: <span className="font-medium">{contrato.numero ?? "—"}</span></p>
                            <p className="text-muted-foreground">
                                Assinatura:{" "}
                                <span className="text-foreground">{fmtDate(contrato.data_assinatura)}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px]">Status do contrato</Label>
                        <Select
                            defaultValue={currentStatus}
                            onValueChange={(v) => onChangeStatus(contrato.id, currentStatus, v as ContractStatus)}
                        >
                            <SelectTrigger className="h-9 border-white/10 bg-background text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pendente_assinatura">Pendente assinatura</SelectItem>
                                <SelectItem value="pendente_pagamento">Pendente pagamento</SelectItem>
                                <SelectItem value="alocado">Alocado</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">
                            • Alocado ⇒ cliente vai para <span className="font-semibold text-foreground">Ativo</span>
                            <br />
                            • Cancelado ⇒ cliente vai para <span className="font-semibold text-foreground">Perdido</span>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="mt-3 rounded-xl border border-dashed border-white/15 bg-white/5 p-3 text-sm text-muted-foreground">
                    Nenhum contrato vinculado a esta cota ainda.
                </div>
            )}

            {/* Edição centralizada (mesmo sheet dos lances) */}
            <EditCartaSheet
                open={editOpen}
                onOpenChange={setEditOpen}
                cotaId={cota.id}
                competencia={competencia}
                initialData={{
                    grupo_codigo: cota.grupo_codigo ?? "",
                    numero_cota: cota.numero_cota ?? "",
                    produto: cota.produto ?? "imobiliario",
                    valor_carta: cota.valor_carta ?? null,
                    valor_parcela: cota.valor_parcela ?? null,
                    prazo: cota.prazo ?? null,
                    status: cota.status ?? "ativa",
                    autorizacao_gestao: Boolean(cota.autorizacao_gestao),
                    embutido_permitido: Boolean(cota.embutido_permitido),
                    embutido_max_percent: cota.embutido_max_percent ?? null,
                    fgts_permitido: Boolean(cota.fgts_permitido),
                    forma_pagamento: cota.forma_pagamento ?? null,
                    tipo_lance_preferencial: cota.tipo_lance_preferencial ?? null,
                    estrategia: cota.estrategia ?? null,
                    objetivo: cota.objetivo ?? null,
                    assembleia_dia: cota.assembleia_dia ?? null,
                    data_adesao: cota.data_adesao ?? null,
                }}
                opcoesLanceFixo={opcoes}
                onSuccess={onRefresh}
            />
        </div>
    );
}

export function LeadCotasCard({
    leadId,
    leadName,
    cotas,
    contratos,
    administradoras,
    opcoesByCota = {},
    competencia,
}: {
    leadId: string;
    leadName: string;
    cotas: CotaRow[];
    contratos: ContratoRow[];
    administradoras: AdminOption[];
    opcoesByCota?: Record<string, OpcaoFixo[]>;
    competencia: string;
}) {
    const router = useRouter();

    const contratoByCota = React.useMemo(() => {
        const map = new Map<string, ContratoRow>();
        for (const contrato of contratos ?? []) {
            if (contrato.cota_id) map.set(contrato.cota_id, contrato);
        }
        return map;
    }, [contratos]);

    const administradoraNomeById = React.useMemo(() => {
        const map = new Map<string, string>();
        for (const adm of administradoras) map.set(adm.id, adm.nome);
        return map;
    }, [administradoras]);

    async function handleChangeStatus(
        contratoId: string,
        currentStatus: ContractStatus,
        newStatus: ContractStatus
    ) {
        if (currentStatus === newStatus) return;
        try {
            await updateContractStatus(contratoId, newStatus);
            toast.success("Status do contrato atualizado.");
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar status do contrato.");
        }
    }

    return (
        <Card className="border-white/10 bg-white/5">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
                            <WalletCards className="h-4 w-4 text-emerald-300" />
                        </span>
                        Cotas & contratos
                    </CardTitle>
                    <p className="mt-1 max-w-md text-xs text-muted-foreground">
                        Acompanhe as cartas deste cliente, edite e abra os detalhes — sem depender do funil.
                    </p>
                </div>

                <CreateContratoSheet
                    mode="fromLead"
                    leadId={leadId}
                    leadName={leadName}
                    administradoras={administradoras}
                    trigger={
                        <Button size="sm" className="gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-500">
                            <Plus className="h-4 w-4" />
                            Nova carta
                        </Button>
                    }
                    onSuccess={() => router.refresh()}
                />
            </CardHeader>

            <CardContent className="space-y-3">
                {!cotas || cotas.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5">
                        <div className="flex items-start gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                                <Sparkles className="h-5 w-5 text-emerald-300" />
                            </span>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Nenhuma cota cadastrada ainda</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Cadastre a primeira carta deste cliente para iniciar o acompanhamento.
                                    </p>
                                </div>
                                <CreateContratoSheet
                                    mode="fromLead"
                                    leadId={leadId}
                                    leadName={leadName}
                                    administradoras={administradoras}
                                    trigger={
                                        <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500">
                                            <Plus className="h-4 w-4" />
                                            Cadastrar primeira carta
                                        </Button>
                                    }
                                    onSuccess={() => router.refresh()}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    cotas.map((cota) => (
                        <CotaItem
                            key={cota.id}
                            cota={cota}
                            contrato={cota.id ? contratoByCota.get(cota.id) : undefined}
                            administradoraNome={
                                cota.administradora_id
                                    ? administradoraNomeById.get(cota.administradora_id) ?? "—"
                                    : "—"
                            }
                            leadName={leadName}
                            competencia={competencia}
                            opcoes={opcoesByCota[cota.id] ?? []}
                            onChangeStatus={handleChangeStatus}
                            onRefresh={() => router.refresh()}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}
