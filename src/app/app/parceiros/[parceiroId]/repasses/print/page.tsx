export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getParceiroExtratoAction } from "../../../actions";
import type { ComissaoLancamento } from "@/app/app/comissoes/types";
import { RepasseDocument, type LinhaDoc } from "./RepasseDocument";

type PageProps = { params: Promise<{ parceiroId: string }> };

const TZ = "America/Sao_Paulo";
// Partes de data/hora no fuso de São Paulo (evita virar o dia por conta do UTC do servidor).
const nowBR = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(new Date());
    const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return { y: g("year"), m: g("month"), d: g("day"), hh: g("hour"), mm: g("minute") };
};
const monthKey = (iso?: string | null) => (iso || "").slice(0, 7);
const monthLabel = (key: string) => {
    if (!key) return "—";
    const [y, m] = key.split("-");
    const s = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(Number(y), Number(m) - 1, 1));
    return s.charAt(0).toUpperCase() + s.slice(1);
};
// Formata a partir da porção de data (YYYY-MM-DD), sem conversão de fuso.
const dateLabel = (iso?: string | null) => {
    const d = (iso || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
    const [y, m, dd] = d.split("-");
    return `${dd}/${m}/${y}`;
};
const isAtraso = (it: ComissaoLancamento) => (it.observacoes || "").includes("INADIMPLENTE");

export default async function RepassePrintPage({ params }: PageProps) {
    const { parceiroId } = await params;
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const extrato = await getParceiroExtratoAction(parceiroId).catch(() => null);
    if (!extrato?.parceiro) notFound();

    const parceiro = extrato.parceiro;
    const items: ComissaoLancamento[] = extrato.items ?? [];
    const br = nowBR();
    const mes = `${br.y}-${br.m}`;

    const { data: org } = await supabaseAdmin.from("orgs").select("nome").eq("id", me.orgId).maybeSingle();

    // Parcela X de Y por cota (não conta puladas: parcelas puladas não têm lançamento).
    const naoCanceladas = items.filter((it) => it.status !== "cancelado");
    const parcelaInfo = new Map<string, string>(); // lancamento.id -> "X/Y"
    const porCota = new Map<string, ComissaoLancamento[]>();
    for (const it of naoCanceladas) {
        const arr = porCota.get(it.cota_id) ?? [];
        arr.push(it);
        porCota.set(it.cota_id, arr);
    }
    for (const arr of porCota.values()) {
        const ordenadas = [...arr].sort((a, b) =>
            monthKey(a.competencia_prevista).localeCompare(monthKey(b.competencia_prevista)),
        );
        const total = ordenadas.length;
        ordenadas.forEach((it, i) => parcelaInfo.set(it.id, `${i + 1}/${total}`));
    }

    const toLinha = (it: ComissaoLancamento): LinhaDoc => {
        const comp = monthKey(it.competencia_prevista);
        return {
            id: it.id,
            cliente: it.cliente_nome || "Cliente sem nome",
            cota: it.numero_cota || "—",
            grupo: it.grupo_codigo || "—",
            competencia: comp,
            competenciaLabel: monthLabel(comp),
            parcela: parcelaInfo.get(it.id) ?? "—",
            valor: Number(it.valor_repasse_ajustado ?? it.valor_liquido ?? 0),
            valorSistema: Number(it.valor_liquido || 0),
            pagoEm: (it.repasse_pago_em || "").slice(0, 10) || null,
            pagoEmLabel: dateLabel(it.repasse_pago_em),
        };
    };

    // A pagar: pendentes até o mês vigente (sem inadimplentes).
    const aPagar = items
        .filter(
            (it) =>
                it.repasse_status === "pendente" &&
                it.status !== "cancelado" &&
                monthKey(it.competencia_prevista) &&
                monthKey(it.competencia_prevista) <= mes &&
                !isAtraso(it),
        )
        .map(toLinha);

    // Pagos: repasses já efetivados.
    const pagos = items.filter((it) => it.repasse_status === "pago").map(toLinha);

    const emitidoEm = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: TZ }).format(new Date());
    const voltarHref = `/app/parceiros/${parceiroId}`;
    const carimbo = `${br.y}-${br.m}-${br.d}_${br.hh}${br.mm}`;
    const nomeSanitizado = (parceiro.nome || "parceiro").replace(/[\\/:*?"<>|]+/g, "").trim();
    const docTitleBase = `Repasses - ${nomeSanitizado} - ${mes} - ${carimbo}`;

    return (
        <div style={{ background: "#eef0f2" }} className="h-full overflow-y-auto p-4 text-neutral-900">
            <style id="repasse-print-css">{`
                #repasse-print, #repasse-print * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                @media print {
                    html, body { height: auto !important; overflow: visible !important; }
                    body * { visibility: hidden !important; }
                    #repasse-print, #repasse-print * { visibility: visible !important; overflow: visible !important; }
                    #repasse-print { position: absolute; left: 0; top: 0; width: 100%; height: auto !important; box-shadow: none !important; margin: 0 !important; }
                    .no-print { display: none !important; }
                    @page { margin: 16mm; }
                }
            `}</style>

            <RepasseDocument
                parceiroNome={parceiro.nome}
                cpfCnpj={parceiro.cpf_cnpj}
                orgNome={org?.nome ?? "ContemplaHub"}
                emitidoEm={emitidoEm}
                mesLabel={monthLabel(mes)}
                voltarHref={voltarHref}
                parceiroId={parceiroId}
                docTitleBase={docTitleBase}
                aPagar={aPagar}
                pagos={pagos}
            />
        </div>
    );
}
