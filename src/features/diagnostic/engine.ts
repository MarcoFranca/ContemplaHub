// src/features/diagnostic/engine.ts
import { parseMoneyBR } from "@/lib/formatters";

export type Interest = {
    produto?: string | null;
    valorTotal?: string | null;    // "250000" | "250.000" | "250.000,00"
    prazoMeses?: number | null;
    objetivo?: string | null;
    perfilDesejado?: string | null;
    observacao?: string | null;
};

export function toValorNumber(v?: string | null): number | null {
    if (!v) return null;
    const n = parseMoneyBR(v);
    if (n != null) return n;
    const digits = String(v).replace(/[^\d]/g, "");
    if (!digits) return null;
    const asNumber = Number(digits);
    return Number.isFinite(asNumber) ? asNumber : null;
}

export type ActionSuggestion = {
    id: string;
    title: string;
    detail: string;
    why: string[];    // justificativas usadas pela regra
    score: number;    // 0–100 para ranquear
};

// ——— regras declarativas (fácil manutenção) ———
type Rule = {
    id: string;
    when: (i: Interest, v: number) => boolean;
    build: (i: Interest, v: number) => ActionSuggestion;
    weight: number; // desempate/prioridade relativa
};

const R: Rule[] = [
    {
        id: "imob_alta_carta_com_lance",
        when: (i, v) =>
            i.produto === "imobiliario" && v >= 300_000 && (i.prazoMeses ?? 0) >= 120,
        build: (i, v) => ({
            id: "imob_alta_carta_com_lance",
            title: "Apresentar simulação dupla (180/200) + estratégia de lance",
            detail:
                "Mostre 2 prazos para ajustar parcela e proponha plano de lance com FGTS/recursos próprios. Agende call consultiva de 15 min.",
            why: [
                "Ticket imobiliário ≥ 300k",
                "Prazo adequado (≥120m) favorece parcela/planejamento",
            ],
            score: 85,
        }),
        weight: 2,
    },
    {
        id: "imob_renda_airbnb",
        when: (i, v) =>
            i.produto === "imobiliario" &&
            /air\s*bnb|temporad|renda/i.test(i.objetivo ?? ""),
        build: (i, v) => ({
            id: "imob_renda_airbnb",
            title: "Projeção de renda (ocupação 60–75%) + payback",
            detail:
                "Leve uma planilha simples de ocupação, taxas e payback do imóvel alvo. Compare carta na faixa (±1 degrau).",
            why: ["Objetivo indica renda/temporada"],
            score: 78,
        }),
        weight: 1,
    },
    {
        id: "auto_uso_trabalho",
        when: (i) => i.produto === "auto" && /trabalho|app|uber|99/i.test(i.objetivo ?? ""),
        build: () => ({
            id: "auto_uso_trabalho",
            title: "Carta 1 degrau acima + foco em disponibilidade",
            detail:
                "Sugira carta um nível acima do veículo-alvo para negociar melhor. Discutir seguro, manutenção e tempo de contemplação.",
            why: ["Uso de trabalho exige confiabilidade e melhor negociação"],
            score: 72,
        }),
        weight: 1,
    },
    {
        id: "desambiguar_produto",
        when: (i) => !i.produto,
        build: () => ({
            id: "desambiguar_produto",
            title: "Esclarecer produto e objetivo antes da simulação",
            detail:
                "Confirmar se é Imobiliário ou Auto e qual o objetivo principal. Em seguida, já oferecer simulação guiada.",
            why: ["Produto ausente"],
            score: 68,
        }),
        weight: 3,
    },
    {
        id: "baseline_consulta_10min",
        when: () => true,
        build: () => ({
            id: "baseline_consulta_10min",
            title: "Agendar call de 10 min com roteiro",
            detail:
                "Use roteiro curto: objetivo, prazo, recurso para lance, horizonte de uso e preferência de administradora.",
            why: ["Confirmação rápida eleva conversão"],
            score: 60,
        }),
        weight: 0,
    },
];

// ——— função pública: retorna lista ranqueada ———
export function nextBestActions(i: Interest): ActionSuggestion[] {
    const v = toValorNumber(i.valorTotal) ?? 0;
    const hits = R.filter((r) => r.when(i, v))
        .map((r) => {
            const a = r.build(i, v);
            // leve boost por weight (regras “fortes” sobem)
            return { ...a, score: Math.min(100, a.score + r.weight * 2) };
        })
        .sort((a, b) => b.score - a.score);
    // dedup por id e limita em 3 para objetividade
    const seen = new Set<string>();
    return hits.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true))).slice(0, 3);
}
