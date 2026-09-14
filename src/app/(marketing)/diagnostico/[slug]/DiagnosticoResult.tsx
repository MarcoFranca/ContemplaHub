"use client";

import * as React from "react";
import type { DiagnosticoResultado, Alocacao } from "@/features/diagnostico/types";

const ESTAGIO_LABELS = ["Residente", "Recém formado", "Consolidado", "Investidor", "Livre de plantão"];

const brl = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
const brlFull = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);

function waLink(phone: string | null, nome: string) {
    const digits = (phone || "").replace(/\D/g, "");
    if (!digits) return null;
    const full = digits.length <= 11 ? `55${digits}` : digits;
    const msg = encodeURIComponent(`Olá! Sou ${nome}, fiz o diagnóstico e quero falar com a equipe.`);
    return `https://wa.me/${full}?text=${msg}`;
}

type Props = {
    resultado: DiagnosticoResultado;
    nome: string;
    orgNome: string;
    orgWhatsapp: string | null;
    accent: string;
    onRecomecar: () => void;
};

export function DiagnosticoResult({ resultado: r, nome, orgWhatsapp, accent, onRecomecar }: Props) {
    const wa = waLink(orgWhatsapp, nome);
    const primeiroNome = nome.trim().split(" ")[0] || nome;

    return (
        <main style={{ background: "#f4f5f7", color: "#0f172a" }} className="min-h-screen pb-28">
            <div className="mx-auto w-full max-w-md bg-white">
                {/* topo */}
                <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-sm font-semibold text-neutral-800">Seu diagnóstico</span>
                    <button onClick={onRecomecar} className="text-sm text-neutral-400">Recomeçar</button>
                </div>

                {/* HERO estágio */}
                <section className="px-5 pt-4 text-center">
                    <div
                        className="mx-auto h-28 w-28 rounded-full"
                        style={{ background: `radial-gradient(circle at 35% 30%, ${accent}, #7bbf1f)`, boxShadow: `0 0 50px ${accent}77` }}
                    />
                    <p className="mt-6 text-xs font-bold uppercase tracking-widest" style={{ color: "#5c8a12" }}>
                        Diagnóstico pronto, {primeiroNome}
                    </p>
                    <h1 className="mt-1 text-3xl font-extrabold text-neutral-900">
                        Você é <span style={{ color: "#4d7c0f" }}>{r.estagio.nome}</span>
                    </h1>
                    <p className="mt-1 text-neutral-500">Estágio {r.estagio.nivel} de 5</p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700">
                        🏆 {r.estagio.produtos_liberados} produto{r.estagio.produtos_liberados !== 1 ? "s" : ""} liberado{r.estagio.produtos_liberados !== 1 ? "s" : ""}
                    </div>
                </section>

                {/* mapa de evolução */}
                <section className="px-5 pt-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Onde você está</p>
                    <h2 className="mt-1 text-2xl font-extrabold text-neutral-900">Seu mapa de evolução.</h2>
                    <div className="mt-5 flex items-center justify-between">
                        {ESTAGIO_LABELS.map((label, i) => {
                            const nivel = i + 1;
                            const ativo = nivel === r.estagio.nivel;
                            const passou = nivel <= r.estagio.nivel;
                            return (
                                <React.Fragment key={label}>
                                    <div className="flex flex-col items-center gap-1">
                                        <div
                                            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                                            style={{
                                                background: passou ? accent : "#eef0f2",
                                                color: passou ? "#111" : "#9ca3af",
                                                outline: ativo ? `2px solid #111` : "none",
                                                outlineOffset: 2,
                                            }}
                                        >
                                            {nivel}
                                        </div>
                                        <span className="text-[10px] text-neutral-500">{label}</span>
                                    </div>
                                    {i < ESTAGIO_LABELS.length - 1 && (
                                        <div className="mx-1 h-0.5 flex-1" style={{ background: nivel < r.estagio.nivel ? accent : "#eef0f2" }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </section>

                {/* SAÚDE PATRIMONIAL */}
                <section className="px-5 pt-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Saúde patrimonial</p>
                    <div className="mt-3 rounded-3xl border border-neutral-200 p-5">
                        <div className="flex items-center gap-5">
                            <ScoreRing score={r.saude.score} accent={r.saude.status === "balanceada" ? accent : "#f59e0b"} />
                            <div>
                                <span
                                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                                    style={{ background: r.saude.status === "balanceada" ? `${accent}33` : "#fef3c7", color: r.saude.status === "balanceada" ? "#3f6212" : "#92400e" }}
                                >
                                    ● {r.saude.status === "balanceada" ? "BALANCEADA" : "DESBALANCEADA"}
                                </span>
                                <h3 className="mt-2 text-xl font-extrabold text-neutral-900">Sua saúde patrimonial</h3>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <MiniStat titulo="Custo coberto hoje" valor={`${r.saude.custo_coberto_pct}%`} sub="RF + aluguéis vs. custo de vida" />
                            <MiniStat titulo="Piso / motor ideal" valor={`${r.saude.piso_ideal_pct}% / ${r.saude.motor_ideal_pct}%`} sub="Segurança vs. crescimento" />
                        </div>
                    </div>
                </section>

                {/* ALOCAÇÃO */}
                <section className="px-5 pt-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Sua alocação x ideal</p>
                    <div className="mt-3 rounded-3xl border border-neutral-200 p-5">
                        <div className="mb-4 flex items-center gap-4 text-xs text-neutral-500">
                            <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-neutral-800" /> Sua alocação</span>
                            <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full" style={{ background: accent }} /> Ideal pro seu perfil</span>
                        </div>
                        {(
                            [
                                ["Imóveis", "imoveis"],
                                ["Renda fixa", "renda_fixa"],
                                ["Renda variável", "renda_variavel"],
                                ["Equity", "equity"],
                                ["Outros", "outros"],
                            ] as [string, keyof Alocacao][]
                        ).map(([label, key]) => (
                            <AllocRow key={key} label={label} atual={r.alocacao.atual[key]} ideal={r.alocacao.ideal[key]} accent={accent} />
                        ))}
                        {r.alocacao.ajustes.length > 0 && (
                            <div className="mt-4 rounded-2xl bg-amber-50 p-3">
                                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-700">Como chegar no ideal</p>
                                <ul className="space-y-1">
                                    {r.alocacao.ajustes.map((a, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-amber-900">
                                            <span>→</span>
                                            <span>{a}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>

                {/* META DE RENDA PASSIVA */}
                <section className="px-5 pt-10">
                    <div className="rounded-3xl border border-neutral-200 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5c8a12" }}>Sua meta de renda passiva</p>
                        <p className="mt-2 text-neutral-600">
                            Sua renda passiva projetada em 10 anos fica em{" "}
                            <span className="font-extrabold text-neutral-900">{brl(r.independencia.renda_passiva_10a)}/mês</span>, o
                            equivalente a <strong>{r.meta.cobertura_meta_pct_10a}%</strong> da meta que você definiu ({brl(r.meta.renda_passiva_desejada)}/mês).
                        </p>

                        {r.plantoes.substituidos_10a > 0 && (
                            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">
                                <span className="text-3xl font-extrabold" style={{ color: "#4d7c0f" }}>{r.plantoes.substituidos_10a}</span>
                                <span className="text-sm text-neutral-600">
                                    plantões por mês que essa renda passiva pode substituir
                                </span>
                            </div>
                        )}

                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>Cobertura da meta</span>
                                <span className="font-bold" style={{ color: "#4d7c0f" }}>{r.meta.cobertura_meta_pct_10a}%</span>
                            </div>
                            <div className="mt-1 h-3 overflow-hidden rounded-full bg-neutral-100">
                                <div className="h-full rounded-full" style={{ width: `${Math.min(r.meta.cobertura_meta_pct_10a, 100)}%`, background: accent }} />
                            </div>
                            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                                <span>Em 5 anos: {r.meta.cobertura_meta_pct_5a}%</span>
                                <span>Meta = 100%</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PROJEÇÃO */}
                <section className="px-5 pt-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">O resultado em 10 anos</p>
                    <h2 className="mt-1 text-2xl font-extrabold text-neutral-900">Onde isso te leva.</h2>
                    <div className="mt-3 rounded-3xl border border-neutral-200 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Patrimônio projetado em 10 anos</p>
                        <p className="mt-1 text-3xl font-extrabold" style={{ color: "#4d7c0f" }}>{brlFull(r.projecao.patrimonio_10a_estrategia)}</p>
                        <p className="mt-1 text-sm font-semibold text-neutral-600">
                            +{brl(r.projecao.delta)} a mais que ficar 100% no CDI.
                        </p>
                        <ProjChart serie={r.projecao.serie} accent={accent} />
                    </div>
                </section>

                {/* PRODUTOS */}
                <section className="px-5 pt-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Produtos pra você</p>
                    <h2 className="mt-1 text-2xl font-extrabold text-neutral-900">Seu arsenal de investimento.</h2>
                    <div className="mt-4 space-y-3">
                        {r.produtos.map((p) => (
                            <div key={p.key} className="rounded-3xl border p-4" style={{ borderColor: p.status === "apto" ? `${accent}` : "#e5e7eb", background: p.status === "apto" ? `${accent}12` : "#fafafa" }}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-extrabold text-neutral-900">{p.nome}</h3>
                                    <span
                                        className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                                        style={{ background: p.status === "apto" ? accent : "#e5e7eb", color: p.status === "apto" ? "#111" : "#6b7280" }}
                                    >
                                        {p.status === "apto" ? "✓ APTO" : "🔒 BLOQUEADO"}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-sm font-medium text-neutral-500">{p.subtitulo}</p>
                                <p className="mt-2 text-sm text-neutral-600">{p.descricao}</p>
                                {p.status === "bloqueado" && p.destrave && (
                                    <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs text-neutral-500">
                                        ✧ Destrava com: {p.destrave}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* PLANO */}
                <section className="px-5 pt-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Plano de execução</p>
                    <h2 className="mt-1 text-2xl font-extrabold text-neutral-900">Seus próximos passos.</h2>
                    <p className="mt-1 text-neutral-500">Na ordem certa, do passo 1 até o resultado.</p>
                    <div className="mt-5 space-y-3">
                        {r.plano.map((passo) => (
                            <div key={passo.ordem} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                                        style={{ background: passo.destaque ? accent : "#eef0f2", color: passo.destaque ? "#111" : "#6b7280", outline: passo.destaque ? "2px solid #111" : "none", outlineOffset: 2 }}
                                    >
                                        {passo.ordem}
                                    </div>
                                </div>
                                <div className="flex-1 rounded-2xl border p-4" style={{ borderColor: passo.destaque ? accent : "#e5e7eb" }}>
                                    {passo.destaque && <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#5c8a12" }}>Comece por aqui</p>}
                                    <h3 className="text-base font-bold text-neutral-900">{passo.titulo}</h3>
                                    <p className="mt-1 text-sm text-neutral-600">{passo.descricao}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <p className="px-5 pt-8 text-center text-[11px] text-neutral-400">
                    Os valores são estimativas/projeções. A execução final é desenhada com um especialista.
                </p>
            </div>

            {/* CTA fixo */}
            <div className="fixed inset-x-0 bottom-0">
                <div className="mx-auto max-w-md px-4 pb-4">
                    {wa ? (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-neutral-900 shadow-lg" style={{ background: accent }}>
                            👥 Falar com a equipe →
                        </a>
                    ) : (
                        <div className="flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-neutral-900 shadow-lg" style={{ background: accent }}>
                            👥 Em breve a equipe entra em contato
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

function ScoreRing({ score, accent }: { score: number; accent: string }) {
    const R = 34;
    const C = 2 * Math.PI * R;
    const dash = (Math.min(score, 100) / 100) * C;
    return (
        <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
                <circle cx="40" cy="40" r={R} fill="none" stroke="#eef0f2" strokeWidth="8" />
                <circle cx="40" cy="40" r={R} fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${C}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-neutral-900">{score}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">de 100</span>
            </div>
        </div>
    );
}

function MiniStat({ titulo, valor, sub }: { titulo: string; valor: string; sub: string }) {
    return (
        <div className="rounded-2xl bg-neutral-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{titulo}</p>
            <p className="mt-1 text-xl font-extrabold text-neutral-900">{valor}</p>
            <p className="mt-0.5 text-[11px] text-neutral-400">{sub}</p>
        </div>
    );
}

function AllocRow({ label, atual, ideal, accent }: { label: string; atual: number; ideal: number; accent: string }) {
    return (
        <div className="mb-3">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-neutral-700">{label}</span>
                <span className="tabular-nums text-neutral-500">
                    <b className="text-neutral-900">{atual}%</b> / {ideal}%
                </span>
            </div>
            <div className="relative mt-1 h-2 rounded-full bg-neutral-100">
                <div className="absolute inset-y-0 left-0 rounded-full bg-neutral-800" style={{ width: `${atual}%` }} />
                <div className="absolute -top-0.5 h-3 w-1 rounded" style={{ left: `calc(${Math.min(ideal, 100)}% - 2px)`, background: accent }} />
            </div>
        </div>
    );
}

function ProjChart({ serie, accent }: { serie: { ano: number; cdi: number; estrategia: number }[]; accent: string }) {
    const W = 320;
    const H = 150;
    const pad = 6;
    const maxV = Math.max(...serie.map((p) => p.estrategia), 1);
    const xs = (i: number) => pad + (i / (serie.length - 1)) * (W - 2 * pad);
    const ys = (v: number) => H - pad - (v / maxV) * (H - 2 * pad);
    const path = (key: "cdi" | "estrategia") =>
        serie.map((p, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(p[key]).toFixed(1)}`).join(" ");
    return (
        <div className="mt-4 overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                <path d={path("cdi")} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                <path d={path("estrategia")} fill="none" stroke={accent} strokeWidth="3" />
                {serie.map((p, i) => (
                    <circle key={i} cx={xs(i)} cy={ys(p.estrategia)} r={i === serie.length - 1 ? 4 : 0} fill={accent} />
                ))}
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
                {serie.map((p) => (
                    <span key={p.ano}>{p.ano === 0 ? "Hoje" : `${p.ano}a`}</span>
                ))}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><i className="inline-block h-0.5 w-4 bg-slate-300" /> 100% CDI</span>
                <span className="flex items-center gap-1"><i className="inline-block h-0.5 w-4" style={{ background: accent }} /> Estratégia</span>
            </div>
        </div>
    );
}
