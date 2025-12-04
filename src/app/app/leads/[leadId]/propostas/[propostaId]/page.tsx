// app/leads/[leadid]/propostas/[propostaid]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/server";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShareProposalActions } from "@/app/propostas/[publicHash]/ShareProposalActions";
import { PropostaActionsClient } from "@/app/propostas/[publicHash]/PropostaActionsClient";
import {CadastroPFCard} from "@/app/app/leads/[leadId]/propostas/[propostaId]/CadastroPFCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

// ==== TYPES ===================================================================

type ProdutoTipo = "imobiliario" | "auto" | "outro";

interface PropostaScenario {
    id: string;
    titulo?: string | null;
    produto?: ProdutoTipo | null;
    administradora?: string | null;
    valor_carta?: number | null;
    prazo_meses?: number | null;
    parcela_reduzida?: number | null;
    parcela_cheia?: number | null;
    redutor_percent?: number | null;
    fundo_reserva_pct?: number | null;
    taxa_admin_anual?: number | null;
    taxa_admin_total?: number | null;
    lance_fixo_pct_1?: number | null;
    lance_fixo_pct_2?: number | null;
    permite_lance_embutido?: boolean | null;
    lance_embutido_pct_max?: number | null;
    seguro_prestamista?: boolean | null;
    observacoes?: string | null;
}

interface PropostaCliente {
    nome?: string | null;
    telefone?: string | null;
}

interface PropostaPayload {
    cliente?: PropostaCliente;
    propostas?: PropostaScenario[];
}

interface PropostaInterna {
    id: string;
    lead_id: string;
    public_hash?: string | null;
    titulo?: string | null;
    campanha?: string | null;
    status?: string | null;
    created_at?: string | null;
    payload?: PropostaPayload | null;
}

// ==== HELPERS =================================================================

function getStatusLabel(status?: string | null) {
    if (!status) return "Em análise";
    switch (status) {
        case "rascunho":
            return "Rascunho";
        case "enviada":
            return "Enviada ao cliente";
        case "aprovada":
            return "Aprovada";
        case "inativa":
            return "Inativa";
        default:
            return status;
    }
}

/**
 * Carrega uma proposta interna pelo ID (não pelo hash público).
 * Ajuste a URL abaixo se o seu backend usar outro path, ex.:
 *   /lead-propostas/{propostaId}
 */
async function loadPropostaInterna(propostaId: string): Promise<PropostaInterna> {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) {
        throw new Error("Org inválida");
    }

    const res = await fetch(
        `${BACKEND_URL}/lead-propostas/${encodeURIComponent(propostaId)}`,
        {
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "X-Org-Id": String(profile.orgId),
            },
        }
    );

    if (!res.ok) {
        console.error("loadPropostaInterna: status", res.status);
        throw new Error("Proposta não encontrada");
    }

    const data = (await res.json()) as PropostaInterna;
    return data;
}

// ==== PAGE ====================================================================

export default async function LeadPropostaDetailPage({
                                                         params,
                                                     }: {
    params: Promise<{ leadId: string; propostaId: string }>;
}) {
    const { leadId, propostaId } = await params;

    let proposta: PropostaInterna;
    try {
        proposta = await loadPropostaInterna(propostaId);
    } catch (e) {
        console.error(e);
        notFound();
    }

    const payload: PropostaPayload = proposta.payload ?? {};
    const cliente: PropostaCliente = payload.cliente ?? {};
    const cenarios: PropostaScenario[] = Array.isArray(payload.propostas)
        ? payload.propostas
        : [];
    const mainScenario = cenarios[0];

    return (
        <div className="h-full isolate overflow-auto bg-slate-950 text-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Breadcrumb / header */}
                <header className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                        <Link
                            href={`/app/leads/${leadId}`}
                            className="text-xs text-slate-400 hover:text-slate-100"
                        >
                            ← Voltar para o lead
                        </Link>
                        <h1 className="text-lg font-semibold text-slate-50">
                            Detalhes da proposta
                        </h1>
                        <p className="text-xs text-slate-400">
                            Acompanhe o status, o link público e os cenários desta proposta.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <Badge
                            variant="outline"
                            className="border-emerald-400/60 bg-emerald-500/10 text-emerald-200 text-[11px] uppercase tracking-[0.18em]"
                        >
                            {getStatusLabel(proposta.status)}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
              Criada em{" "}
                            {proposta.created_at
                                ? new Date(proposta.created_at).toLocaleString("pt-BR", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                })
                                : "—"}
            </span>
                    </div>
                </header>

                {/* Card cliente + campanha */}
                <Card className="border-emerald-500/20 bg-slate-950/80">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between gap-3 text-sm">
                            <span>{proposta.titulo ?? "Proposta de consórcio"}</span>
                            {proposta.campanha && (
                                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-200">
                  {proposta.campanha}
                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4 text-xs text-slate-300">
                        <div>
                            <span className="font-semibold text-slate-100">Cliente</span>{" "}
                            <span>{cliente.nome ?? "—"}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-100">Telefone</span>{" "}
                            <span>{cliente.telefone ?? "—"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Separator className="bg-slate-800/80" />

                {/* Compartilhamento e ações internas */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-100">
                        Envio ao cliente
                    </h2>
                    <p className="text-xs text-slate-400 max-w-xl">
                        Use o link público abaixo para enviar a proposta por WhatsApp ou
                        e-mail. Qualquer pessoa com o link poderá visualizar a proposta.
                    </p>

                    {proposta.public_hash ? (
                        <div className="space-y-3">
                            <ShareProposalActions
                                publicHash={proposta.public_hash}
                                clienteNome={cliente.nome}
                                phone={cliente.telefone}
                            />

                            <PropostaActionsClient
                                propostaId={proposta.id}
                                currentStatus={proposta.status ?? undefined}
                            />
                        </div>
                    ) : (
                        <p className="text-xs text-amber-400">
                            Esta proposta ainda não possui um <code>public_hash</code>{" "}
                            configurado. Verifique a geração da proposta no backend.
                        </p>
                    )}
                </section>

                <Separator className="bg-slate-800/80" />

                <section className="space-y-4 mb-10">
                    <h2 className="text-sm font-semibold text-slate-100">
                        Análise interna
                    </h2>
                    <p className="text-xs text-slate-400 max-w-xl">
                        Use os cenários para negociar com o cliente e a ficha cadastral para
                        lançar o contrato na administradora sem ficar alternando telas.
                    </p>

                    <div className="grid gap-6 lg:grid-cols-[1.4fr,1.2fr]">
                        {/* Coluna esquerda: Cenários */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Cenários de carta
                            </h3>

                            {cenarios.length === 0 && (
                                <p className="text-xs text-slate-400">
                                    Nenhum cenário encontrado no payload desta proposta.
                                </p>
                            )}

                            {mainScenario && (
                                <Card className="border-emerald-500/30 bg-slate-900/80 shadow-lg shadow-emerald-500/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center justify-between gap-2">
                                            <div className="flex flex-col gap-0.5">
                                                <span>{mainScenario.titulo ?? "Cenário principal"}</span>
                                                <span className="text-[11px] text-slate-400">
                  {mainScenario.produto === "imobiliario"
                      ? "Imobiliário"
                      : mainScenario.produto === "auto"
                          ? "Auto"
                          : "Consórcio"}
                </span>
                                            </div>
                                            {mainScenario.administradora && (
                                                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-200">
                  {mainScenario.administradora}
                </span>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-xs text-slate-300">
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <p>
                <span className="font-semibold text-slate-100">
                  Valor da carta:{" "}
                </span>
                                                {typeof mainScenario.valor_carta === "number"
                                                    ? mainScenario.valor_carta.toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })
                                                    : "—"}
                                            </p>
                                            <p>
                <span className="font-semibold text-slate-100">
                  Prazo:{" "}
                </span>
                                                {mainScenario.prazo_meses
                                                    ? `${mainScenario.prazo_meses} meses`
                                                    : "—"}
                                            </p>
                                            <p>
                <span className="font-semibold text-slate-100">
                  Parcela estimada:{" "}
                </span>
                                                {typeof mainScenario.parcela_reduzida === "number"
                                                    ? mainScenario.parcela_reduzida.toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })
                                                    : typeof mainScenario.parcela_cheia === "number"
                                                        ? mainScenario.parcela_cheia.toLocaleString("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        })
                                                        : "—"}
                                            </p>
                                        </div>

                                        {mainScenario.observacoes && (
                                            <p className="text-[11px] text-slate-400 italic">
                                                {mainScenario.observacoes}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {cenarios.slice(1).map((c) => (
                                <Card
                                    key={c.id}
                                    className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-colors"
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center justify-between gap-2">
                                            <span>{c.titulo}</span>
                                            <span className="text-[11px] text-slate-400">
                {c.produto === "imobiliario"
                    ? "Imobiliário"
                    : c.produto === "auto"
                        ? "Auto"
                        : "Consórcio"}
              </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-xs text-slate-300">
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <p>
                <span className="font-semibold text-slate-100">
                  Valor da carta:{" "}
                </span>
                                                {typeof c.valor_carta === "number"
                                                    ? c.valor_carta.toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })
                                                    : "—"}
                                            </p>
                                            <p>
                <span className="font-semibold text-slate-100">
                  Prazo:{" "}
                </span>
                                                {c.prazo_meses ? `${c.prazo_meses} meses` : "—"}
                                            </p>
                                            <p>
                <span className="font-semibold text-slate-100">
                  Parcela estimada:{" "}
                </span>
                                                {typeof c.parcela_reduzida === "number"
                                                    ? c.parcela_reduzida.toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })
                                                    : typeof c.parcela_cheia === "number"
                                                        ? c.parcela_cheia.toLocaleString("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        })
                                                        : "—"}
                                            </p>
                                        </div>

                                        {c.observacoes && (
                                            <p className="text-[11px] text-slate-400 italic">{c.observacoes}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Coluna direita: Ficha cadastral */}
                        <div className="space-y-3 lg:sticky lg:top-4 self-start">
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Ficha cadastral – PF
                            </h3>
                            <CadastroPFCard
                                propostaId={proposta.id}
                                clienteNome={cliente.nome ?? undefined}
                                clienteTelefone={cliente.telefone ?? undefined}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
