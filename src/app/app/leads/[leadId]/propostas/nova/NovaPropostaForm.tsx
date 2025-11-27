// src/app/app/leads/[leadId]/propostas/nova/NewProposalForm.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { MoneyInput } from "@/components/form/MoneyInput";
import { parseMoneyBRCents } from "@/lib/masks";
import { fireConfetti } from "@/lib/ui/confetti";

type Produto = "imobiliario" | "auto";

type ScenarioFormState = {
    titulo: string;
    produto: Produto;
    administradora: string;
    prazoMeses: string;
    valorCarta: string; // "1.000.000,00"
    parcelaReduzida: string;
    parcelaCheia: string;
    taxaAdminAnual: string;
    redutorPercent: string;
    fundoReservaPercent: string;
    taxaAdminTotal: string;
    seguroPrestamista: "sim" | "nao";
    lanceFixo1: string;
    lanceFixo2: string;
    permiteEmbutido: "sim" | "nao";
    maxEmbutidoPercent: string;
    comRedutor: "sim" | "nao";
    estrategia: string;
};

const emptyScenario = (): ScenarioFormState => ({
    titulo: "1x carta principal",
    produto: "imobiliario",
    administradora: "",
    prazoMeses: "",
    valorCarta: "",
    parcelaReduzida: "",
    parcelaCheia: "",
    taxaAdminAnual: "",
    redutorPercent: "",
    fundoReservaPercent: "",
    taxaAdminTotal: "",
    seguroPrestamista: "sim",
    lanceFixo1: "",
    lanceFixo2: "",
    permiteEmbutido: "sim",
    maxEmbutidoPercent: "",
    comRedutor: "sim",
    estrategia: "",
});

type Props = {
    leadId: string;
    leadName: string;
};

interface BackendErrorDetail {
    msg?: string;
    // permite outros campos sem usar any
    [key: string]: unknown;
}

interface BackendErrorBody {
    detail?: BackendErrorDetail[] | string;
    [key: string]: unknown;
}


function parsePercentToNumber(raw: string | null | undefined): number | null {
    if (!raw) return null;
    // deixa só dígitos, vírgula, ponto
    const cleaned = String(raw).replace(/[^\d,.-]/g, "").replace(",", ".");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
}

function parseIntOrNull(raw: string | null | undefined): number | null {
    if (!raw) return null;
    const cleaned = String(raw).replace(/[^\d-]/g, "");
    if (!cleaned) return null;
    const num = Number(cleaned);
    return Number.isInteger(num) ? num : null;
}


export function NewProposalForm({ leadId, leadName }: Props) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const [nomeParaExibir, setNomeParaExibir] = React.useState(leadName);
    const [obsCliente, setObsCliente] = React.useState("");
    const [campanha, setCampanha] = React.useState("");
    const [cenarios, setCenarios] = React.useState<ScenarioFormState[]>([
        emptyScenario(),
    ]);

    function updateScenario<T extends keyof ScenarioFormState>(
        index: number,
        field: T,
        value: ScenarioFormState[T]
    ) {
        setCenarios((prev) => {
            const clone = [...prev];
            clone[index] = { ...clone[index], [field]: value };
            return clone;
        });
    }

    function addScenario() {
        setCenarios((prev) => [...prev, emptyScenario()]);
    }

    function removeScenario(index: number) {
        setCenarios((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            toast.loading("Gerando proposta...");

            // monta payload esperado pelo backend (ajuste se necessário)
            const payload = {
                titulo: `Proposta para ${nomeParaExibir || leadName}`,
                campanha: campanha || null,
                status: "rascunho",
                cliente_overrides: {
                    nome_exibicao: nomeParaExibir || null,
                    observacao_cliente: obsCliente || null,
                },
                cenarios: cenarios.map((c, idx) => ({
                    id: `c-${idx + 1}`,
                    titulo: c.titulo || `Cenário ${idx + 1}`,
                    produto: c.produto,
                    administradora: c.administradora || null,
                    prazo_meses: parseIntOrNull(c.prazoMeses),
                    valor_carta: c.valorCarta ? parseMoneyBRCents(c.valorCarta) ?? null : null,
                    parcela_reduzida: c.parcelaReduzida
                        ? parseMoneyBRCents(c.parcelaReduzida) ?? null
                        : null,
                    parcela_cheia: c.parcelaCheia
                        ? parseMoneyBRCents(c.parcelaCheia) ?? null
                        : null,

                    taxa_admin_anual: parsePercentToNumber(c.taxaAdminAnual),
                    redutor_percent: parsePercentToNumber(c.redutorPercent),
                    fundo_reserva_pct: parsePercentToNumber(c.fundoReservaPercent),
                    taxa_admin_total: parsePercentToNumber(c.taxaAdminTotal),

                    seguro_prestamista: c.seguroPrestamista === "sim",
                    lance_fixo_pct_1: parsePercentToNumber(c.lanceFixo1),
                    lance_fixo_pct_2: parsePercentToNumber(c.lanceFixo2),

                    permite_lance_embutido: c.permiteEmbutido === "sim",
                    lance_embutido_pct_max: parsePercentToNumber(c.maxEmbutidoPercent),

                    com_redutor: c.comRedutor === "sim",
                    observacoes: c.estrategia || null,
                })),
            };

            // 🔗 CHAMADA PRO BACKEND
            // Ajuste este fetch/server action conforme sua estrutura atual
            const res = await fetch(`/api/lead-propostas/lead/${leadId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let backendMessage = "Falha ao criar proposta.";

                const raw = await res.text(); // lê UMA vez só

                try {
                    const data: BackendErrorBody = JSON.parse(raw);
                    console.error("Erro ao criar proposta (JSON):", data);

                    if (Array.isArray(data.detail) && data.detail.length > 0) {
                        backendMessage = data.detail[0]?.msg || backendMessage;
                    } else if (typeof data.detail === "string") {
                        backendMessage = data.detail;
                    }
                } catch {
                    console.error("Erro ao criar proposta (body texto):", raw);
                }

                throw new Error(backendMessage);
            }

            const data = await res.json();
            toast.dismiss();
            toast.success("Proposta criada com sucesso!");
            await fireConfetti();

            // se seu backend devolver public_hash:
            if (data?.public_hash) {
                router.push(`/propostas/${data.public_hash}`);
            } else {
                router.push(`/app/leads/${leadId}`);
            }
        } catch (err: unknown) {
            console.error(err);
            toast.dismiss();

            const message =
                err instanceof Error
                    ? err.message
                    : "Erro ao criar proposta.";

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-emerald-500/20 bg-slate-950/90 p-5 shadow-xl shadow-emerald-500/10"
        >
            {/* Cabeçalho do form */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold tracking-wide text-emerald-200 uppercase">
                        Configuração da proposta
                    </h2>
                    <p className="text-xs text-slate-400">
                        Ajuste o nome que aparecerá para o cliente, a campanha e os
                        cenários de carta.
                    </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 min-w-[240px]">
                    <div className="space-y-1">
                        <Label className="text-[11px] text-slate-300">
                            Nome para exibir na proposta
                        </Label>
                        <Input
                            value={nomeParaExibir}
                            onChange={(e) => setNomeParaExibir(e.target.value)}
                            placeholder={leadName}
                            className="h-8 text-sm bg-slate-900/80 border-slate-700/70"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[11px] text-slate-300">
                            Campanha / etiqueta
                        </Label>
                        <Input
                            value={campanha}
                            onChange={(e) => setCampanha(e.target.value)}
                            placeholder="Ex.: Campanha Porto Imóvel 500k"
                            className="h-8 text-sm bg-slate-900/80 border-slate-700/70"
                        />
                    </div>
                </div>
            </div>

            {/* Observação do cliente */}
            <div className="space-y-1">
                <Label className="text-[11px] text-slate-300">
                    Observação do cliente
                </Label>
                <Input
                    value={obsCliente}
                    onChange={(e) => setObsCliente(e.target.value)}
                    placeholder="Ex.: Prefere parcelas em torno de R$ 4.000, usa FGTS, foco em moradia principal…"
                    className="h-8 text-xs bg-slate-900/80 border-slate-700/70"
                />
            </div>

            {/* Cenários */}
            <Card className="border-slate-700/60 bg-slate-950/80">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-100">
                        Cenários de carta
                    </CardTitle>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
                        onClick={addScenario}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Adicionar cenário
                    </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                    {cenarios.map((c, idx) => (
                        <div
                            key={idx}
                            className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 space-y-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-200">
                  {idx + 1}x {c.titulo || "Cenário de carta"}
                </span>
                                {cenarios.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeScenario(idx)}
                                        className="inline-flex items-center gap-1 text-[11px] text-red-300 hover:text-red-200"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Remover
                                    </button>
                                )}
                            </div>

                            {/* Título */}
                            <div className="space-y-1">
                                <Label className="text-[11px] text-slate-300">
                                    Título do cenário
                                </Label>
                                <Input
                                    value={c.titulo}
                                    onChange={(e) =>
                                        updateScenario(idx, "titulo", e.target.value)
                                    }
                                    placeholder="Ex.: 1x carta principal"
                                    className="h-8 text-sm bg-slate-950/70 border-slate-700/70"
                                />
                            </div>

                            {/* Grid principal */}
                            <div className="grid gap-3 md:grid-cols-4">
                                {/* Produto */}
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Produto
                                    </Label>
                                    <Select
                                        value={c.produto}
                                        onValueChange={(v: Produto) =>
                                            updateScenario(idx, "produto", v)
                                        }
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-950/70 border-slate-700/70">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-slate-700">
                                            <SelectItem value="imobiliario">
                                                Imobiliário
                                            </SelectItem>
                                            <SelectItem value="auto">Auto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Administradora */}
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Administradora
                                    </Label>
                                    <Input
                                        value={c.administradora}
                                        onChange={(e) =>
                                            updateScenario(idx, "administradora", e.target.value)
                                        }
                                        placeholder="Ex.: Porto"
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>

                                {/* Prazo */}
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Prazo (meses)
                                    </Label>
                                    <Input
                                        value={c.prazoMeses}
                                        onChange={(e) =>
                                            updateScenario(idx, "prazoMeses", e.target.value)
                                        }
                                        inputMode="numeric"
                                        placeholder="200"
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>

                                {/* Valor da carta */}
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Valor da carta
                                    </Label>
                                    <MoneyInput
                                        value={c.valorCarta}
                                        onChange={(val) =>
                                            updateScenario(idx, "valorCarta", val ?? "")
                                        }
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                            </div>

                            {/* Parcelas */}
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Parcela com redutor
                                    </Label>
                                    <MoneyInput
                                        value={c.parcelaReduzida}
                                        onChange={(val) =>
                                            updateScenario(idx, "parcelaReduzida", val ?? "")
                                        }
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Parcela sem redutor
                                    </Label>
                                    <MoneyInput
                                        value={c.parcelaCheia}
                                        onChange={(val) =>
                                            updateScenario(idx, "parcelaCheia", val ?? "")
                                        }
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Taxa adm. total (%)
                                    </Label>
                                    <Input
                                        value={c.taxaAdminTotal}
                                        onChange={(e) =>
                                            updateScenario(idx, "taxaAdminTotal", e.target.value)
                                        }
                                        inputMode="decimal"
                                        placeholder="17,5"
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                            </div>

                            {/* Taxas e redutor */}
                            <div className="grid gap-3 md:grid-cols-4">
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Taxa adm. anual (%)
                                    </Label>
                                    <Input
                                        value={c.taxaAdminAnual}
                                        onChange={(e) =>
                                            updateScenario(idx, "taxaAdminAnual", e.target.value)
                                        }
                                        inputMode="decimal"
                                        placeholder="17,5"
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Redutor (%)
                                    </Label>
                                    <Input
                                        value={c.redutorPercent}
                                        onChange={(e) =>
                                            updateScenario(idx, "redutorPercent", e.target.value)
                                        }
                                        inputMode="decimal"
                                        placeholder="40"
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Fundo de reserva (%)
                                    </Label>
                                    <Input
                                        value={c.fundoReservaPercent}
                                        onChange={(e) =>
                                            updateScenario(idx, "fundoReservaPercent", e.target.value)
                                        }
                                        inputMode="decimal"
                                        placeholder="2"
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Seguro prestamista?
                                    </Label>
                                    <Select
                                        value={c.seguroPrestamista}
                                        onValueChange={(v: "sim" | "nao") =>
                                            updateScenario(idx, "seguroPrestamista", v)
                                        }
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-950/70 border-slate-700/70">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-slate-700">
                                            <SelectItem value="sim">Sim</SelectItem>
                                            <SelectItem value="nao">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Lances / embutido */}
                            <div className="grid gap-3 md:grid-cols-4">
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Lance fixo 1 (%)
                                    </Label>
                                    <Input
                                        value={c.lanceFixo1}
                                        onChange={(e) =>
                                            updateScenario(idx, "lanceFixo1", e.target.value)
                                        }
                                        inputMode="decimal"
                                        placeholder="40"
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Lance fixo 2 (%)
                                    </Label>
                                    <Input
                                        value={c.lanceFixo2}
                                        onChange={(e) =>
                                            updateScenario(idx, "lanceFixo2", e.target.value)
                                        }
                                        inputMode="decimal"
                                        placeholder="20"
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Permite lance embutido?
                                    </Label>
                                    <Select
                                        value={c.permiteEmbutido}
                                        onValueChange={(v: "sim" | "nao") =>
                                            updateScenario(idx, "permiteEmbutido", v)
                                        }
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-950/70 border-slate-700/70">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-slate-700">
                                            <SelectItem value="sim">Sim</SelectItem>
                                            <SelectItem value="nao">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Máx. embutido (%)
                                    </Label>
                                    <Input
                                        value={c.maxEmbutidoPercent}
                                        onChange={(e) =>
                                            updateScenario(idx, "maxEmbutidoPercent", e.target.value)
                                        }
                                        inputMode="decimal"
                                        placeholder="30"
                                        className="h-8 text-xs bg-slate-950/70 border-slate-700/70"
                                    />
                                </div>
                            </div>

                            {/* Flag com redutor */}
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="space-y-1">
                                    <Label className="text-[11px] text-slate-300">
                                        Com redutor?
                                    </Label>
                                    <Select
                                        value={c.comRedutor}
                                        onValueChange={(v: "sim" | "nao") =>
                                            updateScenario(idx, "comRedutor", v)
                                        }
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-950/70 border-slate-700/70">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-slate-700">
                                            <SelectItem value="sim">Sim</SelectItem>
                                            <SelectItem value="nao">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Estratégia */}
                            <div className="space-y-1">
                                <Label className="text-[11px] text-slate-300">
                                    Estratégia deste cenário
                                </Label>
                                <Textarea
                                    value={c.estrategia}
                                    onChange={(e) =>
                                        updateScenario(idx, "estrategia", e.target.value)
                                    }
                                    placeholder="Ex.: Foco em moradia principal, mantendo parcela confortável."
                                    className="min-h-[80px] text-xs bg-slate-950/70 border-slate-700/70"
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    className="text-sm"
                    onClick={() => router.push(`/app/leads/${leadId}`)}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-500 text-sm"
                >
                    {isSubmitting ? "Salvando..." : "Salvar proposta"}
                </Button>
            </div>
        </form>
    );
}
