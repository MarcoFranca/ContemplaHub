import { PRODUTOS, type SimuladorInput, type SimuladorResultado } from "./consorcio";
import type { ComparativoInput, ComparativoResultado } from "./comparativo";
import { brl, pct, meses } from "./format";

type PdfMeta = {
    clienteNome?: string;
    organizacaoNome?: string;
};

function esc(s: string) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function row(label: string, value: string, strong = false) {
    return `<tr><td class="lbl">${esc(label)}</td><td class="val${
        strong ? " strong" : ""
    }">${esc(value)}</td></tr>`;
}

function section(title: string, rows: string) {
    return `<section><h2>${esc(title)}</h2><table>${rows}</table></section>`;
}

export function buildSimulacaoHtml(
    input: SimuladorInput,
    r: SimuladorResultado,
    meta: PdfMeta = {}
): string {
    const config = PRODUTOS[input.produto];
    const tipo = input.tipoContratacao === "fisica" ? "Pessoa Física" : "Pessoa Jurídica";
    const redutorTxt =
        input.redutor === "campanha"
            ? "Campanha Parcela Original"
            : pct(input.redutor);
    const data = new Date().toLocaleDateString("pt-BR");

    const dadosCarta = [
        row("Crédito contratado", brl(input.creditoContratado), true),
        row("Tipo de contratação", tipo),
        row("Prazo total", meses(input.prazoTotal)),
        row("Redutor do grupo", redutorTxt),
    ].join("");

    const parcelas = [
        config.temAdesao
            ? row(
                  `${r.adesaoQtdParcelas} primeiras parcelas`,
                  `${brl(r.primeirasParcelas)} (inclui adesão de ${brl(r.adesaoParcela)})`
              )
            : "",
        row(
            r.temReducao ? "Parcela reduzida (demais)" : "Parcela",
            brl(r.parcelaReduzida),
            true
        ),
        r.temReducao ? row("Parcela integral", brl(r.parcelaIntegral)) : "",
        r.temReducao ? row("Economia mensal", brl(r.economiaMensal)) : "",
    ]
        .filter(Boolean)
        .join("");

    const lance = [
        row("Recurso próprio", brl(input.recursoProprio)),
        config.permiteFgts ? row("FGTS", brl(input.fgts)) : "",
        row("Lance embutido", brl(input.lanceEmbutido)),
        row("Total do lance", brl(r.totalLance), true),
        row("Representatividade do lance", pct(r.representatividadeLance)),
        row(`Embutido máximo (${pct(config.embutidoMaxPct)})`, brl(r.embutidoMaximo)),
    ]
        .filter(Boolean)
        .join("");

    const lancePct = input.lancePercentualDesejado > 0
        ? [
              row(`Lance desejado (${pct(input.lancePercentualDesejado)})`, "", true),
              row("Total necessário", brl(r.lanceDesejadoTotal)),
              row(
                  "Usando o embutido",
                  r.lanceDesejadoComEmbutido > 0
                      ? brl(r.lanceDesejadoComEmbutido)
                      : `${brl(0)} (embutido cobre)`
              ),
          ].join("")
        : "";

    const pos = [
        row("Contemplação na parcela", `${input.contemplacaoParcela}ª`),
        row("Crédito liberado", brl(r.creditoLiberado), true),
        row("— Reduzindo a parcela —", ""),
        row("Nova parcela", brl(r.reduzirParcela_novaParcela), true),
        row("Novo prazo", meses(r.reduzirParcela_novoPrazo)),
        row("— Reduzindo somente o prazo —", ""),
        row("Parcela mantida", brl(r.reduzirPrazo_parcela)),
        row("Novo prazo", meses(r.reduzirPrazo_novoPrazo), true),
    ].join("");

    const titulo = `Simulação de Consórcio — ${esc(config.label)}`;
    const cliente = meta.clienteNome ? `<p class="cliente">Cliente: <strong>${esc(meta.clienteNome)}</strong></p>` : "";
    const org = meta.organizacaoNome ? esc(meta.organizacaoNome) : "ContemplaHub";

    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<title>${titulo}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #0f172a; margin: 32px; }
  header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 18px; }
  header .org { font-size: 18px; font-weight: 700; color: #059669; }
  header .data { font-size: 12px; color: #64748b; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .cliente { margin: 2px 0 18px; font-size: 14px; color: #334155; }
  section { margin-bottom: 18px; break-inside: avoid; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #059669; margin: 0 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 8px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
  td.lbl { color: #475569; }
  td.val { text-align: right; }
  td.strong, .strong { font-weight: 700; color: #0f172a; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  footer { margin-top: 24px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  @media print { body { margin: 16px; } @page { margin: 14mm; } }
</style></head>
<body>
  <header><span class="org">${org}</span><span class="data">${data}</span></header>
  <h1>${titulo}</h1>
  ${cliente}
  ${section("Dados da carta", dadosCarta)}
  <div class="cols">
    ${section("Parcelas", parcelas)}
    ${section("Oferta de lance", lance + lancePct)}
  </div>
  ${section("Estimativa pós-contemplação", pos)}
  <footer>Os valores desta simulação são mera referência e buscam refletir o cenário mais próximo possível da realidade. Sujeito à disponibilidade de vagas no grupo.</footer>
</body></html>`;
}

function openHtml(html: string) {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return false;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
    return true;
}

const PRODUTO_LABEL: Record<string, string> = {
    imovel: "Imóvel",
    auto: "Automóvel",
    pesados: "Pesados",
};

export function buildComparativoHtml(
    input: ComparativoInput,
    r: ComparativoResultado,
    meta: PdfMeta = {}
): string {
    const data = new Date().toLocaleDateString("pt-BR");
    const tipo = input.tipoContratacao === "fisica" ? "Pessoa Física" : "Pessoa Jurídica";
    const sistema = input.sistema === "price" ? "Price (parcela fixa)" : "SAC (decrescente)";
    const ganhouConsorcio = r.economia > 0;

    const dados = [
        row("Bem / crédito", brl(input.valorBem), true),
        row("Prazo", meses(input.prazo)),
        row("Contratação", tipo),
        row("Produto (consórcio)", PRODUTO_LABEL[input.produto] ?? input.produto),
        row("Financiamento", `${sistema} · ${pct(input.taxaMensal)} a.m. · entrada ${brl(input.entrada)}`),
    ].join("");

    const consorcio = [
        row("Parcela", brl(r.consorcio.parcela), true),
        row("Custo total", brl(r.consorcio.custoTotal), true),
        row("Custo extra sobre o bem", `${brl(r.consorcio.custoExtra)} (${pct(r.consorcio.custoExtraPct)})`),
        row("Acesso ao bem", "Na contemplação (sorteio/lance)"),
    ].join("");

    const fin = [
        row("Parcela inicial", brl(r.financiamento.parcelaInicial), true),
        row("Parcela final", brl(r.financiamento.parcelaFinal)),
        row("Custo total", brl(r.financiamento.totalPago), true),
        row("Juros pagos", `${brl(r.financiamento.totalJuros)} (${pct(r.financiamento.custoExtraPct)})`),
        row("Acesso ao bem", "Imediato"),
    ].join("");

    const conclusao = ganhouConsorcio
        ? `No consórcio você desembolsa <strong>${brl(Math.abs(r.economia))}</strong> a menos (${pct(Math.abs(r.economiaPct))}) ao final do plano.`
        : `O financiamento sai <strong>${brl(Math.abs(r.economia))}</strong> mais barato no total, em troca do acesso imediato ao bem.`;

    const cliente = meta.clienteNome
        ? `<p class="cliente">Cliente: <strong>${esc(meta.clienteNome)}</strong></p>`
        : "";
    const org = meta.organizacaoNome ? esc(meta.organizacaoNome) : "ContemplaHub";

    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<title>Comparativo Consórcio x Financiamento</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #0f172a; margin: 32px; }
  header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 18px; }
  header .org { font-size: 18px; font-weight: 700; color: #059669; }
  header .data { font-size: 12px; color: #64748b; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .cliente { margin: 2px 0 18px; font-size: 14px; color: #334155; }
  section { margin-bottom: 18px; break-inside: avoid; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #059669; margin: 0 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 8px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
  td.lbl { color: #475569; }
  td.val { text-align: right; }
  td.strong, .strong { font-weight: 700; color: #0f172a; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .destaque { margin-top: 6px; padding: 12px 14px; border-radius: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; font-size: 14px; color: #065f46; }
  footer { margin-top: 24px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  @media print { body { margin: 16px; } @page { margin: 14mm; } }
</style></head>
<body>
  <header><span class="org">${org}</span><span class="data">${data}</span></header>
  <h1>Comparativo: Consórcio x Financiamento</h1>
  ${cliente}
  ${section("Premissas", dados)}
  <div class="cols">
    ${section("Consórcio", consorcio)}
    ${section("Financiamento", fin)}
  </div>
  <div class="destaque">${conclusao}</div>
  <footer>Valores de referência. Consórcio sem juros, com taxas de administração e fundo de reserva; financiamento com juros conforme a taxa informada. O consórcio não dá acesso imediato ao bem.</footer>
</body></html>`;
}

export function abrirComparativoPdf(
    input: ComparativoInput,
    r: ComparativoResultado,
    meta?: PdfMeta
) {
    return openHtml(buildComparativoHtml(input, r, meta));
}

export function abrirSimulacaoPdf(
    input: SimuladorInput,
    r: SimuladorResultado,
    meta?: PdfMeta
) {
    return openHtml(buildSimulacaoHtml(input, r, meta));
}
