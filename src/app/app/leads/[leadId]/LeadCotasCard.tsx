"use client";

import * as React from "react";
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
    BadgeDollarSign,
    Building2,
    Clock3,
    CreditCard,
    Plus,
    Receipt,
    ShieldCheck,
    Sparkles,
    WalletCards,
} from "lucide-react";

import { updateContractStatus } from "@/app/app/leads/actions";
import type { ContractStatus } from "@/app/app/leads/types";
import { CreateContratoSheet } from "@/features/contratos/components/create-contrato-sheet";

type AdminOption = {
    id: string;
    nome: string;
};

type CotaRow = {
    id: string;
    administradora_id: string | null;
    valor_carta: number | string | null;
    produto: string | null;
    data_adesao: string | null;
    numero_cota: string | null;
    grupo_codigo: string | null;
    prazo: number | null;
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
            <div className="mt-2 min-w-0 text-sm font-medium text-foreground break-words whitespace-normal">
                {value}
            </div>
        </div>
    );
}

export function LeadCotasCard({
                                  leadId,
                                  leadName,
                                  cotas,
                                  contratos,
                                  administradoras,
                              }: {
    leadId: string;
    leadName: string;
    cotas: CotaRow[];
    contratos: ContratoRow[];
    administradoras: AdminOption[];
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
        for (const adm of administradoras) {
            map.set(adm.id, adm.nome);
        }
        return map;
    }, [administradoras]);

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
        <>
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
                            Acompanhe as cotas vinculadas a este cliente e cadastre novas cartas sem depender do funil.
                        </p>
                    </div>

                    <CreateContratoSheet
                        mode="fromLead"
                        leadId={leadId}
                        leadName={leadName}
                        administradoras={administradoras}
                        trigger={
                            <Button
                                size="sm"
                                className="gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-500"
                            >
                                <Plus className="h-4 w-4" />
                                Nova carta
                            </Button>
                        }
                        onSuccess={() => {
                            router.refresh();
                        }}
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
                                        <p className="text-sm font-medium text-foreground">
                                            Nenhuma cota cadastrada ainda
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Cadastre a primeira carta deste cliente para iniciar o acompanhamento contratual e operacional.
                                        </p>
                                    </div>

                                    <CreateContratoSheet
                                        mode="fromLead"
                                        leadId={leadId}
                                        leadName={leadName}
                                        administradoras={administradoras}
                                        trigger={
                                            <Button
                                                size="sm"
                                                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Cadastrar primeira carta
                                            </Button>
                                        }
                                        onSuccess={() => {
                                            router.refresh();
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        cotas.map((cota) => {
                            const contrato = cota.id ? contratoByCota.get(cota.id) : undefined;
                            const currentStatus =
                                (contrato?.status as ContractStatus | null) ?? "pendente_assinatura";

                            const valorCarta =
                                typeof cota.valor_carta === "number"
                                    ? cota.valor_carta
                                    : cota.valor_carta
                                        ? Number(String(cota.valor_carta).replace(",", "."))
                                        : null;

                            const administradoraNome = cota.administradora_id
                                ? administradoraNomeById.get(cota.administradora_id) ?? "—"
                                : "—";

                            return (
                                <div
                                    key={cota.id}
                                    className="rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-emerald-400/20 hover:bg-white/5"
                                >
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="text-sm font-semibold text-foreground">
                                                        Cota {cota.numero_cota ?? "—"}
                                                    </div>

                                                    <Badge variant="outline">
                                                        Grupo {cota.grupo_codigo ?? "—"}
                                                    </Badge>

                                                    {contrato && (
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[10px] px-2 py-0.5 border ${statusClass[currentStatus]}`}
                                                        >
                                                            {statusLabel[currentStatus]}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Lead: <span className="text-foreground">{leadName}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:[&>*]:min-w-0">
                                            <InfoMiniCard
                                                icon={<Building2 className="h-3.5 w-3.5 text-emerald-300" />}
                                                label="Administradora"
                                                value={
                                                    <span className="block truncate" title={administradoraNome}>
      {administradoraNome}
    </span>
                                                }
                                            />

                                            <InfoMiniCard
                                                icon={<CreditCard className="h-3.5 w-3.5 text-emerald-300" />}
                                                label="Produto"
                                                value={cota.produto ?? "—"}
                                            />

                                            <InfoMiniCard
                                                icon={<BadgeDollarSign className="h-3.5 w-3.5 text-emerald-300" />}
                                                label="Valor da carta"
                                                value={
                                                    valorCarta != null
                                                        ? valorCarta.toLocaleString("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        })
                                                        : "—"
                                                }
                                            />

                                            <InfoMiniCard
                                                icon={<Clock3 className="h-3.5 w-3.5 text-emerald-300" />}
                                                label="Prazo"
                                                value={cota.prazo ? `${cota.prazo} meses` : "—"}
                                            />
                                        </div>

                                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                                            <InfoMiniCard
                                                icon={<Receipt className="h-3.5 w-3.5 text-emerald-300" />}
                                                label="Forma de pagamento"
                                                value={cota.forma_pagamento ?? "—"}
                                            />

                                            {contrato ? (
                                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                                                        Contrato
                                                    </div>

                                                    <div className="mt-2 space-y-1 text-sm text-foreground">
                                                        <p>
                                                            Nº: <span className="font-medium">{contrato.numero ?? "—"}</span>
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            Assinatura:{" "}
                                                            <span className="text-foreground">
                                {contrato.data_assinatura
                                    ? new Date(contrato.data_assinatura).toLocaleDateString("pt-BR")
                                    : "—"}
                              </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-3 text-sm text-muted-foreground">
                                                    Nenhum contrato vinculado a esta cota ainda.
                                                </div>
                                            )}
                                        </div>

                                        {contrato ? (
                                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px]">Status do contrato</Label>
                                                    <Select
                                                        defaultValue={currentStatus}
                                                        onValueChange={(v) =>
                                                            handleChangeStatus(contrato.id, currentStatus, v as ContractStatus)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-9 border-white/10 bg-background text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pendente_assinatura">
                                                                Pendente assinatura
                                                            </SelectItem>
                                                            <SelectItem value="pendente_pagamento">
                                                                Pendente pagamento
                                                            </SelectItem>
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

                                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                                                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-emerald-300">
                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                        Leitura operacional
                                                    </div>
                                                    <p className="mt-2 text-xs leading-relaxed text-emerald-50/85">
                                                        Mantenha a distinção entre cota, administradora e contrato para evitar confusão na operação comercial e no pós-venda.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </>
    );
}
