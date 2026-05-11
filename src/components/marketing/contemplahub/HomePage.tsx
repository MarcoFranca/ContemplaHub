import Link from "next/link";
import {
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    ChartColumnIncreasing,
    CheckCircle2,
    ChevronRight,
    FileSpreadsheet,
    FolderKanban,
    Gauge,
    Layers3,
    Landmark,
    Radar,
    ShieldCheck,
    Sparkles,
    UsersRound,
    WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";

const flowSteps = [
    {
        title: "Lead",
        description: "Captação, origem e contexto da oportunidade em um só lugar.",
    },
    {
        title: "Diagnóstico",
        description: "Readiness score, capacidade financeira e próximos passos orientados.",
    },
    {
        title: "Proposta",
        description: "Simulações, argumentos comerciais e propostas padronizadas.",
    },
    {
        title: "Cota",
        description: "Gestão de grupos, cartas, cotas, administradoras e histórico.",
    },
    {
        title: "Lance",
        description: "Estratégia, acompanhamento de assembleias e recomendação operacional.",
    },
    {
        title: "Contemplação",
        description: "Registro, status e transição comercial sem perder o contexto.",
    },
    {
        title: "Pós-venda",
        description: "Carteira, follow-up e continuidade da operação com governança.",
    },
];

const capabilities = [
    {
        icon: FolderKanban,
        title: "CRM e Kanban comercial",
        description:
            "Funil orientado ao processo de consórcio, com etapas comerciais, ações rápidas e contexto do lead.",
    },
    {
        icon: Gauge,
        title: "Diagnóstico financeiro",
        description:
            "Coleta estruturada de informações, score de prontidão e leitura inicial da capacidade do cliente.",
    },
    {
        icon: Sparkles,
        title: "Diagnóstico assistido e apoio à decisão",
        description:
            "Estruture leitura inicial, próximos passos e priorização sem depender apenas de memória ou improviso.",
    },
    {
        icon: FileSpreadsheet,
        title: "Propostas e contratos",
        description:
            "Padronize proposta, contrato e transição entre venda, formalização e operação.",
    },
    {
        icon: Landmark,
        title: "Cotas, grupos e assembleias",
        description:
            "Acompanhe cartas, grupos, assembleias, contemplações e situação operacional das cotas.",
    },
    {
        icon: Layers3,
        title: "Rotinas e integrações operacionais",
        description:
            "Organize tarefas, eventos e integrações administrativas sem espalhar processo em ferramentas desconectadas.",
    },
    {
        icon: ChartColumnIncreasing,
        title: "Dashboards e KPIs",
        description:
            "Visualize conversão, tempo de resposta, produtividade e gargalos da operação comercial.",
    },
    {
        icon: Building2,
        title: "Multiempresa / multi-tenant",
        description:
            "Organizações isoladas, usuários por papel e operação separada por contexto de negócio.",
    },
];

const intelligenceItems = [
    "Resumo do lead com contexto comercial e origem",
    "Próximos passos sugeridos para atendimento consultivo",
    "Score de prontidão para priorização de atendimento",
    "Leitura inicial de capacidade financeira e aderência",
    "Apoio à organização de assembleias e acompanhamento de lance",
    "Estrutura para follow-up responsável e padronizado",
];

const securityItems = [
    {
        title: "Isolamento por organização",
        description:
            "Cada entidade operacional roda vinculada à organização correta, com separação clara de dados e contexto.",
    },
    {
        title: "Papéis e governança",
        description:
            "Perfis como admin/gestor, vendedor e viewer ajudam a controlar acesso sem travar a operação.",
    },
    {
        title: "Auditoria e trilhas operacionais",
        description:
            "Eventos, mudanças relevantes e integrações ficam rastreáveis para suporte, gestão e compliance.",
    },
    {
        title: "Frontend sem credenciais sensíveis",
        description:
            "O app público não expõe service role nem lógica sensível de backend ao navegador.",
    },
];

const dashboardMetrics = [
    { label: "Conversão por etapa", value: "31%", detail: "Do diagnóstico ao contrato" },
    { label: "Tempo até 1º contato", value: "18 min", detail: "Média operacional" },
    { label: "Leads por origem", value: "12 canais", detail: "Meta Ads, LP, parceiros, orgânico" },
    { label: "Propostas geradas", value: "248", detail: "Nos últimos 30 dias" },
    { label: "Diagnóstico concluído", value: "76%", detail: "Qualificação inicial finalizada" },
    { label: "Lances acompanhados", value: "93", detail: "Em monitoramento operacional" },
    { label: "Contemplações registradas", value: "27", detail: "Com rastreabilidade histórica" },
];

const audienceCards = [
    {
        title: "Consultorias de consórcio",
        description:
            "Padronize processo comercial, atendimento consultivo e gestão de carteira em uma operação única.",
    },
    {
        title: "Corretoras especializadas",
        description:
            "Conecte marketing, vendas, contratos, cotas e pós-venda sem depender de planilhas soltas.",
    },
    {
        title: "Times comerciais",
        description:
            "Dê contexto operacional ao vendedor, reduza improviso e acompanhe execução com clareza.",
    },
    {
        title: "Gestores de carteira",
        description:
            "Acompanhe assembleias, contemplações, relacionamento e reentrada comercial com governança.",
    },
    {
        title: "Operações com múltiplos vendedores",
        description:
            "Distribua acesso por papel, organização e responsável sem perder visibilidade central.",
    },
];

function sectionTitle(eyebrow: string, title: string, description: string) {
    return (
        <div className="mx-auto max-w-3xl text-center">
            <Badge className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] tracking-[0.24em] text-cyan-100 uppercase">
                {eyebrow}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                {description}
            </p>
        </div>
    );
}

function dashboardPreviewCard({
    itemKey,
    title,
    value,
    helper,
    accent,
}: {
    itemKey: string;
    title: string;
    value: string;
    helper: string;
    accent: string;
}) {
    return (
        <div
            key={itemKey}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">{title}</p>
                <span className={cn("h-2.5 w-2.5 rounded-full", accent)} />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-xs text-slate-400">{helper}</p>
        </div>
    );
}

function dashboardMock() {
    return (
        <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 rounded-[40px] bg-[radial-gradient(circle_at_top,rgba(39,224,165,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_34%)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0F1B2E]/88 p-5 shadow-[0_32px_120px_rgba(2,6,23,0.58)] backdrop-blur">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs tracking-[0.22em] text-[#27E0A5] uppercase">
                            Operação comercial
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">
                            CRM, diagnóstico e acompanhamento operacional
                        </h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                            Visual do produto com foco em contexto comercial, qualificação
                            consultiva e organização da operação de consórcio.
                        </p>
                    </div>
                    <Badge className="w-fit rounded-full border border-[#27E0A5]/20 bg-[#00C389]/10 text-[#E2E8F0]">
                        Estrutura multi-tenant
                    </Badge>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
                    <div className="rounded-3xl border border-white/10 bg-[#0B1220]/70 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-100">Kanban comercial</p>
                                <p className="text-xs text-slate-400">
                                    Novo, Diagnóstico e Proposta em uma visão operacional limpa
                                </p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                84 leads ativos
                            </span>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            {[
                                {
                                    column: "Novo",
                                    name: "Felipe Moura",
                                    meta: "Instagram · Meta Ads",
                                    detail: "Score 78",
                                },
                                {
                                    column: "Diagnóstico",
                                    name: "Ana Beatriz",
                                    meta: "Campanha Imóveis",
                                    detail: "R$ 2k – R$ 5k/mês",
                                },
                                {
                                    column: "Proposta",
                                    name: "João Victor",
                                    meta: "Meta Ads",
                                    detail: "2 propostas em andamento",
                                },
                            ].map((card) => (
                                <div
                                    key={card.column}
                                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                                >
                                    <p className="text-xs font-medium text-slate-400">{card.column}</p>
                                    <div className="mt-3 rounded-2xl border border-white/10 bg-[#0F1B2E]/85 p-4">
                                        <p className="truncate text-base font-semibold text-white">
                                            {card.name}
                                        </p>
                                        <p className="mt-2 truncate text-xs text-slate-300">
                                            {card.meta}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-[#27E0A5]">
                                            {card.detail}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="rounded-3xl border border-white/10 bg-[#0B1220]/70 p-4">
                            <div className="flex items-center gap-2 text-slate-100">
                                <Sparkles className="h-4 w-4 text-[#27E0A5]" />
                                <p className="text-sm font-medium">Apoio ao atendimento</p>
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                                    <p className="text-xs text-slate-400">Readiness score</p>
                                    <p className="mt-1 text-lg font-semibold text-white">82 / 100</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                                    <p className="text-xs text-slate-400">Próxima ação sugerida</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-200">
                                        Revisar carta alvo e confirmar cenário financeiro antes da
                                        próxima proposta.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                {
                                    title: "Próximas assembleias",
                                    value: "6",
                                    helper: "Monitoradas no ciclo atual",
                                    accent: "bg-[#27E0A5]",
                                },
                                {
                                    title: "Lances em revisão",
                                    value: "14",
                                    helper: "Em acompanhamento operacional",
                                    accent: "bg-sky-300",
                                },
                                {
                                    title: "Diagnósticos ativos",
                                    value: "23",
                                    helper: "Com score e contexto comercial",
                                    accent: "bg-emerald-300",
                                },
                                {
                                    title: "Carteira ativa",
                                    value: "128",
                                    helper: "Clientes em pós-venda",
                                    accent: "bg-indigo-300",
                                },
                            ].map((metric) =>
                                dashboardPreviewCard({
                                    itemKey: metric.title,
                                    ...metric,
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ContemplaHubHomePage() {
    return (
        <main className={cn("min-h-screen bg-[linear-gradient(180deg,#0B1220_0%,#0F1B2E_26%,#111827_58%,#0B1220_100%)] text-white")}>
            <PublicHeader />

            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(39,224,165,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_26%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.35),transparent_60%)]" />
                <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
                    <div className="grid gap-14">
                        <div className="max-w-3xl">
                            <Badge className="rounded-full border border-[#27E0A5]/20 bg-[#00C389]/10 px-4 py-1 text-[11px] tracking-[0.24em] text-[#E2E8F0] uppercase">
                                CRM + operação + inteligência comercial
                            </Badge>
                            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                O sistema operacional para operações de consórcio modernas.
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                                Centralize leads, diagnósticos, propostas, cotas, assembleias,
                                lances e contemplações em uma plataforma criada para consultorias
                                e corretoras que querem vender com método, escala e previsibilidade.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full bg-[#00C389] px-6 text-[#0B1220] hover:bg-[#27E0A5]"
                                >
                                    <Link href="#demo">
                                        Solicitar demonstração
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"
                                >
                                    <Link href="#funcionalidades">Ver funcionalidades</Link>
                                </Button>
                            </div>

                            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                {[
                                    {
                                        label: "Times multiempresa",
                                        value: "Multi-tenant",
                                    },
                                    {
                                        label: "Operação comercial",
                                        value: "CRM + Kanban",
                                    },
                                    {
                                        label: "Governança",
                                        value: "RLS e papéis",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                                    >
                                        <p className="text-sm font-semibold text-white">{item.value}</p>
                                        <p className="mt-1 text-xs text-slate-400">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="xl:pt-2">{dashboardMock()}</div>
                    </div>
                </div>
            </section>

            <section id="produto" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                {sectionTitle(
                    "Da captação à contemplação",
                    "Tudo que sua operação de consórcio precisa para vender, acompanhar e escalar — em um só lugar.",
                    "O ContemplaHub conecta funil comercial, execução operacional e inteligência de acompanhamento sem fragmentar dados entre ferramentas desconectadas."
                )}

                <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {flowSteps.map((step, index) => (
                        <Card
                            key={step.title}
                            className="border-white/10 bg-white/[0.04] py-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
                        >
                            <CardHeader className="gap-3 px-5 py-5">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-semibold text-cyan-100">
                                        {index + 1}
                                    </span>
                                    <CardTitle className="text-lg text-white">{step.title}</CardTitle>
                                </div>
                                <CardDescription className="text-sm leading-6 text-slate-300">
                                    {step.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </section>

            <section id="funcionalidades" className="border-y border-white/10 bg-slate-950/50">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    {sectionTitle(
                        "Funcionalidades principais",
                        "Uma plataforma desenhada para o processo real de consórcio.",
                        "Não é só um CRM. É uma base operacional para conduzir a jornada comercial, formalizar contratos e acompanhar a operação das cotas."
                    )}

                    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {capabilities.map((item) => (
                            <Card
                                key={item.title}
                                className="h-full border-white/10 bg-white/[0.04] py-0"
                            >
                                <CardHeader className="px-5 py-5">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                        <item.icon className="h-5 w-5 text-cyan-100" />
                                    </div>
                                    <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                                    <CardDescription className="text-sm leading-6 text-slate-300">
                                        {item.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section id="ia" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid gap-12 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
                    <div>
                        <Badge className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-1 text-[11px] tracking-[0.24em] text-indigo-100 uppercase">
                            Inteligência para vender melhor
                        </Badge>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            IA aplicada ao contexto comercial e operacional.
                        </h2>
                        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                            Use inteligência para priorizar atendimento, organizar próximos
                            passos e apoiar decisões com responsabilidade. O foco é dar clareza
                            operacional ao time, sem prometer contemplação garantida ou substituir
                            regras das administradoras.
                        </p>

                        <div className="mt-8 grid gap-3">
                            {intelligenceItems.map((item) => (
                                <div
                                    key={item}
                                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                                    <p className="text-sm leading-6 text-slate-200">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <Card className="border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] py-0">
                            <CardHeader className="px-6 py-6">
                                <div className="flex items-center gap-2 text-cyan-100">
                                    <Radar className="h-4 w-4" />
                                    <p className="text-sm font-medium">Lead intelligence</p>
                                </div>
                                <CardTitle className="text-2xl text-white">
                                    Resumo do lead com recomendação orientada por contexto
                                </CardTitle>
                            <CardDescription className="text-sm leading-6 text-slate-300">
                                Origem, criativo, score de prontidão, capacidade inicial e
                                próximos passos reunidos em uma visão operacional única.
                            </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 px-6 pb-6">
                                {[
                                    ["Probabilidade de avanço", "74%"],
                                    ["Estratégia de lance sugerida", "Parcial com assembleia em 9 dias"],
                                    ["Próxima ação", "Revisar carta alvo e retorno até 17h"],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                                    >
                                        <p className="text-xs text-slate-400">{label}</p>
                                    <p className="mt-1 text-sm font-medium text-white">{value}</p>
                                </div>
                            ))}
                        </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section id="seguranca" className="border-y border-white/10 bg-slate-950/50">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    {sectionTitle(
                        "Operação com segurança",
                        "Governança e isolamento pensados para times e organizações reais.",
                        "O ContemplaHub foi desenhado para operar com separação por organização, controle por papel e governança de dados sem transferir risco para o frontend."
                    )}

                    <div className="mt-12 grid gap-5 md:grid-cols-2">
                        {securityItems.map((item) => (
                            <Card
                                key={item.title}
                                className="border-white/10 bg-white/[0.04] py-0"
                            >
                                <CardHeader className="px-5 py-5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                            <ShieldCheck className="h-5 w-5 text-cyan-100" />
                                        </span>
                                        <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm leading-6 text-slate-300">
                                        {item.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section id="operacao" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                {sectionTitle(
                    "Dashboards operacionais",
                    "Indicadores para quem precisa decidir e acompanhar execução.",
                    "Acompanhe performance comercial, qualidade de atendimento, produtividade e volume operacional sem montar uma operação paralela em planilhas."
                )}

                <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {dashboardMetrics.map((metric) => (
                        <Card
                            key={metric.label}
                            className="border-white/10 bg-white/[0.04] py-0"
                        >
                            <CardHeader className="px-5 py-5">
                                <CardDescription className="text-xs tracking-[0.18em] text-slate-400 uppercase">
                                    {metric.label}
                                </CardDescription>
                                <CardTitle className="text-3xl text-white">{metric.value}</CardTitle>
                                <p className="text-sm text-slate-300">{metric.detail}</p>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="border-y border-white/10 bg-slate-950/50">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    {sectionTitle(
                        "Para quem é",
                        "Construído para operações de consórcio que precisam de método e escala.",
                        "A plataforma atende times que precisam organizar venda, execução e acompanhamento com inteligência comercial e visão operacional."
                    )}

                    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                        {audienceCards.map((item, index) => {
                            const icons = [
                                BriefcaseBusiness,
                                Building2,
                                UsersRound,
                                WalletCards,
                                Sparkles,
                            ];
                            const Icon = icons[index] ?? ChevronRight;

                            return (
                                <Card
                                    key={item.title}
                                    className="border-white/10 bg-white/[0.04] py-0"
                                >
                                    <CardHeader className="px-5 py-5">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                            <Icon className="h-5 w-5 text-cyan-100" />
                                        </div>
                                        <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                                        <CardDescription className="text-sm leading-6 text-slate-300">
                                            {item.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="demo" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-400/12 via-slate-900/85 to-indigo-500/10 px-6 py-10 shadow-[0_30px_100px_rgba(6,182,212,0.08)] sm:px-8 lg:px-12">
                    <div className="max-w-3xl">
                        <Badge className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] tracking-[0.24em] text-cyan-100 uppercase">
                            Solicitar demonstração
                        </Badge>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Pronto para profissionalizar sua operação de consórcio?
                        </h2>
                        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                            Organize seu time, padronize o atendimento e acompanhe cada
                            oportunidade com inteligência operacional.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full bg-[#00C389] px-6 text-[#0B1220] hover:bg-[#27E0A5]"
                            >
                                <Link href="mailto:comercial@contemplahub.com?subject=Solicitar%20demonstra%C3%A7%C3%A3o%20-%20ContemplaHub">
                                    Solicitar demonstração
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"
                            >
                                <Link href="/login">Entrar na plataforma</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </main>
    );
}
