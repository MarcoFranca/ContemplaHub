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
          @page { size: A4; margin: 14mm 14mm 22mm 14mm; }
          html, body { background:#fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { box-sizing: border-box; }

          .content { padding-bottom: 18mm; }

          /* ✅ margem visual interna (resolve “colado na folha”) */
          .page { padding: 10mm 8mm 0 8mm; }
          .container { max-width: 170mm; margin: 0 auto; }
          .section-top { margin-top: 6mm; }
          .stack-12 > * + *{ margin-top: 12px; }
          .stack-16 > * + *{ margin-top: 16px; }
          .page-break { break-before: page; page-break-before: always; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .muted { color: #475569; }
          .small { font-size: 12px; line-height: 1.45; }

          .foot { position: fixed; bottom: 8mm; left: 14mm; right: 14mm; font-size: 10px; color: #64748b; }

          .toc li { display: flex; gap: 10px; align-items: baseline; }
          .dots { flex: 1; border-bottom: 1px dotted #cbd5e1; transform: translateY(-2px); }
          .pill { display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; font-size:12px; }
          .tbl { width:100%; border-collapse:collapse; }
          .tbl th, .tbl td { border:1px solid #e2e8f0; padding:10px; vertical-align:top; }
          .tbl th { background:#f1f5f9; text-align:left; font-weight:600; }

          .brandbar{
            height: 6px;
            border-radius: 999px;
            background: linear-gradient(90deg, rgba(16,185,129,.55), rgba(14,165,233,.55), rgba(16,185,129,.55));
          }
        `}</style>
        </head>

        <body className={cn("text-slate-900")}>
        {/* Footer fixo */}
        <div className="foot">
            <div className="flex w-full items-center justify-between">
            <span>
              {org} • Guia Estratégico do Consórcio Imobiliário • Uso exclusivo de {nome} • Gerado em {data}
            </span>
                <span className="font-mono">{doc ? `DOC ${doc}` : ""}</span>
            </div>
        </div>

        {/* ✅ Conteúdo com “margem visual” e container */}
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
                        <div className="brandbar" />
                        <div className="mt-5 pill border border-emerald-200 bg-emerald-50 text-emerald-900">
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
                            <div className="mt-1 text-2xl font-semibold">{nome}</div>
                            <p className="mt-2 small muted">
                                Material educativo. Não há promessa de contemplação. Contemplação depende de sorteio, lances,
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

                {/* (o restante do seu conteúdo permanece igual) */}
                {/* SUMÁRIO */}
                <section className="page-break section-top">
                    <div className="brandbar" />
                    <h2 className="mt-5 text-2xl font-semibold">Sumário</h2>

                    <div className="mt-5 grid grid-cols-[1.25fr_0.95fr] gap-6">
                        <div>
                            <ol className="space-y-2 toc">
                                {[
                                    ["Consórcio x Financiamento (decisão correta)", "2"],
                                    ["Como funciona a contemplação (sorteio e lance)", "3"],
                                    ["Estratégias de lance por perfil (sem promessa)", "5"],
                                    ["Cenários práticos (simples e realistas)", "7"],
                                    ["Regras e restrições de crédito (imóveis)", "9"],
                                    ["Checklist LGPD e compliance comercial", "10"],
                                    ["Próximos passos para o seu caso", "11"],
                                ].map(([t, p]) => (
                                    <li key={t}>
                                        <span className="text-slate-800">{t}</span>
                                        <span className="dots" />
                                        <span className="text-slate-600">{p}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <aside className="stack-12">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 avoid-break">
                                <div className="text-sm font-semibold">Nota importante</div>
                                <p className="mt-2 small muted">
                                    Este report é personalizado com as informações básicas do cadastro inicial. No diagnóstico, refinamos
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
                                    Consórcio é planejamento com menor custo total (sem juros), porém depende de contemplação.
                                    A estratégia vencedora é disciplina + reserva + decisões responsáveis.
                                </p>
                            </div>
                        </aside>
                    </div>
                </section>

                {/* 1) CONSÓRCIO x FINANCIAMENTO */}
                <section className="page-break">
                    <div className="brandbar" />

                    <div className="mt-5 stack-16">
                        {/* Header */}
                        <div className="stack-12">
                            <h2 className="text-2xl font-semibold">1) Consórcio x Financiamento</h2>

                            <p className="text-slate-700">
                                Antes de comparar números, entenda o “jogo”: <b>o objetivo não é só comprar o imóvel</b> é comprar
                                <b> pagando o mínimo possível</b> e sem se prender a uma dívida que trava sua capacidade de investir e crescer.
                            </p>

                            <div className="avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                <div className="text-sm font-semibold text-emerald-950">A diferença prática</div>
                                <p className="mt-2 small text-emerald-950">
                                    <b>Financiamento compra tempo com juros.</b> Consórcio compra o imóvel com <b>planejamento e estratégia</b>
                                    (sem juros), usando sorteio e/ou lance para antecipar a contemplaçãompre de forma responsável.
                                </p>
                            </div>
                        </div>

                        {/* Comparativo (tabela) */}
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold text-slate-900">Comparativo direto</div>
                            <p className="mt-2 small muted">
                                Use isto como critério de decisão. A melhor escolha é a que você sustenta com saúde financeira.
                            </p>

                            <div className="mt-4">
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
                                        <td><b>Custo total</b></td>
                                        <td>Taxa de administração + (possível) fundo de reserva</td>
                                        <td>Juros + CET + seguros/encargos</td>
                                    </tr>
                                    <tr>
                                        <td><b>Compra</b></td>
                                        <td>Após contemplação (sorteio/lance)</td>
                                        <td>Imediata (após aprovação)</td>
                                    </tr>
                                    <tr>
                                        <td><b>Controle</b></td>
                                        <td>Você controla estratégia, reserva e janela de lance</td>
                                        <td>Você “aceita” taxa, CET e condições do banco</td>
                                    </tr>
                                    <tr>
                                        <td><b>Perfil ideal</b></td>
                                        <td>Quem quer reduzir custo total e aceita planejamento</td>
                                        <td>Quem precisa do imóvel imediatamente e assume juros</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Blocos: decisão guiada */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                <div className="text-sm font-semibold text-emerald-900">Quando consórcio costuma ser a escolha mais inteligente</div>
                                <ul className="mt-2 small text-emerald-950 list-disc pl-5">
                                    <li>Você aceita um horizonte de compra em médio prazo.</li>
                                    <li>Quer <b>reduzir custo total</b> (sem juros) e manter flexibilidade.</li>
                                    <li>Consegue formar uma reserva mensal (mesmo que pequena).</li>
                                    <li>Quer comprar com estratégia: <b>janela + lance responsável</b>.</li>
                                </ul>
                            </div>

                            <div className="avoid-break rounded-2xl border border-sky-200 bg-sky-50 p-5">
                                <div className="text-sm font-semibold text-sky-950">Quando financiamento pode fazer mais sentido</div>
                                <ul className="mt-2 small text-sky-950 list-disc pl-5">
                                    <li>Você precisa comprar <b>agora</b> (mudança urgente, oportunidade imediata).</li>
                                    <li>Já tem renda/score preparados e um plano real de amortização rápida.</li>
                                    <li>A prestação com juros cabe com folga e não estrangula o orçamento.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Erros comuns + “autoqualificação” */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="text-sm font-semibold text-slate-900">O erro mais comum (e caro)</div>
                                <p className="mt-2 small muted">
                                    Muita gente decide no impulso: “quero agora”. Só que o “agora” vem com um preço invisível: juros + CET.
                                    Se o imóvel não é urgência absoluta, <b>planejamento costuma vencer</b>.
                                </p>
                            </div>

                            <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="text-sm font-semibold text-slate-900">Checklist rápido de decisão</div>
                                <ul className="mt-2 small text-slate-700 list-disc pl-5">
                                    <li>Meu prazo é “agora” ou “planejável”?</li>
                                    <li>Eu prefiro pagar juros para antecipar ou construir estratégia para reduzir custo?</li>
                                    <li>Consigo reservar um valor mensal sem me descapitalizar?</li>
                                    <li>Se eu tiver contemplação, minha documentação e escolha do imóvel estarão prontas?</li>
                                </ul>
                            </div>
                        </div>

                        {/* CTA sutil (sem promessa) */}
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <div className="text-sm font-semibold">Próximo passo recomendado</div>
                            <p className="mt-2 small muted">
                                Se você quer encurtar caminho com segurança, o ideal é montar uma estratégia de carta, prazo e faixa de lance
                                compatível com seu perfil <b>sem promessas</b>, com previsões responsáveis e disciplina.
                            </p>
                        </div>
                    </div>
                </section>


                {/* 2) CONTEMPLAÇÃO */}
                <section className="page-break">
                    <h2 className="text-2xl font-semibold">2) Como funciona a contemplação (e como pensar certo)</h2>

                    <p className="mt-3 text-slate-700">
                        A contemplação é o momento em que o crédito é liberado.
                        Ela não acontece por “milagre” acontece por <b>mecânica, regras e estratégia</b>.
                    </p>

                    <p className="mt-3 text-slate-700">
                        Entender esse funcionamento evita o erro mais comum no consórcio:
                        <b>entrar achando que tudo depende de sorte</b>.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        {/* Sorteio */}
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold">Sorteio</div>
                            <p className="mt-2 small muted">
                                O sorteio ocorre periodicamente conforme regras da administradora.
                                Todos os participantes ativos concorrem em igualdade de condições.
                            </p>

                            <p className="mt-3 small text-slate-700">
                                👉 Importante: o sorteio não é estratégia, é <b>componente do sistema</b>.
                                Ele funciona melhor para quem tem disciplina e não depende de prazo imediato.
                            </p>
                        </div>

                        {/* Lance */}
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold">Lance</div>
                            <p className="mt-2 small muted">
                                O lance é a antecipação de parte do crédito como critério competitivo
                                dentro do grupo.
                            </p>

                            <p className="mt-3 small text-slate-700">
                                👉 Lance não é “apostar alto”.
                                É usar <b>reserva planejada</b> para aumentar probabilidade
                                sem comprometer sua liquidez.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="text-sm font-semibold text-emerald-950">
                            O erro que mais destrói planos de consórcio
                        </div>

                        <p className="mt-2 small text-emerald-950">
                            Entrar com ansiedade de financiamento em um produto de planejamento.
                        </p>

                        <p className="mt-2 small text-emerald-950">
                            Quando alguém força lances sem reserva ou cria expectativas irreais,
                            o problema não é o consórcio é a estratégia.
                        </p>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-semibold">Regra de ouro</div>
                        <p className="mt-2 small muted">
                            Estratégia boa é aquela que você consegue sustentar com tranquilidade.
                            A melhor contemplação é a que acontece sem estresse financeiro,
                            sem pressa emocional e sem arrependimento depois.
                        </p>
                    </div>

                    <div className="mt-6 small muted">
                        ✔️ Consórcio funciona melhor para quem pensa em custo total, não apenas em velocidade.
                        ✔️ Planejamento consistente vence decisões impulsivas no longo prazo.
                    </div>
                </section>


                {/* 3) ESTRATÉGIA POR PERFIL */}
                <section className="page-break">
                    <h2 className="text-2xl font-semibold">3) Estratégia por perfil (como escolher o seu caminho)</h2>

                    <p className="mt-3 text-slate-700">
                        Consórcio não é “um produto”. É um <b>método</b>.
                        E método só funciona quando combina com o seu perfil de prazo, disciplina e reserva.
                    </p>

                    <div className="mt-5 avoid-break rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-semibold">Como se autoidentificar (em 30 segundos)</div>
                        <ul className="mt-2 small text-slate-700 list-disc pl-5">
                            <li><b>Prazo:</b> você precisa do imóvel “agora” ou “planejável”?</li>
                            <li><b>Reserva:</b> você já tem caixa ou vai construir mês a mês?</li>
                            <li><b>Emoção:</b> você lida bem com processo ou se frustra com espera?</li>
                        </ul>
                    </div>

                    <div className="mt-5 space-y-4">
                        {/* Conservador */}
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold">Perfil Conservador</div>
                                <div className="pill border border-slate-200 bg-slate-50 text-slate-700">Foco: estabilidade</div>
                            </div>

                            <p className="mt-2 small muted">
                                Ideal para quem prefere previsibilidade e quer avançar com baixo risco mesmo que o processo seja mais gradual.
                            </p>

                            <ul className="mt-3 small text-slate-700 list-disc pl-5">
                                <li>Prioriza <b>parcela confortável</b> e construção de reserva ao longo do tempo.</li>
                                <li>Conta com <b>sorteio</b> como componente natural do plano.</li>
                                <li>Usa lance apenas quando houver folga clara (sem sacrificar liquidez).</li>
                            </ul>

                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 small text-slate-700">
                                <b>Sinal de alerta:</b> se você entra conservador, mas “por dentro” está com pressa, tende a frustrar.
                                Ajuste o plano antes de começar.
                            </div>
                        </div>

                        {/* Equilibrado */}
                        <div className="avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-emerald-950">Perfil Equilibrado</div>
                                <div className="pill border border-emerald-200 bg-white text-emerald-900">Foco: janela + disciplina</div>
                            </div>

                            <p className="mt-2 small text-emerald-950">
                                Esse é o perfil que costuma gerar melhor experiência: você não depende de sorte,
                                e também não se descapitaliza tentando “forçar” contemplação.
                            </p>

                            <ul className="mt-3 small text-emerald-950 list-disc pl-5">
                                <li>Cria uma <b>reserva de lance</b> com aportes mensais.</li>
                                <li>Trabalha com <b>janelas</b> (momentos de tentativa) conforme estratégia do grupo.</li>
                                <li>Equilíbrio entre chance e segurança financeira <b>sem promessas</b>.</li>
                            </ul>

                            <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3 small text-emerald-950">
                                <b>Regra prática:</b> se você consegue manter a parcela e ainda construir reserva, esse perfil tende a ser o mais inteligente.
                            </div>
                        </div>

                        {/* Agressivo */}
                        <div className="avoid-break rounded-2xl border border-sky-200 bg-sky-50 p-5">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-sky-950">Perfil Agressivo (responsável)</div>
                                <div className="pill border border-sky-200 bg-white text-sky-950">Foco: antecipação</div>
                            </div>

                            <p className="mt-2 small text-sky-950">
                                Indicado quando existe urgência relativa e você tem caixa para acelerar sem entrar em “modo aposta”.
                            </p>

                            <ul className="mt-3 small text-sky-950 list-disc pl-5">
                                <li>Requer <b>reserva robusta</b> e tolerância a variações do grupo.</li>
                                <li>Evita “all-in” se isso comprometer liquidez, emergência ou estabilidade.</li>
                                <li>Funciona melhor quando há <b>planejamento de aporte</b> e clareza de limites.</li>
                            </ul>

                            <div className="mt-3 rounded-xl border border-sky-200 bg-white p-3 small text-sky-950">
                                <b>Sinal de alerta:</b> agressivo sem reserva vira ansiedade. Ansiedade vira decisão ruim.
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-semibold">Qual perfil costuma “ganhar” no longo prazo?</div>
                        <p className="mt-2 small muted">
                            O perfil vencedor é o que você sustenta. Em consórcio, consistência vale mais que impulso.
                            O objetivo é avançar com estratégia e manter liberdade financeira enquanto o plano roda.
                        </p>
                    </div>
                </section>


                {/* 4) CENÁRIOS PRÁTICOS */}
                <section className="page-break">
                    <h2 className="text-2xl font-semibold">4) Cenários práticos (como o plano evolui na vida real)</h2>

                    <p className="mt-3 text-slate-700">
                        Os cenários abaixo não são promessas nem simulações financeiras.
                        São <b>modelos mentais</b> para você entender como diferentes estratégias se comportam ao longo do tempo.
                    </p>

                    <div className="mt-4 avoid-break rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-semibold">Importante antes de continuar</div>
                        <p className="mt-2 small muted">
                            Em consórcio, quem entende o processo decide melhor.
                            Quem não entende, tenta “acertar no chute” e geralmente se frustra.
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-4">
                        {/* Cenário A */}
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold">Cenário A — Evolução previsível</div>
                            <p className="mt-1 small muted">Carta média • foco em organização e consistência</p>

                            <div className="mt-3 pill border border-slate-200 bg-slate-50 text-slate-700">
                                Perfil: Conservador / Equilibrado
                            </div>

                            <ul className="mt-3 small text-slate-700 list-disc pl-5">
                                <li>Parcela confortável desde o início.</li>
                                <li>Reserva construída aos poucos, sem pressão.</li>
                                <li>Participação natural em sorteios + lances pontuais.</li>
                            </ul>

                            <p className="mt-3 small muted">
                                Esse cenário é comum para quem quer avançar com tranquilidade,
                                mantendo controle financeiro durante todo o processo.
                            </p>
                        </div>

                        {/* Cenário B */}
                        <div className="avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                            <div className="text-sm font-semibold text-emerald-950">
                                Cenário B — Janela estratégica
                            </div>
                            <p className="mt-1 small text-emerald-900">
                                Carta alta • foco em planejamento e oportunidade
                            </p>

                            <div className="mt-3 pill border border-emerald-200 bg-white text-emerald-900">
                                Perfil: Equilibrado
                            </div>

                            <ul className="mt-3 small text-emerald-950 list-disc pl-5">
                                <li>Reserva direcionada para momentos específicos.</li>
                                <li>Lances planejados, não impulsivos.</li>
                                <li>Maior chance ao longo do tempo, sem sacrificar liquidez.</li>
                            </ul>

                            <p className="mt-3 small text-emerald-900">
                                Aqui o consórcio deixa de ser espera passiva e vira
                                <b>estratégia consciente</b>.
                            </p>
                        </div>

                        {/* Cenário C */}
                        <div className="avoid-break rounded-2xl border border-sky-200 bg-sky-50 p-5">
                            <div className="text-sm font-semibold text-sky-950">
                                Cenário C — Antecipação responsável
                            </div>
                            <p className="mt-1 small text-sky-900">
                                Carta alta • foco em aceleração com caixa
                            </p>

                            <div className="mt-3 pill border border-sky-200 bg-white text-sky-950">
                                Perfil: Agressivo (responsável)
                            </div>

                            <ul className="mt-3 small text-sky-950 list-disc pl-5">
                                <li>Reserva robusta já formada ou em formação acelerada.</li>
                                <li>Uso estratégico de lance sem comprometer segurança.</li>
                                <li>Clareza total dos limites antes de agir.</li>
                            </ul>

                            <p className="mt-3 small text-sky-900">
                                Funciona quando existe preparo.
                                Sem preparo, vira pressão e pressão gera decisão ruim.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-semibold">O que esses cenários têm em comum?</div>
                        <p className="mt-2 small muted">
                            Nenhum deles depende de “milagre”.
                            Todos dependem de clareza, disciplina e escolhas alinhadas com sua realidade.
                            É isso que transforma consórcio em estratégia e não em frustração.
                        </p>
                    </div>
                </section>

                {/* 5) REGRAS E RESTRIÇÕES DO USO DO CRÉDITO */}
                <section className="page-break">
                    <h2 className="text-2xl font-semibold">5) Regras e restrições do uso do crédito imobiliário</h2>

                    <p className="mt-3 text-slate-700">
                        Ser contemplado é apenas uma etapa.
                        O crédito só é liberado quando o uso está <b>100% alinhado às regras da administradora</b>.
                        É aqui que muitos erram não por falta de dinheiro, mas por falta de orientação.
                    </p>

                    <div className="mt-5 avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="text-sm font-semibold">O que normalmente é permitido</div>

                        <ul className="mt-3 small text-slate-700 list-disc pl-5">
                            <li>Compra de imóvel residencial ou comercial pronto.</li>
                            <li>Quitação de financiamento imobiliário existente.</li>
                            <li>Construção em terreno próprio (com regras específicas).</li>
                            <li>Reforma ou ampliação, quando autorizada pela administradora.</li>
                        </ul>

                        <p className="mt-3 small muted">
                            Cada administradora possui critérios próprios.
                            Por isso, o planejamento correto começa <b>antes</b> da contemplação.
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <div className="text-sm font-semibold">Pontos que exigem atenção</div>
                            <ul className="mt-2 small text-slate-700 list-disc pl-5">
                                <li>Imóvel precisa estar regularizado e com documentação válida.</li>
                                <li>Imóveis sem matrícula individual podem ser recusados.</li>
                                <li>Alguns tipos de imóvel ou negociação exigem análise adicional.</li>
                            </ul>
                        </div>

                        <div className="avoid-break rounded-2xl border border-sky-200 bg-sky-50 p-5">
                            <div className="text-sm font-semibold text-sky-950">Garantias envolvidas</div>
                            <ul className="mt-2 small text-sky-950 list-disc pl-5">
                                <li>Alienação fiduciária é comum em compras.</li>
                                <li>Liberação depende de avaliação jurídica e técnica.</li>
                                <li>Prazo e forma seguem regras contratuais do grupo.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="text-sm font-semibold text-emerald-950">
                            Mentalidade do comprador inteligente
                        </div>
                        <p className="mt-2 small text-emerald-950">
                            Quem planeja o uso do crédito antes da contemplação:
                            <br />• evita atrasos,
                            <br />• reduz risco,
                            <br />• ganha poder de negociação,
                            <br />• e usa o consórcio como ferramenta estratégica não como aposta.
                        </p>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <div className="text-sm font-semibold text-amber-950">Alerta de compliance</div>
                        <p className="mt-2 small text-amber-950">
                            Nenhum consórcio garante contemplação ou liberação automática de crédito.
                            O discurso correto é sempre baseado em estratégia, regras e disciplina financeira.
                            Isso protege você, o cliente e todo o processo.
                        </p>
                    </div>
                </section>


                {/* 6) LGPD, ética e compliance comercial */}
                <section className="page-break">
                    <h2 className="text-2xl font-semibold">6) LGPD, ética e compliance comercial</h2>

                    <p className="mt-3 text-slate-700">
                        Um bom plano de consórcio começa com estratégia
                        e só se sustenta quando há transparência, consentimento e responsabilidade.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold">Consentimento e dados</div>
                            <ul className="mt-2 small text-slate-700 list-disc pl-5">
                                <li>Seus dados são usados exclusivamente para este atendimento.</li>
                                <li>O consentimento é registrado com escopo claro e rastreável.</li>
                                <li>Você pode interromper comunicações quando quiser.</li>
                            </ul>

                            <p className="mt-3 small muted">
                                Transparência não é obrigação apenas legal
                                é parte do nosso compromisso com decisões conscientes.
                            </p>
                        </div>

                        <div className="avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-semibold">Conduta comercial responsável</div>
                            <ul className="mt-2 small text-slate-700 list-disc pl-5">
                                <li>Nenhuma promessa de contemplação é feita.</li>
                                <li>Falamos sempre em estratégia, probabilidade e disciplina.</li>
                                <li>Cada recomendação considera seu perfil financeiro.</li>
                            </ul>

                            <p className="mt-3 small muted">
                                Nosso papel é orientar
                                a decisão final é sempre sua.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="text-sm font-semibold text-emerald-950">
                            Por que isso é importante para você
                        </div>
                        <p className="mt-2 small text-emerald-950">
                            Processos éticos evitam frustrações, protegem seu planejamento
                            e garantem que o consórcio seja usado como ferramenta de crescimento patrimonial
                            e não como uma aposta emocional.
                        </p>
                    </div>
                </section>

                {/* 7) Próximos passos para você */}
                <section className="page-break">
                    <h2 className="text-2xl font-semibold">
                        7) Próximos passos para você, {nome}
                    </h2>

                    <p className="mt-3 text-slate-700">
                        Até aqui, você entendeu como o consórcio funciona, quais estratégias existem
                        e quais decisões evitam erros comuns.
                    </p>

                    <p className="mt-3 text-slate-700">
                        O próximo passo não é contratar nada
                        é transformar essas informações em um plano claro e adequado à sua realidade.
                    </p>

                    <div className="mt-6 avoid-break rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="text-sm font-semibold text-emerald-950">
                            Para montar um plano estratégico, precisamos de 4 respostas simples
                        </div>

                        <ol className="mt-3 small text-emerald-950 list-decimal pl-5 space-y-1">
                            <li>
                                Qual é o objetivo principal do imóvel?
                                <span className="block muted">(morar, investir, quitar financiamento, construir ou reformar)</span>
                            </li>
                            <li>
                                Qual faixa de carta faz sentido para esse objetivo?
                            </li>
                            <li>
                                Qual parcela mensal você consegue pagar com tranquilidade?
                            </li>
                            <li>
                                Existe alguma reserva disponível para lance ou capacidade de formar uma?
                            </li>
                        </ol>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="text-sm font-semibold">
                            Um ponto importante antes de avançar
                        </div>
                        <p className="mt-2 small muted">
                            Não existe “melhor consórcio” de forma genérica.
                            Existe o consórcio certo para o seu objetivo, seu prazo e sua disciplina financeira.
                        </p>
                        <p className="mt-2 small muted">
                            É exatamente isso que analisamos no diagnóstico consultivo.
                        </p>
                    </div>

                    <div className="mt-6 avoid-break rounded-2xl border border-sky-200 bg-sky-50 p-5">
                        <div className="text-sm font-semibold text-sky-950">
                            Mensagem pronta para facilitar o próximo passo
                        </div>

                        <p className="mt-3 small text-sky-950">
                            Se quiser avançar, você pode copiar e enviar a mensagem abaixo:
                        </p>

                        <p className="mt-3 small italic text-slate-700">
                            “Olá! Li o Guia Estratégico do Consórcio Imobiliário e quero montar
                            um plano alinhado ao meu objetivo. Meu objetivo é ________.
                            Minha faixa de carta é ________.
                            Consigo pagar até R$ ________/mês e tenho reserva de R$ ________.
                            Podemos analisar uma estratégia responsável?”
                        </p>
                    </div>

                    <div className="mt-8 small muted">
                        <b>Uso exclusivo.</b>
                        Este material é personalizado para {nome} e não deve ser divulgado,
                        redistribuído ou utilizado para fins comerciais sem autorização expressa de {org}.
                    </div>
                </section>
            </div>
        </div>
        </body>
        </html>
    );
}
