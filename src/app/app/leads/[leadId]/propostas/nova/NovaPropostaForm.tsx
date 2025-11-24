// src/app/app/leads/[leadId]/propostas/nova/NovaPropostaForm.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner"; // 👈 aqui em vez de useToast

const scenarioSchema = z.object({
    id: z.string().min(1),
    titulo: z.string().min(1),
    produto: z.enum(["imobiliario", "auto", "outro"]).default("imobiliario"),
    administradora: z.string().optional(),
    valor_carta: z.coerce.number(),
    prazo_meses: z.coerce.number(),
    com_redutor: z.coerce.boolean().optional(),

    parcela_cheia: z.coerce.number().optional().nullable(),
    parcela_reduzida: z.coerce.number().optional().nullable(),
    taxa_admin_anual: z.coerce.number().optional().nullable(),

    redutor_percent: z.coerce.number().optional().nullable(),
    fundo_reserva_pct: z.coerce.number().optional().nullable(),
    seguro_prestamista: z.coerce.boolean().optional(),

    lance_fixo_pct_1: z.coerce.number().optional().nullable(),
    lance_fixo_pct_2: z.coerce.number().optional().nullable(),

    permite_lance_embutido: z.coerce.boolean().optional(),
    lance_embutido_pct_max: z.coerce.number().optional().nullable(),

    observacoes: z.string().optional(),
});

const formSchema = z.object({
    titulo: z.string().min(3),
    campanha: z.string().optional(),
    status: z.enum(["rascunho", "enviado"]).default("rascunho"),
    metaCampanha: z.string().optional(),
    metaComentarioConsultor: z.string().optional(),
    metaValidadeDias: z.coerce.number().optional(),
    clienteOverrideNome: z.string().optional(),
    clienteOverrideObs: z.string().optional(),
    cenarios: z.array(scenarioSchema).min(1, "Adicione pelo menos um cenário"),
});

type FormValues = z.infer<typeof formSchema>;

export function NovaPropostaForm({
                                     leadId,
                                     defaultNomeCliente,
                                     defaultValorInteresse,
                                     defaultPrazoMeses,
                                 }: {
    leadId: string;
    defaultNomeCliente?: string | null;
    defaultValorInteresse?: number | null;
    defaultPrazoMeses?: number | null;
}) {
    const router = useRouter();

    const [values, setValues] = useState<FormValues>({
        titulo: `Estratégia de consórcio - ${defaultNomeCliente ?? "Cliente"}`,
        campanha: "",
        status: "rascunho",
        metaCampanha: "",
        metaComentarioConsultor: "",
        metaValidadeDias: 5,
        clienteOverrideNome: defaultNomeCliente ?? "",
        clienteOverrideObs: "",
        cenarios: [
            {
                id: "c1",
                titulo: "1x carta principal",
                produto: "imobiliario",
                administradora: "Porto",
                valor_carta: defaultValorInteresse ?? 500000,
                prazo_meses: defaultPrazoMeses ?? 200,
                com_redutor: true,
                redutor_percent: 40,           // ex.: 40% redutor
                parcela_cheia: undefined,
                parcela_reduzida: undefined,
                taxa_admin_anual: 18.5,        // taxa total (%)
                fundo_reserva_pct: 2,          // ex.: 2%
                seguro_prestamista: true,
                lance_fixo_pct_1: 40,
                lance_fixo_pct_2: undefined,
                permite_lance_embutido: true,
                lance_embutido_pct_max: 30,
                observacoes: "",
            },
        ],
    });

    const [submitting, setSubmitting] = useState(false);

    function updateScenario(
        index: number,
        patch: Partial<FormValues["cenarios"][number]>
    ) {
        setValues((prev) => {
            const copy = [...prev.cenarios];
            copy[index] = { ...copy[index], ...patch };
            return { ...prev, cenarios: copy };
        });
    }

    function addScenario() {
        setValues((prev) => {
            const nextIndex = prev.cenarios.length + 1;
            return {
                ...prev,
                cenarios: [
                    ...prev.cenarios,
                    {
                        id: `c${nextIndex}`,
                        titulo: `Cenário ${nextIndex}`,
                        produto: "imobiliario",
                        administradora: prev.cenarios[0]?.administradora ?? "Porto",
                        valor_carta: prev.cenarios[0]?.valor_carta ?? 500000,
                        prazo_meses: prev.cenarios[0]?.prazo_meses ?? 200,
                        com_redutor: true,
                        parcela_cheia: undefined,
                        parcela_reduzida: undefined,
                        taxa_admin_anual: prev.cenarios[0]?.taxa_admin_anual ?? 0.19,
                        observacoes: "",
                    },
                ],
            };
        });
    }

    function removeScenario(index: number) {
        setValues((prev) => {
            if (prev.cenarios.length === 1) return prev;
            const copy = [...prev.cenarios];
            copy.splice(index, 1);
            return { ...prev, cenarios: copy };
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const parsed = formSchema.safeParse(values);
        if (!parsed.success) {
            console.error(parsed.error.flatten());
            toast.error("Erro no formulário", {
                description: "Revise os campos obrigatórios da proposta.",
            });

            return;
        }

        const v = parsed.data;

        const payload = {
            titulo: v.titulo,
            campanha: v.campanha || undefined,
            status: v.status,
            meta: {
                campanha: v.metaCampanha || v.campanha || undefined,
                comentario_consultor: v.metaComentarioConsultor || undefined,
                validade_dias: v.metaValidadeDias ?? 5,
            },
            cliente_overrides: {
                ...(v.clienteOverrideNome
                    ? { nome: v.clienteOverrideNome }
                    : {}),
                ...(v.clienteOverrideObs
                    ? { observacao: v.clienteOverrideObs }
                    : {}),
            },
            cenarios: v.cenarios.map((c) => ({
                id: c.id,
                titulo: c.titulo,
                produto: c.produto,
                administradora: c.administradora || undefined,
                valor_carta: c.valor_carta,
                prazo_meses: c.prazo_meses,
                com_redutor: c.com_redutor,

                parcela_cheia: c.parcela_cheia ?? undefined,
                parcela_reduzida: c.parcela_reduzida ?? undefined,
                taxa_admin_anual: c.taxa_admin_anual ?? undefined,

                redutor_percent: c.redutor_percent ?? undefined,
                fundo_reserva_pct: c.fundo_reserva_pct ?? undefined,
                seguro_prestamista: c.seguro_prestamista,

                lance_fixo_pct_1: c.lance_fixo_pct_1 ?? undefined,
                lance_fixo_pct_2: c.lance_fixo_pct_2 ?? undefined,

                permite_lance_embutido: c.permite_lance_embutido,
                lance_embutido_pct_max: c.lance_embutido_pct_max ?? undefined,

                observacoes: c.observacoes || undefined,
            })),
        };

        try {
            setSubmitting(true);
            const res = await fetch(
                `/api/lead-propostas/lead/${encodeURIComponent(leadId)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error("Erro ao criar proposta:", data);
                toast.error("Erro ao criar proposta", {
                    description: "Revise os campos obrigatórios da proposta.",
                });

                return;
            }

            toast.success("Proposta criada", {
                description: "A proposta consultiva foi registrada para este lead.",
            });

            // redirecionar para tela do lead ou para a página pública
            if (data.public_hash) {
                router.push(`/propostas/${data.public_hash}`);
            } else {
                router.push(`/app/leads/${leadId}`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro inesperado", {
                description: "Não foi possível criar a proposta agora.",
            });

        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Cabeçalho da proposta */}
            <div className="space-y-2">
                <Label htmlFor="titulo">Título da proposta</Label>
                <Input
                    id="titulo"
                    value={values.titulo}
                    onChange={(e) =>
                        setValues((prev) => ({ ...prev, titulo: e.target.value }))
                    }
                />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="campanha">Campanha</Label>
                    <Input
                        id="campanha"
                        placeholder="Porto Imobiliário 40% redutor"
                        autoComplete="off"
                        value={values.campanha ?? ""}
                        onChange={(e) =>
                            setValues((prev) => ({ ...prev, campanha: e.target.value }))
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={values.status}
                        onValueChange={(val: "rascunho" | "enviado") =>
                            setValues((prev) => ({ ...prev, status: val }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rascunho">Rascunho</SelectItem>
                            <SelectItem value="enviado">Enviada ao cliente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="validade">Validade (dias)</Label>
                    <Input
                        id="validade"
                        type="number"
                        min={1}
                        value={values.metaValidadeDias ?? ""}
                        onChange={(e) =>
                            setValues((prev) => ({
                                ...prev,
                                metaValidadeDias: Number(e.target.value || 0),
                            }))
                        }
                    />
                </div>
            </div>

            {/* Comentário do consultor */}
            <div className="space-y-2">
                <Label htmlFor="comentario">Comentário do consultor</Label>
                <Textarea
                    id="comentario"
                    rows={3}
                    placeholder="Contexto da estratégia, foco em moradia vs renda, visão de lance, etc."
                    value={values.metaComentarioConsultor ?? ""}
                    onChange={(e) =>
                        setValues((prev) => ({
                            ...prev,
                            metaComentarioConsultor: e.target.value,
                        }))
                    }
                />
            </div>

            {/* Overrides do cliente */}
            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="clienteNome">Nome para exibir na proposta</Label>
                    <Input
                        id="clienteNome"
                        value={values.clienteOverrideNome ?? ""}
                        onChange={(e) =>
                            setValues((prev) => ({
                                ...prev,
                                clienteOverrideNome: e.target.value,
                            }))
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clienteObs">Observação do cliente</Label>
                    <Input
                        id="clienteObs"
                        placeholder="Ex.: Prefere parcelas em torno de R$ 2.600."
                        autoComplete="off"
                        value={values.clienteOverrideObs ?? ""}
                        onChange={(e) =>
                            setValues((prev) => ({
                                ...prev,
                                clienteOverrideObs: e.target.value,
                            }))
                        }
                    />
                </div>
            </div>

            {/* Cenários */}
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <Label>Cenários de carta</Label>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addScenario}
                        className="h-7 gap-1 text-xs"
                    >
                        <Plus className="h-3 w-3" /> Adicionar cenário
                    </Button>
                </div>

                <div className="space-y-3">
                    {values.cenarios.map((c, idx) => (
                        <Card key={c.id} className="border-dashed border-muted-foreground/40">
                            <CardHeader className="flex flex-row items-center justify-between gap-2 py-2 px-3">
                                <CardTitle className="text-xs">
                                    {c.titulo || `Cenário ${idx + 1}`}
                                </CardTitle>
                                {values.cenarios.length > 1 && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => removeScenario(idx)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-3 py-3 px-3 text-[13px]">
                                <div className="space-y-1.5">
                                    <Label>Título do cenário</Label>
                                    <Input
                                        value={c.titulo}
                                        onChange={(e) =>
                                            updateScenario(idx, { titulo: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="grid gap-2 md:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label>Produto</Label>
                                        <Select
                                            value={c.produto}
                                            onValueChange={(val: "imobiliario" | "auto" | "outro") =>
                                                updateScenario(idx, { produto: val })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="imobiliario">Imobiliário</SelectItem>
                                                <SelectItem value="auto">Auto</SelectItem>
                                                <SelectItem value="outro">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>Administradora</Label>
                                        <Input
                                            value={c.administradora ?? ""}
                                            onChange={(e) =>
                                                updateScenario(idx, { administradora: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>Prazo (meses)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={c.prazo_meses}
                                            onChange={(e) =>
                                                updateScenario(idx, {
                                                    prazo_meses: Number(e.target.value || 0),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2 md:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label>Valor da carta</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={c.valor_carta}
                                            onChange={(e) =>
                                                updateScenario(idx, {
                                                    valor_carta: Number(e.target.value || 0),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Parcela com redutor</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={c.parcela_reduzida ?? ""}
                                            onChange={(e) =>
                                                updateScenario(idx, {
                                                    parcela_reduzida: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Parcela sem redutor</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={c.parcela_cheia ?? ""}
                                            onChange={(e) =>
                                                updateScenario(idx, {
                                                    parcela_cheia: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label>Taxa admin. anual (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={
                                                c.taxa_admin_anual != null
                                                    ? c.taxa_admin_anual
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                updateScenario(idx, {
                                                    taxa_admin_anual: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                    </div>
                                    {/* Condições da administradora */}
                                    <div className="grid gap-2 md:grid-cols-3">
                                        <div className="space-y-1.5">
                                            <Label>Redutor (%)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={c.redutor_percent ?? ""}
                                                onChange={(e) =>
                                                    updateScenario(idx, {
                                                        redutor_percent: e.target.value
                                                            ? Number(e.target.value)
                                                            : undefined,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Fundo de reserva (%)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={c.fundo_reserva_pct ?? ""}
                                                onChange={(e) =>
                                                    updateScenario(idx, {
                                                        fundo_reserva_pct: e.target.value
                                                            ? Number(e.target.value)
                                                            : undefined,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Taxa adm. total (%)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={c.taxa_admin_anual ?? ""}
                                                onChange={(e) =>
                                                    updateScenario(idx, {
                                                        taxa_admin_anual: e.target.value
                                                            ? Number(e.target.value)
                                                            : undefined,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2 md:grid-cols-3">
                                        <div className="space-y-1.5">
                                            <Label>Seguro prestamista?</Label>
                                            <Select
                                                value={String(c.seguro_prestamista ?? "false")}
                                                onValueChange={(val) =>
                                                    updateScenario(idx, {
                                                        seguro_prestamista: val === "true",
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Sim</SelectItem>
                                                    <SelectItem value="false">Não</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Lance fixo 1 (%)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={c.lance_fixo_pct_1 ?? ""}
                                                onChange={(e) =>
                                                    updateScenario(idx, {
                                                        lance_fixo_pct_1: e.target.value
                                                            ? Number(e.target.value)
                                                            : undefined,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Lance fixo 2 (%)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={c.lance_fixo_pct_2 ?? ""}
                                                onChange={(e) =>
                                                    updateScenario(idx, {
                                                        lance_fixo_pct_2: e.target.value
                                                            ? Number(e.target.value)
                                                            : undefined,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label>Permite lance embutido?</Label>
                                            <Select
                                                value={String(c.permite_lance_embutido ?? "false")}
                                                onValueChange={(val) =>
                                                    updateScenario(idx, {
                                                        permite_lance_embutido: val === "true",
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Sim</SelectItem>
                                                    <SelectItem value="false">Não</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Máx. embutido (%)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={c.lance_embutido_pct_max ?? ""}
                                                onChange={(e) =>
                                                    updateScenario(idx, {
                                                        lance_embutido_pct_max: e.target.value
                                                            ? Number(e.target.value)
                                                            : undefined,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Com redutor?</Label>
                                        <Select
                                            value={String(c.com_redutor ?? "true")}
                                            onValueChange={(val) =>
                                                updateScenario(idx, {
                                                    com_redutor: val === "true",
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Sim</SelectItem>
                                                <SelectItem value="false">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Estratégia deste cenário</Label>
                                    <Textarea
                                        rows={2}
                                        value={c.observacoes ?? ""}
                                        onChange={(e) =>
                                            updateScenario(idx, { observacoes: e.target.value })
                                        }
                                        placeholder="Ex.: Foco em moradia principal, mantendo parcela confortável."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={submitting}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="gap-2"
                    disabled={submitting}
                >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salvar proposta
                </Button>
            </div>
        </form>
    );
}
