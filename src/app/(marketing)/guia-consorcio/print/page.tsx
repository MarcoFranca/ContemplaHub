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
          /* Página */
          @page { size: A4; margin: 14mm 14mm 22mm 14mm; }
          html, body { background:#fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { box-sizing: border-box; }

          /* Tipografia e ritmo */
          :root{
            --h1: 34px;
            --h2: 22px;
            --p: 13.5px;
            --lh: 1.6;
          }
          body{ color:#0f172a; }
          h1{ font-size: var(--h1); line-height: 1.12; margin:0; letter-spacing:-0.02em; }
          h2{ font-size: var(--h2); line-height: 1.2; margin:0; letter-spacing:-0.01em; }
          p{ font-size: var(--p); line-height: var(--lh); margin:0; }
          .small{ font-size: 12px; line-height: 1.5; }
          .muted{ color:#475569; }
           /* Limita largura do conteúdo para não ficar chapado */
           .container {
            max-width: 170mm; /* A4 útil ~182mm (com margens). 170mm dá respiro lateral. */
            margin: 0 auto;
           }

           /* Ajuste opcional para títulos não grudarem no topo */
           .section-top {
            margin-top: 6mm;
           }
          .stack-12 > * + *{ margin-top: 12px; }
          .stack-16 > * + *{ margin-top: 16px; }
          .section{ margin-top: 16px; }

          /* Layout / impressão */
          .content { padding-bottom: 18mm; }
          .page {
            /* “margem visual” interna: dá respiro sem mudar a margem física do PDF */
             padding: 10mm 8mm 0 8mm;
            }
          .page-break { break-before: page; page-break-before: always; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }

          /* Componentes */
          .pill { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; font-size:12px; }
          .dots { flex: 1; border-bottom: 1px dotted #cbd5e1; transform: translateY(-2px); }
          .toc li { display:flex; gap:10px; align-items:baseline; }

          /* Tabela */
          .tbl { width:100%; border-collapse:collapse; font-size: 12.5px; }
          .tbl th, .tbl td { border:1px solid #e2e8f0; padding:10px; vertical-align:top; }
          .tbl th { background:#f1f5f9; text-align:left; font-weight:600; color:#0f172a; }

          /* Rodapé */
          .foot {
            position: fixed;
            bottom: 8mm;
            left: 14mm;
            right: 14mm;
            font-size: 10px;
            color: #64748b;
          }

          /* Watermark (fixo) */
          .wm {
            position: fixed;
            inset: 0;
            pointer-events: none;
            opacity: 0.06;
            display: grid;
            place-items: center;
            transform: rotate(-24deg);
            font-size: 34px;
            color: #0f172a;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            white-space: pre-wrap;
          }

          /* Barra de marca */
          .brandbar{
            height: 6px;
            border-radius: 999px;
            background: linear-gradient(90deg, rgba(16,185,129,.55), rgba(14,165,233,.55), rgba(16,185,129,.55));
          }
        `}</style>
        </head>

        <body className={cn("text-slate-900")}>


        {/* Rodapé fixo */}
        <div className="foot">
            <div className="flex w-full items-center justify-between">
            <span>
              {org} • Guia Estratégico do Consórcio Imobiliário • Gerado em {data}
            </span>
                <span className="font-mono">{doc ? `DOC ${doc}` : ""}</span>
            </div>
        </div>

        {/* Conteúdo com padding para não encostar no rodapé */}
        <div className="content page">
            <div className="container">

                {/* CAPA */}
                <section className="avoid-break">
                    <div
                        className="rounded-3xl border border-slate-200 p-10"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(14,165,233,0.10) 55%, rgba(16,185,129,0.07) 100%)",
                        }}
                    >
                        <div className="brandbar"/>

                        <div className="mt-5 pill border border-emerald-200 bg-emerald-50 text-emerald-900">
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: "#10b981",
                        display: "inline-block",
                    }}
                />
                            Guia gratuito • Imóveis • Sem juros
                        </div>

                        <div className="mt-6 stack-12">
                            <h1>Guia Estratégico do Consórcio Imobiliário</h1>
                            <p className="text-slate-700">
                                Como usar consórcio como estratégia de aquisição e alavancagem patrimonial com
                                previsibilidade,
                                disciplina financeira e compliance.
                            </p>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 avoid-break">
                                <div className="text-sm font-semibold text-slate-900">Personalizado para</div>
                                <div className="mt-1 text-2xl font-semibold">{nome}</div>
                                <p className="mt-2 small muted">
                                    Material educativo. Não há promessa de contemplação. Contemplação depende de
                                    sorteio, lances,
                                    regras da administradora e dinâmica do grupo.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 avoid-break">
                                    <div className="text-sm font-semibold">1) Entender</div>
                                    <p className="mt-1 small muted">Consórcio x financiamento, custos e quando faz
                                        sentido.</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 avoid-break">
                                    <div className="text-sm font-semibold">2) Estruturar</div>
                                    <p className="mt-1 small muted">Estratégia por perfil e janela de assembleia.</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 avoid-break">
                                    <div className="text-sm font-semibold">3) Executar</div>
                                    <p className="mt-1 small muted">Próximos passos e checklist de
                                        documentação/compliance.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SUMÁRIO + RESUMO (2 colunas para ocupar melhor o espaço) */}
                <section className="page-break">
                    <div className="brandbar"/>
                    <div className="mt-5 grid grid-cols-[1.25fr_0.95fr] gap-6">
                        <div className="avoid-break">
                            <h2>Sumário</h2>
                            <ol className="mt-4 space-y-2 toc">
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
                                        <span className="dots"/>
                                        <span className="text-slate-600">{p}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <aside className="stack-12">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 avoid-break">
                                <div className="text-sm font-semibold">Nota importante</div>
                                <p className="mt-2 small muted">
                                    Este report é personalizado com as informações básicas do cadastro inicial. No
                                    diagnóstico, refinamos
                                    carta, prazo e estratégia com previsões responsáveis (sem promessas).
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 avoid-break">
                                <div className="text-sm font-semibold text-emerald-950">Como usar este guia</div>
                                <ul className="mt-2 small text-emerald-950 list-disc pl-5">
                                    <li>Leia a comparação consórcio x financiamento.</li>
                                    <li>Escolha um perfil de estratégia compatível com seu caixa.</li>
                                    <li>Use o checklist e envie a mensagem pronta no WhatsApp.</li>
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 avoid-break">
                                <div className="text-sm font-semibold text-sky-950">Resumo executivo</div>
                                <p className="mt-2 small text-sky-950">
                                    Consórcio é planejamento com menor custo total (sem juros), porém depende de
                                    contemplação.
                                    A estratégia vencedora é disciplina + reserva + decisões responsáveis.
                                </p>
                            </div>
                        </aside>
                    </div>
                </section>

                {/* 1) CONSÓRCIO x FINANCIAMENTO */}
                <section className="page-break">
                    <div className="brandbar"/>
                    <div className="mt-5 stack-16">
                        <div className="stack-12">
                            <h2>1) Consórcio x Financiamento</h2>
                            <p className="text-slate-700">
                                O consórcio é uma compra programada em grupo, com taxa de administração e fundo de
                                reserva (quando aplicável),
                                sem juros. O financiamento antecipa a compra, mas adiciona juros e CET — e costuma
                                aumentar o custo total.
                            </p>
                        </div>

                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                <div className="text-sm font-semibold text-emerald-900">Quando consórcio costuma ser
                                    melhor
                                </div>
                                <ul className="mt-2 small text-emerald-950 list-disc pl-5">
                                    <li>Horizonte de compra em médio prazo</li>
                                    <li>Busca por menor custo total</li>
                                    <li>Capacidade de formar “reserva de lance”</li>
                                </ul>
                            </div>
                            <div className="avoid-break rounded-2xl border border-sky-200 bg-sky-50 p-5">
                                <div className="text-sm font-semibold text-sky-950">Quando financiamento pode ser
                                    melhor
                                </div>
                                <ul className="mt-2 small text-sky-950 list-disc pl-5">
                                    <li>Urgência de compra imediata</li>
                                    <li>Renda e score preparados</li>
                                    <li>Plano claro de amortização acelerada</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2) CONTEMPLAÇÃO */}
                <section className="page-break">
                    <h2 className="text-2xl font-semibold">2) Como funciona a contemplação</h2>
                    <p className="mt-3 text-slate-700">
                        Contemplação pode ocorrer por <b>sorteio</b> ou por <b>lance</b>. O objetivo da estratégia é
                        aumentar
                        probabilidade ao longo do tempo sem comprometer sua saúde financeira.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold">Sorteio</div>
                            <p className="mt-2 small muted">
                                Evento periódico definido pela administradora. Todos os participantes ativos concorrem
                                conforme regras do grupo.
                            </p>
                        </div>
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold">Lance</div>
                            <p className="mt-2 small muted">
                                Oferta de antecipação de valores. Pode aumentar chances, mas precisa respeitar limites e
                                sua capacidade financeira.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-semibold">Regra de ouro</div>
                        <p className="mt-2 small muted">
                            Estratégia boa é aquela que você sustenta por meses sem se descapitalizar. Lance agressivo
                            sem reserva tende a
                            causar desistências ou atraso — e isso destrói o plano.
                        </p>
                    </div>
                </section>

                {/* 3) ESTRATÉGIA POR PERFIL */}
                <section className="page-break">
                    <h2 className="text-2xl font-semibold">3) Estratégias por perfil</h2>
                    <p className="mt-3 text-slate-700">
                        Abaixo, três modelos de estratégia. A escolha depende do seu objetivo, prazo e capacidade de
                        formar reserva.
                    </p>

                    <div className="mt-5 space-y-4">
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold">Perfil Conservador</div>
                                <div className="pill border border-slate-200 bg-slate-50 text-slate-700">Foco:
                                    consistência
                                </div>
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
                                <div className="pill border border-emerald-200 bg-white text-emerald-900">Foco: janela +
                                    disciplina
                                </div>
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
                                <div className="pill border border-sky-200 bg-white text-sky-950">Foco: antecipação
                                </div>
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
                        Exemplos didáticos para entender mecânica. O cenário real depende do grupo/administradora e do
                        seu diagnóstico.
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-4">
                        {[
                            {t: "Cenário A", d: "Carta média • foco em previsibilidade", b: "Conservador/Eq."},
                            {t: "Cenário B", d: "Carta alta • foco em janela planejada", b: "Equilibrado"},
                            {t: "Cenário C", d: "Carta alta • antecipação com reserva forte", b: "Agressivo (resp.)"},
                        ].map((x) => (
                            <div key={x.t} className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="text-sm font-semibold">{x.t}</div>
                                <p className="mt-1 small muted">{x.d}</p>
                                <div
                                    className="mt-3 pill border border-slate-200 bg-slate-50 text-slate-700">{x.b}</div>
                                <p className="mt-3 small muted">
                                    O próximo passo é calibrar “reserva mensal”, objetivo e janela para sugerir faixas
                                    de lance responsáveis.
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
                            <li>Crédito pode ser usado para compra de imóvel, quitação, construção/reforma conforme
                                regras da administradora.
                            </li>
                            <li>Liberação depende de análise documental e garantias (ex.: alienação fiduciária quando
                                aplicável).
                            </li>
                            <li>Evite assumir compromisso sem checar elegibilidade do imóvel e documentação.</li>
                        </ul>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <div className="text-sm font-semibold text-amber-950">Alerta de compliance</div>
                        <p className="mt-2 small text-amber-950">
                            Nunca prometa contemplação. Fale sempre em estratégia, probabilidade e disciplina. Tudo deve
                            estar aderente à LGPD
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
                        Para evoluir do guia para um plano objetivo (com simulações e faixas de lance responsáveis),
                        precisamos de 4 itens:
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
                            “Olá! Quero montar um plano de consórcio imobiliário. Meu objetivo é ________. Minha faixa
                            de carta é ________.
                            Consigo pagar até R$ ________/mês e tenho reserva de R$ ________. Podemos simular e sugerir
                            uma estratégia responsável?”
                        </p>
                    </div>

                    <div className="mt-8 small muted">
                        <b>Uso exclusivo.</b> Proibida divulgação, redistribuição ou comercialização deste material sem
                        autorização expressa de {org}.
                    </div>
                </section>
            </div>
        </div>
        </body>
        </html>
    );
}
