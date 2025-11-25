import { Sparkles, Target, Layers, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Lead = {
    id: string;
    nome?: string | null;
    valor_interesse?: number | null;
    prazo_meses?: number | null;
    readiness_score?: number | null;
    perfil_psico?: string | null;
    origem?: string | null;
};

function formatCurrencyBR(value: number | null | undefined) {
    if (typeof value !== "number" || Number.isNaN(value)) return "—";
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
    });
}

export function LeadStrategiesCard({ lead }: { lead: Lead }) {
    const valor = lead.valor_interesse ?? null;
    const prazo = lead.prazo_meses ?? null;
    const ready = lead.readiness_score ?? null;

    // Heurísticas bem simples só pra deixar a UI viva
    const parcelaAlvo =
        typeof valor === "number" && typeof prazo === "number" && prazo > 0
            ? valor / prazo / 100 // bem conservador, só pra ilustrar
            : null;

    const lanceConservador =
        typeof valor === "number" ? Math.round(valor * 0.20) : null;
    const lanceAgressivo =
        typeof valor === "number" ? Math.round(valor * 0.40) : null;

    const perfil =
        lead.perfil_psico === "agressivo"
            ? "Perfil mais agressivo (topa risco maior)."
            : lead.perfil_psico === "moderado"
                ? "Perfil moderado (equilíbrio entre prazo e conforto)."
                : lead.perfil_psico === "conservador"
                    ? "Perfil conservador (prioriza segurança e conforto de parcela)."
                    : "Perfil ainda não mapeado. Use o diagnóstico para refinar.";

    return (
        <Card className="border-emerald-500/20 bg-slate-950/40">
            <CardHeader className="pb-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            </span>
                        Estratégias recomendadas
                    </CardTitle>

                    {ready != null && (
                        <Badge
                            variant="outline"
                            className="border-emerald-500/40 text-[10px] text-emerald-300 bg-emerald-500/10"
                        >
                            Ready: <span className="ml-1 font-semibold">{ready}%</span>
                        </Badge>
                    )}
                </div>

                <p className="text-[11px] text-slate-400">
                    Visão rápida das linhas de ataque sugeridas para este lead. Use como
                    base para montar as propostas consultivas.
                </p>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
                {/* Bloco de contexto do cliente */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[11px] text-slate-200">
              Contexto do cliente
            </span>
                        {lead.origem && (
                            <Badge
                                variant="outline"
                                className="border-slate-700 bg-slate-900/60 text-[10px]"
                            >
                                Origem: {lead.origem}
                            </Badge>
                        )}
                    </div>

                    <div className="grid gap-2 md:grid-cols-3">
                        <div>
                            <p className="text-[10px] text-slate-400">Ticket de interesse</p>
                            <p className="text-[11px] font-medium">
                                {valor ? formatCurrencyBR(valor) : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400">Prazo desejado</p>
                            <p className="text-[11px] font-medium">
                                {prazo ? `${prazo} meses` : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400">Perfil</p>
                            <p className="text-[11px] font-medium line-clamp-2">{perfil}</p>
                        </div>
                    </div>
                </div>

                {/* Estratégia 1 – Carta raiz */}
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                <Target className="h-3.5 w-3.5 text-emerald-300" />
              </span>
                            <p className="text-[11px] font-semibold text-emerald-100">
                                Estratégia raiz – Carta principal com redutor
                            </p>
                        </div>
                        {parcelaAlvo && (
                            <Badge className="bg-emerald-600/80 text-[10px]">
                                Parcela alvo ~ {formatCurrencyBR(parcelaAlvo)}
                            </Badge>
                        )}
                    </div>

                    <p className="text-[11px] text-emerald-50/80">
                        Foca em uma carta principal no ticket de interesse do cliente,
                        usando redutor de parcela para manter conforto de fluxo de caixa nos
                        primeiros anos. Ideal para moradia principal.
                    </p>

                    <ul className="mt-1 space-y-1 text-[10px] text-emerald-50/80">
                        <li>• Criar 1 cenário &#34;Carta principal com redutor&#34;.</li>
                        <li>• Incluir campos: redutor, taxa admin, fundo reserva.</li>
                        <li>• Comentário do consultor: foco em segurança de parcela.</li>
                    </ul>
                </div>

                {/* Estratégia 2 – Duas cartas */}
                <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3 space-y-2">
                    <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15">
              <Layers className="h-3.5 w-3.5 text-sky-300" />
            </span>
                        <p className="text-[11px] font-semibold text-slate-100">
                            Estratégia complementar – 2 cartas (moradia + renda)
                        </p>
                    </div>

                    <p className="text-[11px] text-slate-300">
                        Divide o valor em 2 cartas menores: uma direcionada para moradia, e
                        outra para renda futura (aluguel / Airbnb). Útil para perfis que
                        aceitam investir um pouco mais para aumentar patrimônio.
                    </p>

                    <ul className="mt-1 space-y-1 text-[10px] text-slate-300">
                        <li>• Criar 2 cenários: cartas menores com prazos iguais.</li>
                        <li>• Simular parcelas próximas ao orçamento alvo.</li>
                        <li>• Destacar no comentário o potencial de renda da 2ª carta.</li>
                    </ul>
                </div>

                {/* Estratégia 3 – Lances sugeridos */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-2">
                    <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15">
              <TrendingUp className="h-3.5 w-3.5 text-amber-300" />
            </span>
                        <p className="text-[11px] font-semibold text-slate-100">
                            Janela de lance sugerida
                        </p>
                    </div>

                    <p className="text-[11px] text-slate-300">
                        Use essa faixa como ponto de partida no diálogo de lance, ajustando
                        conforme grupo, histórico de contemplações e apetite do cliente.
                    </p>

                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="rounded-md border border-slate-800 bg-slate-950/60 p-2">
                            <p className="text-[10px] text-slate-400">Lance conservador</p>
                            <p className="text-[11px] font-medium">
                                {lanceConservador ? formatCurrencyBR(lanceConservador) : "—"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                                Base ~20% do crédito. Aumenta chances sem forçar demais.
                            </p>
                        </div>
                        <div className="rounded-md border border-slate-800 bg-slate-950/60 p-2">
                            <p className="text-[10px] text-slate-400">Lance agressivo</p>
                            <p className="text-[11px] font-medium">
                                {lanceAgressivo ? formatCurrencyBR(lanceAgressivo) : "—"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                                Base ~40% do crédito. Útil para urgência alta / perfil agressivo.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
