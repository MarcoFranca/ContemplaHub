"use client";

import * as React from "react";
import { OBJETIVOS, type ObjetivoId, type Profissao, type DiagnosticoResultado } from "@/features/diagnostico/types";
import { DiagnosticoResult } from "./DiagnosticoResult";

const ACCENT = "#c6f24e"; // verde-limão de conversão
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const PROFISSOES: { id: Profissao; label: string }[] = [
    { id: "clt", label: "CLT" },
    { id: "servidor", label: "Servidor público" },
    { id: "empresario", label: "Empresário(a)" },
    { id: "liberal", label: "Liberal / Autônomo" },
    { id: "outro", label: "Outro" },
];

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
    idade: number;
    profissao: Profissao | "";
    objetivos: ObjetivoId[];
    possui_imovel_quitado: boolean;
    possui_terreno: boolean;
    renda_mensal: number;
    aporte_mensal: number;
    custo_vida: number;
    capital_disponivel: number;
    patrimonio_atual: number;
    renda_passiva_atual: number;
    pct_imoveis_atual: number;
    consentimento: boolean;
};

const INICIAL: Estado = {
    nome: "",
    whatsapp: "",
    estado: "",
    idade: 35,
    profissao: "",
    objetivos: [],
    possui_imovel_quitado: false,
    possui_terreno: false,
    renda_mensal: 8000,
    aporte_mensal: 1500,
    custo_vida: 6000,
    capital_disponivel: 20000,
    patrimonio_atual: 100000,
    renda_passiva_atual: 0,
    pct_imoveis_atual: 60,
    consentimento: true,
};

export function DiagnosticoFunnel({ slug, orgNome, orgWhatsapp, accent }: Props) {
    const cor = accent || ACCENT;
    const [step, setStep] = React.useState<1 | 2 | 3 | "analyzing" | "result">(1);
    const [f, setF] = React.useState<Estado>(INICIAL);
    const [erro, setErro] = React.useState<string | null>(null);
    const [resultado, setResultado] = React.useState<DiagnosticoResultado | null>(null);
    const [waFinal, setWaFinal] = React.useState<string | null>(orgWhatsapp);

    const set = <K extends keyof Estado>(k: K, v: Estado[K]) => setF((p) => ({ ...p, [k]: v }));

    const toggleObjetivo = (id: ObjetivoId) => {
        setF((p) => {
            const has = p.objetivos.includes(id);
            if (has) return { ...p, objetivos: p.objetivos.filter((x) => x !== id) };
            if (p.objetivos.length >= 3) return p;
            return { ...p, objetivos: [...p.objetivos, id] };
        });
    };

    const validarStep = (s: 1 | 2 | 3): string | null => {
        if (s === 1) {
            if (f.nome.trim().length < 2) return "Informe seu nome.";
            if (f.whatsapp.replace(/\D/g, "").length < 10) return "Informe um WhatsApp válido.";
            if (!f.estado) return "Selecione seu estado.";
        }
        if (s === 2) {
            if (!f.profissao) return "Selecione sua profissão.";
            if (f.objetivos.length === 0) return "Escolha pelo menos um objetivo.";
        }
        return null;
    };

    const avancar = () => {
        if (step !== 1 && step !== 2 && step !== 3) return;
        const e = validarStep(step);
        if (e) {
            setErro(e);
            return;
        }
        setErro(null);
        if (step === 1) setStep(2);
        else if (step === 2) setStep(3);
        else void enviar();
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
                    idade: f.idade,
                    profissao: f.profissao,
                    objetivos: f.objetivos,
                    possui_imovel_quitado: f.possui_imovel_quitado,
                    possui_terreno: f.possui_terreno,
                    renda_mensal: f.renda_mensal,
                    aporte_mensal: f.aporte_mensal,
                    custo_vida: f.custo_vida,
                    capital_disponivel: f.capital_disponivel,
                    patrimonio_atual: f.patrimonio_atual,
                    renda_passiva_atual: f.renda_passiva_atual,
                    pct_imoveis_atual: f.pct_imoveis_atual,
                    consentimento: f.consentimento,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data?.resultado) throw new Error(data?.error || "Falha ao gerar diagnóstico.");
            // garante o tempo mínimo de "análise" para a experiência
            await new Promise((r) => setTimeout(r, 2200));
            setResultado(data.resultado as DiagnosticoResultado);
            setWaFinal(data?.org?.whatsapp_phone ?? orgWhatsapp);
            setStep("result");
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro inesperado.");
            setStep(3);
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
                        Cruzando seu perfil com milhares de cenários…
                    </h2>
                    <p className="mt-3 text-neutral-500">Isso leva alguns segundos.</p>
                </div>
                <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.08);opacity:1}}`}</style>
            </Shell>
        );
    }

    const progresso = step / 3;

    return (
        <Shell accent={cor}>
            {/* progresso */}
            <div className="mb-6 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full rounded-full transition-all" style={{ width: `${progresso * 100}%`, background: cor }} />
                </div>
                <span className="text-xs font-semibold text-neutral-400">{step}/3</span>
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
                    <Campo label="Estado">
                        <select className={inputCls} value={f.estado} onChange={(e) => set("estado", e.target.value)}>
                            <option value="">Selecione…</option>
                            {UFS.map((uf) => (
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>
                    </Campo>
                    <p className="text-xs text-neutral-400">Ao continuar, você concorda em receber o resultado por WhatsApp.</p>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <Header etapa="Etapa 2 · Momento de vida" titulo="Onde você está agora?" accent={cor} />
                    <Campo label={`Sua idade — ${f.idade} anos`}>
                        <Slider min={16} max={90} step={1} value={f.idade} onChange={(v) => set("idade", v)} accent={cor} />
                    </Campo>
                    <Campo label="Profissão">
                        <div className="grid gap-2">
                            {PROFISSOES.map((p) => (
                                <OptionCard key={p.id} active={f.profissao === p.id} onClick={() => set("profissao", p.id)} accent={cor}>
                                    {p.label}
                                </OptionCard>
                            ))}
                        </div>
                    </Campo>
                    <Campo label="Seus objetivos (escolha até 3)">
                        <div className="grid gap-2">
                            {OBJETIVOS.map((o) => (
                                <OptionCard key={o.id} active={f.objetivos.includes(o.id)} onClick={() => toggleObjetivo(o.id)} accent={cor}>
                                    {o.label}
                                </OptionCard>
                            ))}
                        </div>
                    </Campo>
                    <div className="grid grid-cols-2 gap-3">
                        <ToggleCard label="Tem imóvel quitado?" value={f.possui_imovel_quitado} onChange={(v) => set("possui_imovel_quitado", v)} accent={cor} />
                        <ToggleCard label="Tem terreno?" value={f.possui_terreno} onChange={(v) => set("possui_terreno", v)} accent={cor} />
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-5">
                    <Header etapa="Etapa 3 · Capacidade financeira" titulo="Arraste pra ajustar com precisão." accent={cor} />
                    <CurrencyField label="Renda mensal" value={f.renda_mensal} min={0} max={100000} step={500} onChange={(v) => set("renda_mensal", v)} accent={cor} />
                    <CurrencyField label="Quanto consegue investir todo mês?" value={f.aporte_mensal} min={0} max={50000} step={100} onChange={(v) => set("aporte_mensal", v)} accent={cor} sub="Valor que sobra depois de pagar as contas." />
                    <CurrencyField label="Quanto custa seu padrão de vida por mês?" value={f.custo_vida} min={0} max={60000} step={500} onChange={(v) => set("custo_vida", v)} accent={cor} />
                    <CurrencyField label="Capital disponível pra investir agora" value={f.capital_disponivel} min={0} max={2000000} step={5000} onChange={(v) => set("capital_disponivel", v)} accent={cor} sub="Dinheiro líquido nos próximos 30 dias." />
                    <CurrencyField label="Patrimônio atual (aprox.)" value={f.patrimonio_atual} min={0} max={10000000} step={10000} onChange={(v) => set("patrimonio_atual", v)} accent={cor} />
                    <CurrencyField label="Renda passiva hoje (aluguéis/juros)" value={f.renda_passiva_atual} min={0} max={50000} step={250} onChange={(v) => set("renda_passiva_atual", v)} accent={cor} />
                    <Campo label={`Quanto do patrimônio está em imóveis hoje — ${f.pct_imoveis_atual}%`}>
                        <Slider min={0} max={100} step={5} value={f.pct_imoveis_atual} onChange={(v) => set("pct_imoveis_atual", v)} accent={cor} />
                    </Campo>
                </div>
            )}

            {erro && <p className="mt-4 text-sm font-medium text-red-600">{erro}</p>}

            {/* honeypot */}
            <input type="text" name="company" autoComplete="off" tabIndex={-1} className="hidden" aria-hidden />

            <div className="sticky bottom-0 mt-8 -mx-5 border-t border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur">
                <div className="flex gap-3">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep((step - 1) as 1 | 2)}
                            className="rounded-full border border-neutral-200 px-5 py-4 text-sm font-semibold text-neutral-600"
                        >
                            Voltar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={avancar}
                        className="flex-1 rounded-full py-4 text-center text-base font-bold text-neutral-900 transition active:scale-[0.99]"
                        style={{ background: cor }}
                    >
                        {step === 3 ? "Gerar meu diagnóstico" : "Continuar"}
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
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5c8a12" }}>
                {etapa.split("·")[0]}
                {etapa.includes("·") && <span className="text-neutral-400"> · {etapa.split("·").slice(1).join("·").trim()}</span>}
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

function ToggleCard({ label, value, onChange, accent }: { label: string; value: boolean; onChange: (v: boolean) => void; accent: string }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="mb-2 text-sm font-semibold text-neutral-700">{label}</p>
            <div className="flex gap-2">
                {[
                    { v: true, l: "Sim" },
                    { v: false, l: "Não" },
                ].map((o) => (
                    <button
                        key={o.l}
                        type="button"
                        onClick={() => onChange(o.v)}
                        className="flex-1 rounded-xl py-2 text-sm font-semibold transition"
                        style={{
                            background: value === o.v ? accent : "#f3f4f6",
                            color: value === o.v ? "#111" : "#6b7280",
                        }}
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
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: accent }}
        />
    );
}

function CurrencyField({ label, value, min, max, step, onChange, accent, sub }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; accent: string; sub?: string }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="mb-1 flex items-baseline justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</label>
            </div>
            <div className="mb-3 text-2xl font-extrabold text-neutral-900">{brl(value)}</div>
            <Slider min={min} max={max} step={step} value={value} onChange={onChange} accent={accent} />
            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>{brl(min)}</span>
                <span>{brl(max)}</span>
            </div>
            {sub && <p className="mt-2 text-xs text-neutral-400">{sub}</p>}
        </div>
    );
}
