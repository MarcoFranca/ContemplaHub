// app/propostas/[hash]/page.tsx
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Timer, HomeIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Types mirrored from backend schema
type ProdutoTipo = "imobiliario" | "auto" | "outro";

type ProposalScenario = {
    id: string;
    titulo: string;
    produto: ProdutoTipo;
    administradora?: string | null;
    valor_carta: number;
    prazo_meses: number;
    com_redutor?: boolean | null;
    parcela_cheia?: number | null;
    parcela_reduzida?: number | null;
    taxa_admin_anual?: number | null;
    observacoes?: string | null;
};

type ProposalMeta = {
    campanha?: string | null;
    comentario_consultor?: string | null;
    validade_dias?: number | null;
};

type ProposalClientInfo = {
    lead_id: string;
    nome?: string | null;
    telefone?: string | null;
    email?: string | null;
    origem?: string | null;
};

type LeadProposalPayload = {
    cliente: ProposalClientInfo;
    propostas: ProposalScenario[];
    meta?: ProposalMeta | null;
    extras?: {
        cliente_overrides?: Record<string, unknown>;
        [key: string]: unknown;
    } | null;
};

type LeadProposalRecord = {
    id: string;
    org_id: string;
    lead_id: string;
    titulo?: string | null;
    campanha?: string | null;
    status?: string | null;
    public_hash?: string | null;
    payload: LeadProposalPayload;
    pdf_url?: string | null;
    created_at?: string | null;
    created_by?: string | null;
    updated_at?: string | null;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getProposal(publicHash: string): Promise<LeadProposalRecord> {
    const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ??
        process.env.BACKEND_URL ??
        "http://localhost:8000";

    const res = await fetch(
        `${baseUrl}/lead-propostas/p/${encodeURIComponent(publicHash)}`,
        {
            // proposta pode ser atualizada
            cache: "no-store",
        }
    );

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        throw new Error(`Failed to load proposal: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as LeadProposalRecord;
    return data;
}

function formatCurrency(value?: number | null) {
    if (value == null) return "-";
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
    });
}

function formatPrazo(meses: number) {
    const anos = Math.floor(meses / 12);
    const restoMeses = meses % 12;
    if (anos === 0) return `${meses} meses`;
    if (restoMeses === 0) return `${anos} anos`;
    return `${anos} anos e ${restoMeses} meses`;
}

function getClienteNome(payload: LeadProposalPayload): string {
    const overrideNome =
        payload.extras?.cliente_overrides &&
        (payload.extras.cliente_overrides["nome"] as string | undefined);

    return (
        overrideNome ||
        payload.cliente.nome ||
        "Cliente da Autentika"
    );
}

function getClienteObservacao(payload: LeadProposalPayload): string | null {
    const obs =
        payload.extras?.cliente_overrides &&
        (payload.extras.cliente_overrides["observacao"] as string | undefined);
    return obs || null;
}

function getWhatsAppLink(payload: LeadProposalPayload): string {
    const baseNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""; // ex: "5521999999999"
    const nome = getClienteNome(payload);
    const texto = `Olá, sou ${nome} e recebi a proposta de consórcio da Autentika. Quero falar com um consultor.`;

    if (!baseNumber) {
        // fallback: só abre o app
        return `https://wa.me/?text=${encodeURIComponent(texto)}`;
    }

    return `https://wa.me/${baseNumber}?text=${encodeURIComponent(texto)}`;
}

function ScenarioCard({
                          scenario,
                          highlighted = false,
                      }: {
    scenario: ProposalScenario;
    highlighted?: boolean;
}) {
    const produtoLabel =
        scenario.produto === "imobiliario"
            ? "Imobiliário"
            : scenario.produto === "auto"
                ? "Auto"
                : "Outro";

    return (
        <Card
            className={`h-full flex flex-col ${
                highlighted
                    ? "border-emerald-500/80 shadow-lg shadow-emerald-500/20"
                    : ""
            }`}
        >
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base md:text-lg">
                        {scenario.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {highlighted && (
                            <Badge
                                variant="outline"
                                className="border-emerald-500 text-emerald-400 text-[11px] uppercase tracking-wide"
                            >
                                Cenário recomendado
                            </Badge>
                        )}
                        <Badge variant="secondary" className="text-[11px]">
                            {produtoLabel}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {scenario.administradora && (
                        <span>{scenario.administradora}</span>
                    )}
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span>{formatPrazo(scenario.prazo_meses)}</span>
                    {typeof scenario.com_redutor === "boolean" && (
                        <>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                            <span>
                {scenario.com_redutor
                    ? "Com redutor"
                    : "Sem redutor"}
              </span>
                        </>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 text-sm flex-1">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                            Valor da carta
                        </p>
                        <p className="font-semibold">
                            {formatCurrency(scenario.valor_carta)}
                        </p>
                    </div>

                    {scenario.parcela_reduzida != null && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Parcela com redutor
                            </p>
                            <p className="font-semibold">
                                {formatCurrency(scenario.parcela_reduzida)}
                            </p>
                        </div>
                    )}

                    {scenario.parcela_cheia != null && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Parcela sem redutor
                            </p>
                            <p className="font-semibold">
                                {formatCurrency(scenario.parcela_cheia)}
                            </p>
                        </div>
                    )}

                    {scenario.taxa_admin_anual != null && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Taxa de administração
                            </p>
                            <p className="font-semibold">
                                {(scenario.taxa_admin_anual * 100).toFixed(2)}% a.a.
                            </p>
                        </div>
                    )}
                </div>

                {scenario.observacoes && (
                    <>
                        <Separator className="my-2" />
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Estratégia deste cenário
                            </p>
                            <p>{scenario.observacoes}</p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default async function PropostaPublicaPage({
                                                      params,
                                                  }: {
    params: { hash: string };
}) {
    const proposta = await getProposal(params.hash);
    const { payload } = proposta;

    const nomeCliente = getClienteNome(payload);
    const observacaoCliente = getClienteObservacao(payload);
    const meta = payload.meta;
    const cenarios = payload.propostas ?? [];
    const whatsappUrl = getWhatsAppLink(payload);

    const statusLabel =
        proposta.status === "enviado"
            ? "Enviada"
            : proposta.status === "rascunho"
                ? "Rascunho"
                : "Proposta";

    // regra simples: destacar primeiro cenário
    const destaqueId = cenarios[0]?.id;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
            <header className="border-b bg-background/70 backdrop-blur">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Voltar
                        </Link>
                        <div className="h-6 w-px bg-border" />
                        <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">
                Autentika Consórcios
              </span>
                            <span className="text-sm font-semibold">
                {proposta.titulo || "Proposta de consórcio personalizada"}
              </span>
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className="text-[11px] border-emerald-500/60 text-emerald-400"
                    >
                        {statusLabel}
                    </Badge>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
                {/* Cliente + contexto */}
                <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <HomeIcon className="h-4 w-4 text-emerald-400" />
                                    <CardTitle className="text-base md:text-lg">
                                        Estratégia de consórcio para {nomeCliente}
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p className="text-muted-foreground">
                                Esta proposta foi construída para transformar o consórcio em
                                uma estratégia de patrimônio — combinando{" "}
                                <span className="font-medium">
                  segurança, previsibilidade e potencial de ganho
                </span>
                                .
                            </p>

                            {meta?.comentario_consultor && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                                        Visão do consultor
                                    </p>
                                    <p>{meta.comentario_consultor}</p>
                                </div>
                            )}

                            {observacaoCliente && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                                        Preferências do cliente
                                    </p>
                                    <p>{observacaoCliente}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm md:text-base">
                                Sobre você e esta proposta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Nome</p>
                                <p className="font-medium">
                                    {nomeCliente}
                                </p>
                            </div>

                            {payload.cliente.origem && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Origem</p>
                                    <p className="font-medium capitalize">
                                        {payload.cliente.origem}
                                    </p>
                                </div>
                            )}

                            {meta?.campanha && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Campanha</p>
                                    <p className="font-medium">{meta.campanha}</p>
                                </div>
                            )}

                            {meta?.validade_dias && (
                                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                                    <Timer className="h-3 w-3" />
                                    Proposta válida por{" "}
                                    <span className="font-semibold">
                    {meta.validade_dias}{" "}
                                        {meta.validade_dias === 1 ? "dia" : "dias"}
                  </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Cenários de estratégia */}
                <section className="space-y-3 md:space-y-4">
                    <div className="flex items-end justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">
                                Combinações de cartas
                            </p>
                            <h2 className="text-base md:text-lg font-semibold">
                                Cenários pensados para o seu plano
                            </h2>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {cenarios.map((c) => (
                            <ScenarioCard
                                key={c.id}
                                scenario={c}
                                highlighted={c.id === destaqueId}
                            />
                        ))}
                    </div>

                    {cenarios.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Nenhum cenário disponível nesta proposta.
                        </p>
                    )}
                </section>

                {/* CTA principal */}
                <section>
                    <Card className="border-emerald-500/40 bg-emerald-950/40">
                        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-5">
                            <div className="space-y-1 text-center md:text-left">
                                <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-300">
                                    Próximo passo
                                </p>
                                <p className="text-sm md:text-base text-emerald-50">
                                    Fale com um consultor da Autentika para ajustar o plano,
                                    revisar valores de lance e seguir para a contratação com
                                    segurança.
                                </p>
                            </div>

                            <Button
                                asChild
                                size="lg"
                                className="w-full md:w-auto gap-2 font-semibold"
                            >
                                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                                    <MessageCircle className="h-4 w-4" />
                                    Falar com um consultor agora
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                <footer className="pt-4 border-t text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
                    <span>Autentika Seguros — Planeje hoje, conquiste sempre.</span>
                    <span>Proposta #{proposta.public_hash}</span>
                </footer>
            </main>
        </div>
    );
}
