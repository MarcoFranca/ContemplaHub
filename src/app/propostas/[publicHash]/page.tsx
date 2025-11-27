// src/app/propostas/[publicHash]/page.tsx
import { notFound } from "next/navigation";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShareProposalActions } from "./ShareProposalActions";

export const dynamic = "force-dynamic";

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

interface PropostaPublica {
    id: string;
    titulo?: string | null;
    campanha?: string | null;
    status?: string | null;
    created_at?: string | null;
    payload?: PropostaPayload | null;
}


async function loadProposta(hash: string): Promise<PropostaPublica | null> {
    try {
        const res = await fetch(
            `${BACKEND_URL}/lead-propostas/p/${encodeURIComponent(hash)}`,
            {
                cache: "no-store",
            }
        );

        if (!res.ok) {
            console.error("loadProposta: backend respondeu status", res.status);
            return null;
        }

        const json: PropostaPublica = await res.json();
        console.log("DEBUG proposta pública:", json);
        return json;
    } catch (err) {
        console.error("loadProposta: erro ao buscar proposta", err);
        return null;
    }
}

function getStatusLabel(status?: string | null) {
    if (!status) return "Em análise";
    switch (status) {
        case "rascunho":
            return "Rascunho";
        case "enviada":
            return "Enviada";
        case "aprovada":
            return "Aprovada";
        case "inativa":
            return "Inativa";
        default:
            return status;
    }
}

export default async function PropostaPublicaPage({
                                                      params,
                                                  }: {
    params: Promise<{ publicHash: string }>;
}) {
    const { publicHash } = await params;

    const proposta = await loadProposta(publicHash);

    if (!proposta) {
        notFound();
    }

    const payload: PropostaPayload = proposta.payload ?? {};
    const cliente: PropostaCliente = payload.cliente ?? {};
    const cenarios: PropostaScenario[] = Array.isArray(payload.propostas)
        ? payload.propostas
        : [];

    const mainScenario = cenarios[0];


    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <div className="relative isolate overflow-hidden">
                {/* fundo suave com gradiente */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_60%),radial-gradient(circle_at_bottom,_#0f172a,_#020617)]" />

                <div className="relative max-w-5xl mx-auto px-4 py-10 space-y-8">
                    {/* HERO / CABEÇALHO */}
                    <header className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
                                    Proposta personalizada de consórcio
                                </p>
                                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
                                    {proposta.titulo ?? "Proposta de Consórcio"}
                                </h1>
                                {cliente?.nome && (
                                    <p className="text-sm text-slate-300">
                                        Preparada para{" "}
                                        <span className="font-medium text-emerald-300">
                      {cliente.nome}
                    </span>
                                    </p>
                                )}
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
                        </div>

                        {proposta.campanha && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-slate-900/70 px-3 py-1 text-[11px] text-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Campanha: {proposta.campanha}
                            </div>
                        )}

                        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                            Esta proposta foi montada para transformar seu objetivo em
                            patrimônio, com parcelas planejadas e estratégia clara de
                            contemplação — sem juros, dentro da filosofia do consórcio.
                        </p>
                    </header>

                    <Separator className="bg-slate-800/80" />

                    {/* CENÁRIO PRINCIPAL (RECOMENDADO) */}
                    {mainScenario && (
                        <section className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-slate-100">
                                    Cenário recomendado
                                </h2>
                                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] text-emerald-200 uppercase tracking-[0.16em]">
                  Foco neste plano
                </span>
                            </div>

                            <Card className="border-emerald-500/30 bg-slate-900/80 shadow-lg shadow-emerald-500/15">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                                        <span>{mainScenario.titulo ?? "Cenário principal"}</span>
                                        <span className="text-xs font-normal text-slate-400">
                      {mainScenario.produto === "imobiliario"
                          ? "Consórcio imobiliário"
                          : mainScenario.produto === "auto"
                              ? "Consórcio de veículo"
                              : "Consórcio"}
                    </span>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* KPIs principais */}
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-lg border border-slate-700/80 bg-slate-950/60 p-3">
                                            <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                                                Valor da carta
                                            </p>
                                            <p className="mt-1 text-base font-semibold text-slate-50">
                                                {typeof mainScenario.valor_carta === "number"
                                                    ? mainScenario.valor_carta.toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })
                                                    : "—"}
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-slate-700/80 bg-slate-950/60 p-3">
                                            <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                                                Prazo previsto
                                            </p>
                                            <p className="mt-1 text-base font-semibold text-slate-50">
                                                {mainScenario.prazo_meses
                                                    ? `${mainScenario.prazo_meses} meses`
                                                    : "—"}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                Planejado para caber no seu momento de vida.
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-slate-700/80 bg-slate-950/60 p-3">
                                            <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                                                Parcela estimada
                                            </p>
                                            <p className="mt-1 text-base font-semibold text-emerald-300">
                                                {typeof mainScenario.parcela_reduzida === "number"
                                                    ? mainScenario.parcela_reduzida.toLocaleString(
                                                        "pt-BR",
                                                        {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        }
                                                    )
                                                    : typeof mainScenario.parcela_cheia === "number"
                                                        ? mainScenario.parcela_cheia.toLocaleString(
                                                            "pt-BR",
                                                            {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            }
                                                        )
                                                        : "—"}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                Valor aproximado da parcela mensal.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalhes resumidos */}
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1 text-xs text-slate-300">
                                            <p>
                        <span className="font-semibold text-slate-100">
                          Administradora:{" "}
                        </span>
                                                {mainScenario.administradora ?? "—"}
                                            </p>
                                            {mainScenario.redutor_percent != null && (
                                                <p>
                          <span className="font-semibold text-slate-100">
                            Redutor de parcela:{" "}
                          </span>
                                                    {mainScenario.redutor_percent}% (após contemplação)
                                                </p>
                                            )}
                                            {mainScenario.taxa_admin_anual != null && (
                                                <p>
                          <span className="font-semibold text-slate-100">
                            Taxa de administração:{" "}
                          </span>
                                                    {mainScenario.taxa_admin_anual}% ao ano
                                                </p>
                                            )}
                                            {mainScenario.fundo_reserva_pct != null && (
                                                <p>
                          <span className="font-semibold text-slate-100">
                            Fundo de reserva:{" "}
                          </span>
                                                    {mainScenario.fundo_reserva_pct}%
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1 text-xs text-slate-300">
                                            {mainScenario.permite_lance_embutido != null && (
                                                <p>
                          <span className="font-semibold text-slate-100">
                            Lances e estratégia:
                          </span>{" "}
                                                    {mainScenario.permite_lance_embutido
                                                        ? `Permite lance embutido (até ${
                                                            mainScenario.lance_embutido_pct_max ?? "?"
                                                        }% do crédito).`
                                                        : "Foco em lances com recursos próprios."}
                                                </p>
                                            )}

                                            {(mainScenario.lance_fixo_pct_1 != null ||
                                                mainScenario.lance_fixo_pct_2 != null) && (
                                                <p>
                          <span className="font-semibold text-slate-100">
                            Lances fixos de referência:
                          </span>{" "}
                                                    {[mainScenario.lance_fixo_pct_1,
                                                        mainScenario.lance_fixo_pct_2]
                                                        .filter((x) => x != null)
                                                        .join("% • ")}
                                                    %
                                                </p>
                                            )}

                                            {mainScenario.seguro_prestamista != null && (
                                                <p>
                          <span className="font-semibold text-slate-100">
                            Seguro prestamista:{" "}
                          </span>
                                                    {mainScenario.seguro_prestamista ? "Incluso" : "Não incluso"}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {mainScenario.observacoes && (
                                        <div className="mt-2 rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2">
                                            <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-[0.16em] mb-1">
                                                Estratégia deste cenário
                                            </p>
                                            <p className="text-xs text-slate-300">
                                                {mainScenario.observacoes}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    )}

                    {/* OUTROS CENÁRIOS */}
                    {cenarios.length > 1 && (
                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold text-slate-100">
                                Outras opções de carta
                            </h2>
                            <p className="text-xs text-slate-400">
                                Abaixo você encontra alternativas com valores de carta, prazos
                                e estratégias diferentes, caso queira comparar possibilidades.
                            </p>

                            <div className="space-y-3">
                                {cenarios.slice(1).map((c) => (
                                    <Card
                                        key={c.id}
                                        className="bg-slate-900/70 border border-slate-800"
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex flex-wrap items-center justify-between gap-2">
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
                                                <p className="text-[11px] text-slate-400 italic">
                                                    {c.observacoes}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    <Separator className="bg-slate-800/80" />

                    {/* PRÓXIMOS PASSOS / COMPARTILHAMENTO */}
                    <section className="space-y-3 mb-6">
                        <h2 className="text-sm font-semibold text-slate-100">
                            Próximos passos
                        </h2>
                        <p className="text-xs text-slate-400 max-w-xl">
                            Se esta proposta fizer sentido para você, salve o link e entre em
                            contato pelo WhatsApp para ajustarmos o valor da carta, prazo ou
                            estratégia de lance. A ideia é que o plano encaixe com segurança
                            no seu momento de vida.
                        </p>

                        <ShareProposalActions
                            publicHash={publicHash}
                            clienteNome={cliente.nome}
                            phone={cliente.telefone}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
