import {
    Sparkles,
    Gauge,
    Target,
    Stethoscope,
    TrendingUp,
    CheckCircle2,
    Lock,
    ListChecks,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ESTADO_CIVIL_OPCOES,
    REGIME_OPCOES,
    ATUACAO_OPCOES,
    MOMENTO_OPCOES,
    OBJETIVOS,
    type DiagnosticoInputs,
    type DiagnosticoResultado,
} from "@/features/diagnostico/types";

type Registro = {
    id: string;
    inputs: DiagnosticoInputs | null;
    resultado: DiagnosticoResultado | null;
    estagio: string | null;
    score: number | null;
    created_at: string;
};

const brl = (v?: number | null) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
        Number(v ?? 0),
    );

const label = (arr: readonly { id: string; label: string }[], id?: string | null) =>
    arr.find((o) => o.id === id)?.label ?? id ?? "";

const labels = (arr: readonly { id: string; label: string }[], ids?: string[] | null) =>
    (ids ?? []).map((id) => label(arr, id)).filter(Boolean);

export function LeadDiagnosticoFunilCard({ registro }: { registro: Registro }) {
    const inp = registro.inputs;
    const r = registro.resultado;
    if (!inp || !r) return null;

    const data = new Date(registro.created_at).toLocaleDateString("pt-BR");
    const aptos = r.produtos?.filter((p) => p.status === "apto") ?? [];
    const bloqueados = r.produtos?.filter((p) => p.status === "bloqueado") ?? [];

    return (
        <Card className="border-emerald-500/20 bg-emerald-500/[0.04]">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
                            <Sparkles className="h-4 w-4 text-emerald-300" />
                        </span>
                        Diagnóstico do Investidor (formulário)
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Respondido pelo cliente em {data}. Use como base da reunião.
                    </p>
                </div>
                <Badge className="w-fit gap-1 border-amber-400/40 bg-amber-400/15 text-amber-200">
                    <Target className="h-3 w-3" /> {r.estagio?.nome ?? registro.estagio} · estágio {r.estagio?.nivel}/5
                </Badge>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Stats principais */}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat icon={<Gauge className="h-3.5 w-3.5" />} label="Saúde patrimonial" value={`${r.saude?.score ?? "-"}/100`} sub={r.saude?.status === "balanceada" ? "Balanceada" : "Desbalanceada"} />
                    <Stat icon={<Target className="h-3.5 w-3.5" />} label="Meta em 10 anos" value={`${r.meta?.cobertura_meta_pct_10a ?? 0}%`} sub={`Meta ${brl(r.meta?.renda_passiva_desejada)}/mês`} />
                    <Stat icon={<Stethoscope className="h-3.5 w-3.5" />} label="Plantões substituídos" value={`${r.plantoes?.substituidos_10a ?? 0}/mês`} sub="renda passiva projetada" />
                    <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="Patrimônio 10 anos" value={brl(r.projecao?.patrimonio_10a_estrategia)} sub={`+${brl(r.projecao?.delta)} vs CDI`} />
                </div>

                {/* Perfil */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Perfil</p>
                    <div className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                        <Linha k="Estado civil" v={label(ESTADO_CIVIL_OPCOES, inp.estado_civil)} />
                        <Linha k="Filhos" v={inp.tem_filhos ? `Sim${inp.idade_filhos ? ` (${inp.idade_filhos})` : ""}` : "Não"} />
                        <Linha k="Especialidade" v={inp.especialidade || "Não informada"} />
                        <Linha k="Regime" v={labels(REGIME_OPCOES, inp.regime).join(", ") || "-"} />
                        <Linha k="Atuação" v={label(ATUACAO_OPCOES, inp.atuacao)} />
                        <Linha k="Momento" v={labels(MOMENTO_OPCOES, inp.momento_carreira).join(", ") || "-"} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {labels(OBJETIVOS, inp.objetivos).map((o) => (
                            <span key={o} className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
                                {o}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Capacidade financeira */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Capacidade financeira</p>
                    <div className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 xl:grid-cols-3">
                        <Linha k="Renda mensal" v={brl(inp.renda_mensal)} />
                        <Linha k="Custo de vida" v={brl(inp.custo_vida)} />
                        <Linha k="Aporte mensal" v={brl(inp.aporte_mensal)} />
                        <Linha k="Capital disponível" v={brl(inp.capital_disponivel)} />
                        <Linha k="Patrimônio atual" v={brl(inp.patrimonio_atual)} />
                        <Linha k="Renda passiva hoje" v={brl(inp.renda_passiva_atual)} />
                        <Linha k="Renda passiva desejada" v={brl(inp.renda_passiva_desejada)} destaque />
                        {inp.plantoes_mes != null ? <Linha k="Plantões por mês" v={String(inp.plantoes_mes)} /> : null}
                        {inp.pct_imoveis_atual != null ? <Linha k="Em imóveis hoje" v={`${inp.pct_imoveis_atual}%`} /> : null}
                    </div>
                </div>

                {/* Produtos */}
                <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Produtos</p>
                    <div className="flex flex-wrap gap-1.5">
                        {aptos.map((p) => (
                            <span key={p.key} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] text-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> {p.nome}
                            </span>
                        ))}
                        {bloqueados.map((p) => (
                            <span key={p.key} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground" title={p.destrave}>
                                <Lock className="h-3 w-3" /> {p.nome}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Plano */}
                {r.plano?.length ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            <ListChecks className="h-3.5 w-3.5" /> Plano de execução sugerido
                        </p>
                        <ol className="space-y-2">
                            {r.plano.map((passo) => (
                                <li key={passo.ordem} className="flex gap-2.5 text-sm">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-300">
                                        {passo.ordem}
                                    </span>
                                    <span>
                                        <span className="font-medium text-foreground">{passo.titulo}. </span>
                                        <span className="text-muted-foreground">{passo.descricao}</span>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                ) : null}

                <p className="text-[11px] text-muted-foreground">
                    Os valores são estimativas geradas pelo formulário. A validação final é feita na reunião.
                </p>
            </CardContent>
        </Card>
    );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                <span className="text-emerald-300">{icon}</span>
                {label}
            </div>
            <p className="mt-1.5 text-lg font-semibold text-foreground">{value}</p>
            {sub ? <p className="text-[11px] text-muted-foreground">{sub}</p> : null}
        </div>
    );
}

function Linha({ k, v, destaque }: { k: string; v: string; destaque?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-white/5 py-0.5 last:border-0 sm:border-0">
            <span className="text-muted-foreground">{k}</span>
            <span className={destaque ? "font-semibold text-emerald-300" : "font-medium text-foreground"}>{v}</span>
        </div>
    );
}
