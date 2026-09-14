"use client";

import * as React from "react";
import {
    OBJETIVOS,
    REGIME_OPCOES,
    ATUACAO_OPCOES,
    MOMENTO_OPCOES,
    ESTADO_CIVIL_OPCOES,
    type ObjetivoId,
    type RegimeId,
    type AtuacaoId,
    type MomentoId,
    type EstadoCivil,
    type DiagnosticoResultado,
} from "@/features/diagnostico/types";
import { DiagnosticoResult } from "./DiagnosticoResult";

const ACCENT = "#c6f24e";
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const TOTAL_STEPS = 4;

const brl = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);

const maskPhone = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

type Props = { slug: string; orgNome: string; orgWhatsapp: string | null; accent?: string | null };

type Estado = {
    nome: string;
    whatsapp: string;
    estado: string;
    especialidade: string;
    estado_civil: EstadoCivil | "";
    tem_filhos: boolean | null;
    idade_filhos: string;
    regime: RegimeId[];
    atuacao: AtuacaoId | "";
    momento_carreira: MomentoId[];
    objetivos: ObjetivoId[];
    possui_imovel_quitado: boolean | null;
    possui_cnpj: boolean | null;
    possui_holding: boolean | null;
    renda_mensal: number;
    custo_vida: number;
    aporte_mensal: number;
    capital_disponivel: number;
    patrimonio_atual: number;
    renda_passiva_atual: number;
    renda_passiva_desejada: number;
    plantoes_mes: number;
    pct_imoveis_atual: number;
    consentimento: boolean;
};

const INICIAL: Estado = {
    nome: "",
    whatsapp: "",
    estado: "",
    especialidade: "",
    estado_civil: "",
    tem_filhos: null,
    idade_filhos: "",
    regime: [],
    atuacao: "",
    momento_carreira: [],
    objetivos: [],
    possui_imovel_quitado: null,
    possui_cnpj: null,
    possui_holding: null,
    renda_mensal: 25000,
    custo_vida: 12000,
    aporte_mensal: 4000,
    capital_disponivel: 50000,
    patrimonio_atual: 300000,
    renda_passiva_atual: 0,
    renda_passiva_desejada: 20000,
    plantoes_mes: 4,
    pct_imoveis_atual: 60,
    consentimento: true,
};

export function DiagnosticoFunnel({ slug, orgNome, orgWhatsapp, accent }: Props) {
    const cor = accent || ACCENT;
    const [step, setStep] = React.useState<1 | 2 | 3 | 4 | "analyzing" | "result">(1);
    const [f, setF] = React.useState<Estado>(INICIAL);
    const [erro, setErro] = React.useState<string | null>(null);
    const [resultado, setResultado] = React.useState<DiagnosticoResultado | null>(null);
    const [waFinal, setWaFinal] = React.useState<string | null>(orgWhatsapp);

    const set = <K extends keyof Estado>(k: K, v: Estado[K]) => setF((p) => ({ ...p, [k]: v }));

    function toggleLimited<T>(arr: T[], id: T, limit: number): T[] {
        if (arr.includes(id)) return arr.filter((x) => x !== id);
        if (arr.length >= limit) return arr;
        return [...arr, id];
    }

    const validar = (s: 1 | 2 | 3 | 4): string | null => {
        if (s === 1) {
            if (f.nome.trim().length < 2) return "Informe seu nome.";
            if (f.whatsapp.replace(/\D/g, "").length < 10) return "Informe um WhatsApp válido.";
            if (!f.estado) return "Selecione seu estado.";
            if (!f.estado_civil) return "Selecione seu estado civil.";
            if (f.tem_filhos === null) return "Informe se tem filhos.";
        }
        if (s === 2) {
            if (f.regime.length === 0) return "Selecione ao menos um regime de trabalho.";
            if (!f.atuacao) return "Selecione sua atuação principal.";
            if (f.momento_carreira.length === 0) return "Selecione seu momento de carreira.";
            if (f.objetivos.length === 0) return "Escolha pelo menos um objetivo.";
        }
        if (s === 3) {
            if (f.possui_imovel_quitado === null) return "Responda sobre imóvel quitado.";
            if (f.possui_cnpj === null) return "Responda sobre CNPJ / PJ.";
            if (f.possui_holding === null) return "Responda sobre holding / proteção.";
        }
        return null;
    };

    const avancar = () => {
        if (step !== 1 && step !== 2 && step !== 3 && step !== 4) return;
        const e = validar(step);
        if (e) {
            setErro(e);
            return;
        }
        setErro(null);
        if (step === 1) setStep(2);
        else if (step === 2) setStep(3);
        else if (step === 3) setStep(4);
        else void enviar();
    };

    const voltar = () => {
        if (step === 2) setStep(1);
        else if (step === 3) setStep(2);
        else if (step === 4) setStep(3);
    };

    const enviar = async () => {
        setStep("analyzing");
        setErro(null);
        try {
            const res = await fetch("/api/diagnostico/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    nome: f.nome,
                    whatsapp: f.whatsapp.replace(/\D/g, ""),
                    estado: f.estado,
                    especialidade: f.especialidade,
                    estado_civil: f.estado_civil,
                    tem_filhos: f.tem_filhos,
                    idade_filhos: f.idade_filhos,
                    regime: f.regime,
                    atuacao: f.atuacao,
                    momento_carreira: f.momento_carreira,
                    objetivos: f.objetivos,
                    possui_imovel_quitado: f.possui_imovel_quitado,
                    possui_cnpj: f.possui_cnpj,
                    possui_holding: f.possui_holding,
                    renda_mensal: f.renda_mensal,
                    custo_vida: f.custo_vida,
                    aporte_mensal: f.aporte_mensal,
                    capital_disponivel: f.capital_disponivel,
                    patrimonio_atual: f.patrimonio_atual,
                    renda_passiva_atual: f.renda_passiva_atual,
                    renda_passiva_desejada: f.renda_passiva_desejada,
                    plantoes_mes: f.plantoes_mes,
                    pct_imoveis_atual: f.pct_imoveis_atual,
                    consentimento: f.consentimento,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data?.resultado) throw new Error(data?.error || "Falha ao gerar diagnóstico.");
            await new Promise((r) => setTimeout(r, 2200));
            setResultado(data.resultado as DiagnosticoResultado);
            setWaFinal(data?.org?.whatsapp_phone ?? orgWhatsapp);
            setStep("result");
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro inesperado.");
            setStep(4);
        }
    };

    if (step === "result") {
        return resultado ? (
            <DiagnosticoResult
                resultado={resultado}
                nome={f.nome}
                orgNome={orgNome}
                orgWhatsapp={waFinal}
                accent={cor}
                onRecomecar={() => {
                    setResultado(null);
                    setF(INICIAL);
                    setStep(1);
                }}
            />
        ) : null;
    }

    if (step === "analyzing") {
        return (
            <Shell accent={cor}>
                <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
                    <div
                        className="h-28 w-28 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 35% 30%, ${cor}, #7bbf1f)`,
                            boxShadow: `0 0 60px ${cor}88`,
                            animation: "pulse 1.4s ease-in-out infinite",
                        }}
                    />
                    <p className="mt-8 text-sm font-semibold uppercase tracking-widest" style={{ color: "#5c8a12" }}>
                        Analisando seu perfil
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-neutral-900">
                        Cruzando seu perfil com milhares de cenários
                    </h2>
                    <p className="mt-3 text-neutral-500">Isso leva alguns segundos.</p>
                </div>
                <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.08);opacity:1}}`}</style>
            </Shell>
        );
    }

    const progresso = step / TOTAL_STEPS;

    return (
        <Shell accent={cor}>
            <div className="mb-6 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full rounded-full transition-all" style={{ width: `${progresso * 100}%`, background: cor }} />
                </div>
                <span className="text-xs font-semibold text-neutral-400">{step}/{TOTAL_STEPS}</span>
            </div>

            {step === 1 && (
                <div className="space-y-5">
                    <Header etapa="Etapa 1 · Quem é você" titulo="Vamos começar pelo básico." sub="Só pra te chamar pelo nome." accent={cor} />
                    <Campo label="Seu nome">
                        <input className={inputCls} placeholder="Como você se chama?" value={f.nome} onChange={(e) => set("nome", e.target.value)} />
                    </Campo>
                    <Campo label="WhatsApp">
                        <input className={inputCls} inputMode="numeric" placeholder="(11) 99999-9999" value={f.whatsapp} onChange={(e) => set("whatsapp", maskPhone(e.target.value))} />
                    </Campo>
                    <div className="grid grid-cols-2 gap-3">
                        <Campo label="Estado">
                            <select className={inputCls} value={f.estado} onChange={(e) => set("estado", e.target.value)}>
                                <option value="">Selecione</option>
                                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </Campo>
                        <Campo label="Especialidade">
                            <input className={inputCls} placeholder="Opcional" value={f.especialidade} onChange={(e) => set("especialidade", e.target.value)} />
                        </Campo>
                    </div>
                    <Campo label="Estado civil">
                        <div className="grid grid-cols-2 gap-2">
                            {ESTADO_CIVIL_OPCOES.map((o) => (
                                <OptionCard key={o.id} active={f.estado_civil === o.id} onClick={() => set("estado_civil", o.id)} accent={cor}>
                                    {o.label}
                                </OptionCard>
                            ))}
                        </div>
                    </Campo>
                    <div className="grid grid-cols-2 gap-3">
                        <ToggleCard label="Tem filhos?" value={f.tem_filhos} onChange={(v) => set("tem_filhos", v)} accent={cor} />
                        {f.tem_filhos ? (
                            <Campo label="Idade dos filhos">
                                <input className={inputCls} placeholder="ex.: 8 e 12" value={f.idade_filhos} onChange={(e) => set("idade_filhos", e.target.value)} />
                            </Campo>
                        ) : <div />}
                    </div>
                    <p className="text-xs text-neutral-400">Ao continuar, você concorda em receber o resultado por WhatsApp.</p>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <Header etapa="Etapa 2 · Seu momento na carreira" titulo="Onde você está agora?" accent={cor} />
                    <Campo label="Regime de trabalho (marque quantas se aplicam)">
                        <div className="grid gap-2">
                            {REGIME_OPCOES.map((o) => (
                                <OptionCard key={o.id} active={f.regime.includes(o.id)} onClick={() => set("regime", toggleLimited(f.regime, o.id, 3))} accent={cor}>
                                    {o.label}
                                </OptionCard>
                            ))}
                        </div>
                    </Campo>
                    <Campo label="Principal atuação no momento">
                        <div className="grid gap-2">
                            {ATUACAO_OPCOES.map((o) => (
                                <OptionCard key={o.id} active={f.atuacao === o.id} onClick={() => set("atuacao", o.id)} accent={cor}>
                                    {o.label}
                                </OptionCard>
                            ))}
                        </div>
                    </Campo>
                    <Campo label="Momento de carreira (escolha ate 3)">
                        <div className="grid gap-2">
                            {MOMENTO_OPCOES.map((o) => (
                                <OptionCard key={o.id} active={f.momento_carreira.includes(o.id)} onClick={() => set("momento_carreira", toggleLimited(f.momento_carreira, o.id, 3))} accent={cor}>
                                    {o.label}
                                </OptionCard>
                            ))}
                        </div>
                    </Campo>
                    <Campo label="Seus objetivos (escolha ate 3)">
                        <div className="grid gap-2">
                            {OBJETIVOS.map((o) => (
                                <OptionCard key={o.id} active={f.objetivos.includes(o.id)} onClick={() => set("objetivos", toggleLimited(f.objetivos, o.id, 3))} accent={cor}>
                                    {o.label}
                                </OptionCard>
                            ))}
                        </div>
                    </Campo>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-5">
                    <Header etapa="Etapa 3 · Sua situação patrimonial" titulo="Alguns pontos importantes." accent={cor} />
                    <ToggleCard label="Você já tem imóvel quitado?" value={f.possui_imovel_quitado} onChange={(v) => set("possui_imovel_quitado", v)} accent={cor} full />
                    <ToggleCard label="Você tem CNPJ / PJ ativo?" value={f.possui_cnpj} onChange={(v) => set("possui_cnpj", v)} accent={cor} full />
                    <ToggleCard label="Você já tem holding ou estrutura de proteção?" value={f.possui_holding} onChange={(v) => set("possui_holding", v)} accent={cor} full />
                </div>
            )}

            {step === 4 && (
                <div className="space-y-5">
                    <Header etapa="Etapa 4 · Sua capacidade financeira" titulo="Arraste pra ajustar com precisão." accent={cor} />
                    <CurrencyField label="Renda mensal (plantões + consultas + PJ)" value={f.renda_mensal} min={0} max={200000} step={1000} onChange={(v) => set("renda_mensal", v)} accent={cor} />
                    <CurrencyField label="Quanto custa seu padrão de vida por mês?" value={f.custo_vida} min={0} max={80000} step={500} onChange={(v) => set("custo_vida", v)} accent={cor} />
                    <CurrencyField label="Quanto consegue investir todo mês?" value={f.aporte_mensal} min={0} max={80000} step={500} onChange={(v) => set("aporte_mensal", v)} accent={cor} />
                    <CurrencyField label="Capital disponível pra investir agora" value={f.capital_disponivel} min={0} max={3000000} step={5000} onChange={(v) => set("capital_disponivel", v)} accent={cor} />
                    <CurrencyField label="Patrimônio atual aproximado" value={f.patrimonio_atual} min={0} max={20000000} step={10000} onChange={(v) => set("patrimonio_atual", v)} accent={cor} />
                    <CurrencyField label="Renda passiva que você já tem hoje" value={f.renda_passiva_atual} min={0} max={100000} step={500} onChange={(v) => set("renda_passiva_atual", v)} accent={cor} />
                    <CurrencyField label="Renda passiva mensal que deseja" value={f.renda_passiva_desejada} min={1000} max={200000} step={1000} onChange={(v) => set("renda_passiva_desejada", v)} accent={cor} sub="Sua meta de liberdade." />
                    <Campo label={`Quantos plantões você faz por mês? (${f.plantoes_mes})`}>
                        <Slider min={0} max={30} step={1} value={f.plantoes_mes} onChange={(v) => set("plantoes_mes", v)} accent={cor} />
                    </Campo>
                    <Campo label={`Quanto do patrimônio está em imóveis hoje? (${f.pct_imoveis_atual}%)`}>
                        <Slider min={0} max={100} step={5} value={f.pct_imoveis_atual} onChange={(v) => set("pct_imoveis_atual", v)} accent={cor} />
                    </Campo>
                </div>
            )}

            {erro && <p className="mt-4 text-sm font-medium text-red-600">{erro}</p>}
            <input type="text" name="company" autoComplete="off" tabIndex={-1} className="hidden" aria-hidden />

            <div className="sticky bottom-0 mt-8 -mx-5 border-t border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur">
                <div className="flex gap-3">
                    {step > 1 && (
                        <button type="button" onClick={voltar} className="rounded-full border border-neutral-200 px-5 py-4 text-sm font-semibold text-neutral-600">
                            Voltar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={avancar}
                        className="flex-1 rounded-full py-4 text-center text-base font-bold text-neutral-900 transition active:scale-[0.99]"
                        style={{ background: cor }}
                    >
                        {step === TOTAL_STEPS ? "Gerar meu diagnóstico" : "Continuar"}
                    </button>
                </div>
            </div>
        </Shell>
    );
}

// ── UI helpers ──────────────────────────────────────────────────────────────
const inputCls =
    "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-900 outline-none focus:border-neutral-400";

function Shell({ children, accent }: { children: React.ReactNode; accent: string }) {
    return (
        <main style={{ background: "#f4f5f7", color: "#0f172a" }} className="min-h-screen">
            <div className="mx-auto min-h-screen w-full max-w-md bg-white px-5 pt-6 shadow-sm">
                <div className="mb-4 h-1 w-12 rounded-full" style={{ background: accent }} />
                {children}
            </div>
        </main>
    );
}

function Header({ etapa, titulo, sub, accent }: { etapa: string; titulo: string; sub?: string; accent: string }) {
    const partes = etapa.split("·");
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5c8a12" }}>
                {partes[0]}
                {partes.length > 1 && <span className="text-neutral-400"> · {partes.slice(1).join("·").trim()}</span>}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-neutral-900">{titulo}</h1>
            {sub && <p className="mt-2 text-neutral-500">{sub}</p>}
            <div className="mt-3 h-0.5 w-8 rounded" style={{ background: accent }} />
        </div>
    );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</label>
            {children}
        </div>
    );
}

function OptionCard({ active, onClick, children, accent }: { active: boolean; onClick: () => void; children: React.ReactNode; accent: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full rounded-2xl border-2 bg-white px-4 py-4 text-left text-base font-medium text-neutral-800 transition"
            style={{ borderColor: active ? accent : "#e5e7eb", boxShadow: active ? `0 0 0 3px ${accent}44` : "none" }}
        >
            {children}
        </button>
    );
}

function ToggleCard({ label, value, onChange, accent, full }: { label: string; value: boolean | null; onChange: (v: boolean) => void; accent: string; full?: boolean }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className={`mb-2 font-semibold text-neutral-700 ${full ? "text-sm" : "text-sm"}`}>{label}</p>
            <div className="flex gap-2">
                {[{ v: true, l: "Sim" }, { v: false, l: "Não" }].map((o) => (
                    <button
                        key={o.l}
                        type="button"
                        onClick={() => onChange(o.v)}
                        className="flex-1 rounded-xl py-2 text-sm font-semibold transition"
                        style={{ background: value === o.v ? accent : "#f3f4f6", color: value === o.v ? "#111" : "#6b7280" }}
                    >
                        {o.l}
                    </button>
                ))}
            </div>
        </div>
    );
}

function Slider({ min, max, step, value, onChange, accent }: { min: number; max: number; step: number; value: number; onChange: (v: number) => void; accent: string }) {
    return (
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" style={{ accentColor: accent }} />
    );
}

function CurrencyField({ label, value, min, max, step, onChange, accent, sub }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; accent: string; sub?: string }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</label>
            <div className="mb-3 mt-1 text-2xl font-extrabold text-neutral-900">{brl(value)}</div>
            <Slider min={min} max={max} step={step} value={value} onChange={onChange} accent={accent} />
            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>{brl(min)}</span>
                <span>{brl(max)}</span>
            </div>
            {sub && <p className="mt-2 text-xs text-neutral-400">{sub}</p>}
        </div>
    );
}
