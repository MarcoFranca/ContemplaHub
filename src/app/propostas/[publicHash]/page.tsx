import { notFound } from "next/navigation";
const BACKEND_URL =
    process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShareProposalActions } from "./ShareProposalActions";

export const dynamic = "force-dynamic";
import { PropostaActionsClient } from "./PropostaActionsClient"; // 👈 novo

async function loadProposta(hash: string) {
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

        const json = await res.json();
        console.log("DEBUG proposta pública:", json);
        return json;
    } catch (err) {
        console.error("loadProposta: erro ao buscar proposta", err);
        return null;
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

    const payload = proposta.payload ?? {};
    const cliente = payload.cliente ?? {};
    const cenarios: any[] = Array.isArray(payload.propostas)
        ? payload.propostas
        : [];

    return (
        <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* CABEÇALHO DA PROPOSTA */}
                <Card className="bg-slate-900/70 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            {proposta.titulo ?? "Proposta de Consórcio"}
                        </CardTitle>
                        <p className="text-sm text-slate-400">
                            Campanha: {proposta.campanha ?? "—"}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>
                            Cliente: <b>{cliente.nome ?? "—"}</b>
                        </p>
                        <p className="text-xs text-slate-400">
                            Criada em:{" "}
                            {proposta.created_at
                                ? new Date(proposta.created_at).toLocaleString("pt-BR")
                                : "—"}
                        </p>

                        <ShareProposalActions
                            publicHash={publicHash}
                            clienteNome={cliente.nome}
                            phone={cliente.telefone}
                        />

                        {/* 🔥 ações internas (time) – client component */}
                        <PropostaActionsClient
                            propostaId={proposta.id}
                            currentStatus={proposta.status}
                        />
                    </CardContent>
                </Card>

                {/* CENÁRIOS */}
                <div className="space-y-4">
                    {cenarios.length === 0 && (
                        <p className="text-sm text-slate-400">
                            Nenhum cenário de carta encontrado nesta proposta.
                        </p>
                    )}

                    {cenarios.map((c) => (
                        <Card
                            key={c.id}
                            className="bg-slate-900/60 border border-slate-700"
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">{c.titulo}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-slate-300">
                                <p>
                                    <b>Produto:</b>{" "}
                                    {c.produto === "imobiliario"
                                        ? "Imobiliário"
                                        : c.produto === "auto"
                                            ? "Auto"
                                            : "Outro"}
                                </p>
                                <p>
                                    <b>Administradora:</b> {c.administradora ?? "—"}
                                </p>
                                <p>
                                    <b>Valor da carta:</b>{" "}
                                    {typeof c.valor_carta === "number"
                                        ? c.valor_carta.toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        })
                                        : "—"}
                                </p>
                                <p>
                                    <b>Prazo:</b> {c.prazo_meses} meses
                                </p>

                                {c.parcela_reduzida != null && (
                                    <p>
                                        <b>Parcela com redutor:</b>{" "}
                                        {c.parcela_reduzida.toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        })}
                                    </p>
                                )}

                                {c.parcela_cheia != null && (
                                    <p>
                                        <b>Parcela sem redutor:</b>{" "}
                                        {c.parcela_cheia.toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        })}
                                    </p>
                                )}

                                {c.redutor_percent != null && (
                                    <p>
                                        <b>Redutor:</b> {c.redutor_percent}%
                                    </p>
                                )}

                                {c.fundo_reserva_pct != null && (
                                    <p>
                                        <b>Fundo de reserva:</b> {c.fundo_reserva_pct}%
                                    </p>
                                )}

                                {c.taxa_admin_anual != null && (
                                    <p>
                                        <b>Taxa de administração:</b> {c.taxa_admin_anual}%
                                    </p>
                                )}

                                {c.seguro_prestamista != null && (
                                    <p>
                                        <b>Seguro prestamista:</b>{" "}
                                        {c.seguro_prestamista ? "Sim" : "Não"}
                                    </p>
                                )}

                                {(c.lance_fixo_pct_1 != null ||
                                    c.lance_fixo_pct_2 != null) && (
                                    <p>
                                        <b>Lances fixos:</b>{" "}
                                        {[c.lance_fixo_pct_1, c.lance_fixo_pct_2]
                                            .filter((x) => x != null)
                                            .join(" % • ")}
                                        {c.lance_fixo_pct_1 != null || c.lance_fixo_pct_2 != null
                                            ? " %"
                                            : null}
                                    </p>
                                )}

                                {c.permite_lance_embutido != null && (
                                    <p>
                                        <b>Lance embutido:</b>{" "}
                                        {c.permite_lance_embutido
                                            ? `Sim (até ${c.lance_embutido_pct_max ?? "?"}%)`
                                            : "Não"}
                                    </p>
                                )}

                                {c.observacoes && (
                                    <p className="pt-2 text-slate-400 text-sm italic">
                                        {c.observacoes}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
