"use client";

import { Pill } from "./Pill";

type Interest = {
    produto?: string | null;
    valorTotal?: string | null;
    prazoMeses?: number | null;
    objetivo?: string | null;
    perfilDesejado?: string | null;
    observacao?: string | null;
};

type LeadForSummary = {
    id: string;
    nome: string | null;
    etapa: string;
    valor_interesse?: string | null; // legado
    prazo_meses?: number | null;     // legado
    interest_summary?: string | null;
    interest?: Interest | null;
};

export function InterestSummaryRow({ lead }: { lead: LeadForSummary }) {
    const i = lead.interest;
    const produto = i?.produto ?? null;
    const prazo = i?.prazoMeses ?? lead.prazo_meses ?? null;
    const valor = i?.valorTotal ?? lead.valor_interesse ?? null;
    const objetivo = i?.objetivo ?? null;
    const perfil = i?.perfilDesejado ?? null;
    const resumo = lead.interest_summary ?? null;

    const hasChips = produto || prazo || valor || objetivo || perfil;

    if (!hasChips && !resumo) return null;

    return (
        <div className="mt-2 space-y-1">
            {hasChips && (
                <div className="flex flex-wrap items-center gap-1">
                    {produto && <Pill>{produto}</Pill>}
                    {prazo && <Pill title="Prazo (meses)">{prazo}m</Pill>}
                    {valor && <Pill title="Valor total">{formatReaisInteiro(valor)}</Pill>}
                    {objetivo && <Pill title="Objetivo">{objetivo}</Pill>}
                    {perfil && <Pill title="Perfil">{perfil}</Pill>}
                </div>
            )}

            {!hasChips && resumo && (
                <p className="text-[11px] text-slate-300/90">{resumo}</p>
            )}
        </div>
    );
}

/** Formata inteiro em reais (250000 -> "R$ 250.000") */
function formatReaisInteiro(v: string | number | null | undefined) {
    const d = String(v ?? "").replace(/[^\d]/g, "");
    if (!d) return "";
    return `R$ ${d.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
