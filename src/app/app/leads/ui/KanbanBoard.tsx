"use client";

import { useOptimistic, useTransition, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createContractFromLead, type AdminOption, type GrupoOption } from "../actions";

type Stage =
    | "novo"
    | "diagnostico"
    | "proposta"
    | "negociacao"
    | "fechamento"
    | "ativo"
    | "perdido";

export type Lead = {
    id: string;
    nome: string | null;
    etapa: Stage;
    telefone?: string | null;
    email?: string | null;
    origem?: string | null;
    utm_source?: string | null;
    valor_interesse?: string | null; // legado (se existir)
    prazo_meses?: number | null;     // legado (se existir)
    created_at?: string;

    interest?: {
        produto?: string | null;
        valorTotal?: string | null;
        prazoMeses?: number | null;
        objetivo?: string | null;
        perfilDesejado?: string | null;
        observacao?: string | null;
    } | null;
};

type OptimisticAction = { id: string; from: Stage; to: Stage };

export default function KanbanBoard({
                                        initialColumns,
                                        stages,
                                        onMove,
                                        contractOptions,
                                    }: {
    initialColumns: Record<Stage, Lead[]>;
    stages: Stage[];
    onMove: (leadId: string, to: Stage) => Promise<void>;
    contractOptions: { administradoras: AdminOption[]; grupos: GrupoOption[] };
}) {
    const [isPending, start] = useTransition();

    const [columns, setColumns] = useOptimistic<Record<Stage, Lead[]>, OptimisticAction>(
        initialColumns,
        (state, action) => {
            if (action.from === action.to) return state;
            const fromList = [...state[action.from]];
            const toList = [...state[action.to]];
            const idx = fromList.findIndex((l) => l.id === action.id);
            if (idx >= 0) {
                const [lead] = fromList.splice(idx, 1);
                const moved: Lead = { ...lead, etapa: action.to };
                toList.unshift(moved);
                return { ...state, [action.from]: fromList, [action.to]: toList };
            }
            return state;
        }
    );

    function onDragStart(ev: React.DragEvent, lead: Lead) {
        ev.dataTransfer.setData("text/plain", JSON.stringify(lead));
    }

    function onDrop(ev: React.DragEvent, to: Stage) {
        ev.preventDefault();
        const raw = ev.dataTransfer.getData("text/plain");
        if (!raw) return;
        try {
            const lead = JSON.parse(raw) as Lead;
            const from = lead.etapa;
            start(async () => {
                setColumns({ id: lead.id, from, to });
                await onMove(lead.id, to);
            });
        } catch {
            // ignore parse errors
        }
    }

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-7">
            {stages.map((s) => (
                <Card key={s} className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm capitalize">{s}</CardTitle>
                    </CardHeader>

                    <CardContent
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onDrop(e, s)}
                        className="min-h-[60vh] space-y-2"
                    >
                        {columns[s].map((l) => (
                            <div
                                key={l.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, l)}
                                className="rounded-lg border border-white/10 bg-white/10 p-3 cursor-grab active:cursor-grabbing"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium leading-tight">{l.nome ?? "—"}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {l.telefone ?? l.email ?? "—"} • {l.origem ?? l.utm_source ?? "site"}
                                        </p>
                                    </div>

                                    {/* Interesse: abrir resumo */}
                                    {l.interest ? (
                                        <InterestDetailsDialog interest={l.interest} />
                                    ) : null}
                                </div>

                                {/* Linha de interesse resumida (fallback usa campos legados se não existir interest aberto) */}
                                <InterestSummaryRow lead={l} />

                                {l.etapa === "fechamento" && (
                                    <div className="mt-3">
                                        <CreateContractDialog
                                            leadId={l.id}
                                            leadName={l.nome ?? "Cliente"}
                                            administradoras={contractOptions.administradoras}
                                            grupos={contractOptions.grupos}
                                            onSuccess={() => {
                                                toast.success("Contrato criado. Cliente movido para Carteira.");
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        {columns[s].length === 0 && (
                            <p className="text-xs text-muted-foreground">Arraste cards para cá.</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/** Badge simples */
function Pill({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <span
            title={title}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2 py-0.5 text-[11px] leading-none"
        >
      {children}
    </span>
    );
}

/** Linha compacta com os principais dados do interesse */
function InterestSummaryRow({ lead }: { lead: Lead }) {
    const i = lead.interest;
    const produto = i?.produto;
    const prazo = (i?.prazoMeses ?? lead.prazo_meses) || null;
    const valor = i?.valorTotal ?? lead.valor_interesse ?? null;
    const objetivo = i?.objetivo ?? null;
    const perfil = i?.perfilDesejado ?? null;

    if (!produto && !prazo && !valor && !objetivo && !perfil) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-1">
            {produto && <Pill>{produto}</Pill>}
            {prazo && <Pill title="Prazo (meses)">{prazo}m</Pill>}
            {valor && (
                <Pill title="Valor total">
                    {(() => {
                        const n = Number(String(valor).replace(/\./g, "").replace(",", "."));
                        return isFinite(n) ? `R$ ${n.toLocaleString("pt-BR")}` : String(valor);
                    })()}
                </Pill>
            )}
            {objetivo && <Pill title="Objetivo">{objetivo}</Pill>}
            {perfil && <Pill title="Perfil">{perfil}</Pill>}
        </div>
    );
}

/** Dialog para ver os detalhes do interesse “aberto” */
function InterestDetailsDialog({
                                   interest,
                               }: {
    interest: NonNullable<Lead["interest"]>;
}) {
    const { produto, valorTotal, prazoMeses, objetivo, perfilDesejado, observacao } = interest;
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                    Ver interesse
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Interesse do lead</DialogTitle>
                </DialogHeader>

                <div className="grid gap-3 text-sm">
                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Produto</span>
                        <span className="font-medium">{produto ?? "—"}</span>
                    </div>

                    <div className="grid gap-1 md:grid-cols-2">
                        <div className="grid gap-1">
                            <span className="text-muted-foreground">Valor total</span>
                            <span className="font-medium">
                {valorTotal
                    ? (() => {
                        const n = Number(String(valorTotal).replace(/\./g, "").replace(",", "."));
                        return isFinite(n) ? `R$ ${n.toLocaleString("pt-BR")}` : String(valorTotal);
                    })()
                    : "—"}
              </span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-muted-foreground">Prazo (meses)</span>
                            <span className="font-medium">{prazoMeses ?? "—"}</span>
                        </div>
                    </div>

                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Objetivo</span>
                        <span className="font-medium">{objetivo ?? "—"}</span>
                    </div>

                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Perfil</span>
                        <span className="font-medium">{perfilDesejado ?? "—"}</span>
                    </div>

                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Observação</span>
                        <span className="font-medium whitespace-pre-wrap">{observacao ?? "—"}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline">
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============== Modal CreateContractDialog ===================
function CreateContractDialog({
                                  leadId,
                                  leadName,
                                  administradoras,
                                  grupos,
                                  onSuccess,
                              }: {
    leadId: string;
    leadName: string;
    administradoras: AdminOption[];
    grupos: GrupoOption[];
    onSuccess?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [admId, setAdmId] = useState<string>("");

    const gruposFiltrados = useMemo(
        () => grupos.filter((g) => g.administradoraId === admId),
        [grupos, admId]
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Gerar contrato</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo contrato — {leadName}</DialogTitle>
                </DialogHeader>

                <form
                    action={createContractFromLead} // Server Action (Promise<void>)
                    onSubmit={(e) => {
                        const form = e.currentTarget as HTMLFormElement;
                        const fd = new FormData(form);
                        if (!fd.get("administradoraId") || !fd.get("grupoId") || !fd.get("valorCarta")) {
                            e.preventDefault();
                            return;
                        }
                        setOpen(false);
                        toast.loading("Criando contrato…");
                        onSuccess?.();
                    }}
                    className="space-y-3"
                >
                    <input type="hidden" name="leadId" value={leadId} />

                    <div className="grid gap-2">
                        <Label>Administradora</Label>
                        <select
                            name="administradoraId"
                            value={admId}
                            onChange={(e) => setAdmId(e.target.value)}
                            className="h-9 rounded-md bg-background border px-2 text-sm"
                            required
                        >
                            <option value="">Selecione…</option>
                            {administradoras.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Grupo</Label>
                        <select name="grupoId" className="h-9 rounded-md bg-background border px-2 text-sm" required>
                            <option value="">Selecione…</option>
                            {gruposFiltrados.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.codigo ?? g.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Produto</Label>
                        <select name="produto" defaultValue="imobiliario" className="h-9 rounded-md bg-background border px-2 text-sm">
                            <option value="imobiliario">Imobiliário</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Valor da carta</Label>
                        <Input name="valorCarta" placeholder="Ex.: 350.000,00" required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Data de adesão (opcional)</Label>
                            <Input type="date" name="dataAdesao" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Data de assinatura (opcional)</Label>
                            <Input type="date" name="dataAssinatura" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Nº do contrato (opcional)</Label>
                        <Input name="numero" placeholder="Ex.: 2025-000123" />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Criar contrato</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
