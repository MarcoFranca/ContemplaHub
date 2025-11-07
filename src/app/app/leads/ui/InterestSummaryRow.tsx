// src/app/app/leads/ui/InterestSummaryRow.tsx
"use client";

import { Pill } from "./Pill";
import {formatMoneyBR} from "@/lib/formatters";

type Lead = {
    id: string;
    nome: string | null;
    etapa: string;
    telefone?: string | null;
    email?: string | null;
    origem?: string | null;
    utm_source?: string | null;
    valor_interesse?: string | null; // legado
    prazo_meses?: number | null;     // legado
    interest?: {
        produto?: string | null;
        valorTotal?: string | null;
        prazoMeses?: number | null;
        objetivo?: string | null;
        perfilDesejado?: string | null;
        observacao?: string | null;
    } | null;
};

export function InterestSummaryRow({ lead }: { lead: Lead }) {
    const i = lead.interest;
    const produto  = i?.produto;
    const prazo    = (i?.prazoMeses ?? lead.prazo_meses) || null;
    const valor = i?.valorTotal ?? lead.valor_interesse ?? null; // valorTotal deve ser REAIS inteiros
    const objetivo = i?.objetivo ?? null;
    const perfil   = i?.perfilDesejado ?? null;

    if (!produto && !prazo && !valor && !objetivo && !perfil) return null;

    return (
        <div className="mt-2 flex flex-wrap items-center gap-1">
            {produto && <Pill>{produto}</Pill>}
            {prazo && <Pill title="Prazo (meses)">{prazo}m</Pill>}
            {valor && <Pill title="Valor total">{formatReaisInteiro(valor)}</Pill>}
            {objetivo && <Pill title="Objetivo">{objetivo}</Pill>}
            {perfil && <Pill title="Perfil">{perfil}</Pill>}
        </div>
    );
}

// /** Formata 123456 => "R$ 123.456" de forma estável (sem locale/Intl) */
// function formatMoedaBR(v: string | number) {
//     const digits = String(v).replace(/[^\d]/g, "");
//     if (!digits) return String(v);
//     const withDots = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
//     return `R$ ${withDots}`;
// }

/** Formata inteiro em reais (250000 -> "R$ 250.000") */
function formatReaisInteiro(v: string | number | null | undefined) {
    const d = String(v ?? "").replace(/[^\d]/g, "");
    if (!d) return "";
    return `R$ ${d.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

