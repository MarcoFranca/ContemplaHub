// app/(marketing)/guia-consorcio/print/page.tsx
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SP = {
    lp?: string;
    nome?: string;
    org?: string;
    doc?: string;
};

function fmtDateBR(d = new Date()) {
    return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default function GuiaPrintPage({ searchParams }: { searchParams: SP }) {
    const nome = (searchParams.nome ?? "Cliente").trim();
    const org = (searchParams.org ?? "Autentika Seguros").trim();
    const doc = (searchParams.doc ?? "").trim();
    const data = fmtDateBR();

    return (
        <html lang="pt-BR">
        <head>
            <meta charSet="utf-8" />
            <title>Guia Estratégico do Consórcio Imobiliário</title>

            <style>{`
          @page { size: A4; margin: 14mm 14mm; }
          html, body { background: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { box-sizing: border-box; }
          .page-break { break-before: page; page-break-before: always; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .muted { color: #475569; }
          .small { font-size: 12px; line-height: 1.45; }
          .foot { position: fixed; bottom: 8mm; left: 14mm; right: 14mm; font-size: 10px; color: #64748b; }
          .wm {
            position: fixed;
            inset: 0;
            pointer-events: none;
            opacity: 0.08;
            display: grid;
            place-items: center;
            transform: rotate(-24deg);
            font-size: 36px;
            color: #0f172a;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            white-space: pre-wrap;
          }
          .toc li { display: flex; gap: 10px; align-items: baseline; }
          .dots { flex: 1; border-bottom: 1px dotted #cbd5e1; transform: translateY(-2px); }
          .pill { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; font-size:12px; }
          .tbl { width:100%; border-collapse:collapse; }
          .tbl th, .tbl td { border:1px solid #e2e8f0; padding:10px; vertical-align:top; }
          .tbl th { background:#f1f5f9; text-align:left; font-weight:600; }
        `}</style>
        </head>

        <body className={cn("text-slate-900")}>
        {/* Watermark */}
        <div className="wm">
            {`USO EXCLUSIVO • ${nome}\nNÃO DIVULGAR / NÃO REDISTRIBUIR`}
        </div>

        {/* Footer fixo */}
        <div className="foot">
            <div className="flex w-full items-center justify-between">
            <span>
              {org} • Guia Estratégico do Consórcio Imobiliário • Gerado em {data}
            </span>
                <span className="font-mono">{doc ? `DOC ${doc}` : ""}</span>
            </div>
        </div>

        {/* CAPA */}
        <section className="avoid-break">
            <div
                className="rounded-3xl border border-slate-200 p-10"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(14,165,233,0.10) 55%, rgba(16,185,129,0.07) 100%)",
                }}
            >
                <div className="pill border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: "#10b981", display: "inline-block" }} />
                    Guia gratuito • Imóveis • Sem juros
                </div>

                <h1 className="mt-6 text-4xl font-semibold tracking-tight">
                    Guia Estratégico do Consórcio Imobiliário
                </h1>

                <p className="mt-3 text-lg text-slate-700">
                    Como usar consórcio como estratégia de aquisição e alavancagem patrimonial com previsibilidade,
                    disciplina financeira e compliance.
                </p>

                <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="text-sm font-semibold text-slate-900">Personalizado para</div>
                    <div className="mt-1 text-2xl font-semibold">
                        {nome}
                    </div>
                    <p className="mt-2 small muted">
                        Este material é educativo. Não há promessa de contemplação. Contemplação depende de sorteio, lances,
                        regras da administradora e dinâmica do grupo.
                    </p>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 avoid-break">
                        <div className="text-sm font-semibold">1) Entender</div>
                        <p className="mt-1 small muted">Consórcio x financiamento, custos e quando faz sentido.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 avoid-break">
                        <div className="text-sm font-semibold">2) Estruturar</div>
                        <p className="mt-1 small muted">Estratégia por perfil e janela de assembleia.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 avoid-break">
                        <div className="text-sm font-semibold">3) Executar</div>
                        <p className="mt-1 small muted">Próximos passos e checklist de documentação/compliance.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* SUMÁRIO */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">Sumário</h2>
            <ol className="mt-5 space-y-2 toc">
                {[
                    ["Consórcio x Financiamento (decisão correta)", "2"],
                    ["Como funciona a contemplação (sorteio e lance)", "3"],
                    ["Estratégias de lance por perfil (sem promessa)", "5"],
                    ["Cenários práticos (simples e realistas)", "7"],
                    ["Regras e restrições de crédito (imóveis)", "9"],
                    ["Checklist de LGPD e compliance comercial", "10"],
                    ["Próximos passos para o seu caso", "11"],
                ].map(([t, p]) => (
                    <li key={t}>
                        <span className="text-slate-800">{t}</span>
                        <span className="dots" />
                        <span className="text-slate-600">{p}</span>
                    </li>
                ))}
            </ol>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 avoid-break">
                <div className="text-sm font-semibold">Nota importante</div>
                <p className="mt-2 small muted">
                    Este report é personalizado com as informações básicas disponíveis no cadastro inicial. Conforme avançarmos
                    no diagnóstico, conseguimos simulações e estratégias ainda mais precisas (sem promessas e com previsões responsáveis).
                </p>
            </div>
        </section>

        {/* 1) CONSÓRCIO x FINANCIAMENTO */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">1) Consórcio x Financiamento</h2>
            <p className="mt-3 text-slate-700">
                O consórcio é uma compra programada em grupo, com taxa de administração e fundo de reserva (quando aplicável),
                sem juros. O financiamento antecipa a compra, mas adiciona juros e CET — e costuma aumentar o custo total.
            </p>

            <div className="mt-5 avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                <table className="tbl">
                    <thead>
                    <tr>
                        <th>Critério</th>
                        <th>Consórcio</th>
                        <th>Financiamento</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td><b>Custo</b></td>
                        <td>Taxa de administração + (possível) fundo de reserva</td>
                        <td>Juros + CET + seguros/encargos</td>
                    </tr>
                    <tr>
                        <td><b>Momento da compra</b></td>
                        <td>Após contemplação (sorteio/lance)</td>
                        <td>Imediato (aprovação de crédito)</td>
                    </tr>
                    <tr>
                        <td><b>Perfil ideal</b></td>
                        <td>Quem aceita planejamento e quer reduzir custo total</td>
                        <td>Quem precisa do imóvel imediatamente e assume juros</td>
                    </tr>
                    <tr>
                        <td><b>Estratégia</b></td>
                        <td>Disciplina + janela + lance responsável</td>
                        <td>Gestão de taxa + amortização + prazo</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="text-sm font-semibold text-emerald-900">Quando consórcio costuma ser melhor</div>
                    <ul className="mt-2 small text-emerald-950 list-disc pl-5">
                        <li>Horizonte de compra em médio prazo</li>
                        <li>Busca por menor custo total</li>
                        <li>Capacidade de formar “reserva de lance”</li>
                    </ul>
                </div>
                <div className="avoid-break rounded-2xl border border-sky-200 bg-sky-50 p-5">
                    <div className="text-sm font-semibold text-sky-950">Quando financiamento pode ser melhor</div>
                    <ul className="mt-2 small text-sky-950 list-disc pl-5">
                        <li>Urgência de compra imediata</li>
                        <li>Renda e score já preparados para aprovação</li>
                        <li>Plano claro de amortização acelerada</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* 2) CONTEMPLAÇÃO */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">2) Como funciona a contemplação</h2>
            <p className="mt-3 text-slate-700">
                Contemplação pode ocorrer por <b>sorteio</b> ou por <b>lance</b>. O objetivo da estratégia é aumentar
                probabilidade ao longo do tempo sem comprometer sua saúde financeira.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="text-sm font-semibold">Sorteio</div>
                    <p className="mt-2 small muted">
                        Evento periódico definido pela administradora. Todos os participantes ativos concorrem conforme regras do grupo.
                    </p>
                </div>
                <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="text-sm font-semibold">Lance</div>
                    <p className="mt-2 small muted">
                        Oferta de antecipação de valores. Pode aumentar chances, mas precisa respeitar limites e sua capacidade financeira.
                    </p>
                </div>
            </div>

            <div className="mt-6 avoid-break rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-semibold">Regra de ouro</div>
                <p className="mt-2 small muted">
                    Estratégia boa é aquela que você sustenta por meses sem se descapitalizar. Lance agressivo sem reserva tende a
                    causar desistências ou atraso — e isso destrói o plano.
                </p>
            </div>
        </section>

        {/* 3) ESTRATÉGIA POR PERFIL */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">3) Estratégias por perfil</h2>
            <p className="mt-3 text-slate-700">
                Abaixo, três modelos de estratégia. A escolha depende do seu objetivo, prazo e capacidade de formar reserva.
            </p>

            <div className="mt-5 space-y-4">
                <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Perfil Conservador</div>
                        <div className="pill border border-slate-200 bg-slate-50 text-slate-700">Foco: consistência</div>
                    </div>
                    <ul className="mt-2 small text-slate-700 list-disc pl-5">
                        <li>Prioriza sorteio + reserva gradual.</li>
                        <li>Lance moderado somente quando houver folga clara.</li>
                        <li>Ótimo para reduzir risco e manter previsibilidade.</li>
                    </ul>
                </div>

                <div className="avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-emerald-950">Perfil Equilibrado</div>
                        <div className="pill border border-emerald-200 bg-white text-emerald-900">Foco: janela + disciplina</div>
                    </div>
                    <ul className="mt-2 small text-emerald-950 list-disc pl-5">
                        <li>Reserva de lance com aportes mensais.</li>
                        <li>Lances planejados em “janelas” (sem promessas).</li>
                        <li>Equilíbrio entre chance e segurança financeira.</li>
                    </ul>
                </div>

                <div className="avoid-break rounded-2xl border border-sky-200 bg-sky-50 p-5">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-sky-950">Perfil Agressivo (responsável)</div>
                        <div className="pill border border-sky-200 bg-white text-sky-950">Foco: antecipação</div>
                    </div>
                    <ul className="mt-2 small text-sky-950 list-disc pl-5">
                        <li>Requer reserva robusta e tolerância a variação do grupo.</li>
                        <li>Evitar “all-in” se isso comprometer sua liquidez.</li>
                        <li>Indicada quando há urgência relativa e caixa preparado.</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* 4) CENÁRIOS PRÁTICOS */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">4) Cenários práticos (exemplos simples)</h2>
            <p className="mt-3 text-slate-700">
                Exemplos didáticos para entender mecânica. O cenário real depende do grupo/administradora e do seu diagnóstico.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-4">
                {[
                    { t: "Cenário A", d: "Carta média • foco em previsibilidade", b: "Conservador/Eq." },
                    { t: "Cenário B", d: "Carta alta • foco em janela planejada", b: "Equilibrado" },
                    { t: "Cenário C", d: "Carta alta • antecipação com reserva forte", b: "Agressivo (resp.)" },
                ].map((x) => (
                    <div key={x.t} className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="text-sm font-semibold">{x.t}</div>
                        <p className="mt-1 small muted">{x.d}</p>
                        <div className="mt-3 pill border border-slate-200 bg-slate-50 text-slate-700">{x.b}</div>
                        <p className="mt-3 small muted">
                            O próximo passo é calibrar “reserva mensal”, objetivo e janela para sugerir faixas de lance responsáveis.
                        </p>
                    </div>
                ))}
            </div>
        </section>

        {/* 5) RESTRIÇÕES DE USO DO CRÉDITO */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">5) Regras e restrições do crédito (imóveis)</h2>
            <div className="mt-4 avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                <ul className="small text-slate-700 list-disc pl-5">
                    <li>Crédito pode ser usado para compra de imóvel, quitação, construção/reforma conforme regras da administradora.</li>
                    <li>Liberação depende de análise documental e garantias (ex.: alienação fiduciária quando aplicável).</li>
                    <li>Evite assumir compromisso sem checar elegibilidade do imóvel e documentação.</li>
                </ul>
            </div>

            <div className="mt-6 avoid-break rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="text-sm font-semibold text-amber-950">Alerta de compliance</div>
                <p className="mt-2 small text-amber-950">
                    Nunca prometa contemplação. Fale sempre em estratégia, probabilidade e disciplina. Tudo deve estar aderente à LGPD
                    e às regras da administradora.
                </p>
            </div>
        </section>

        {/* 6) LGPD */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">6) Checklist LGPD e compliance</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="text-sm font-semibold">Consentimento</div>
                    <ul className="mt-2 small text-slate-700 list-disc pl-5">
                        <li>Registrar consentimento para envio do material e contato.</li>
                        <li>Guardar escopo (ex.: guia_estrategico_consorcio).</li>
                        <li>Permitir opt-out e respeitar preferências.</li>
                    </ul>
                </div>
                <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="text-sm font-semibold">Discurso comercial</div>
                    <ul className="mt-2 small text-slate-700 list-disc pl-5">
                        <li>Sem promessa de contemplação.</li>
                        <li>Explicar sorteio/lance e variáveis do grupo.</li>
                        <li>Registrar histórico e próximos passos.</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* 7) PRÓXIMOS PASSOS (personalizado) */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">7) Próximos passos para você, {nome}</h2>
            <p className="mt-3 text-slate-700">
                Para evoluir do guia para um plano objetivo (com simulações e faixas de lance responsáveis), precisamos de 4 itens:
            </p>

            <div className="mt-5 avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <ol className="small text-emerald-950 list-decimal pl-5 space-y-1">
                    <li>Objetivo do imóvel (morar, investir, quitar financiamento, construir/reformar)</li>
                    <li>Faixa de carta desejada e prazo ideal</li>
                    <li>Renda familiar e parcela máxima confortável</li>
                    <li>Reserva disponível (e quanto consegue aportar por mês)</li>
                </ol>
            </div>

            <div className="mt-6 avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold">Mensagem pronta para WhatsApp</div>
                <p className="mt-2 small muted">
                    “Olá! Quero montar um plano de consórcio imobiliário. Meu objetivo é ________. Minha faixa de carta é ________.
                    Consigo pagar até R$ ________/mês e tenho reserva de R$ ________. Podemos simular e sugerir uma estratégia responsável?”
                </p>
            </div>

            <div className="mt-8 small muted">
                <b>Uso exclusivo.</b> Proibida divulgação, redistribuição ou comercialização deste material sem autorização expressa de {org}.
            </div>
        </section>
        </body>
        </html>
    );
}
