export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { getParceiroExtratoAction } from "../../../actions";
import type { ComissaoLancamento } from "@/app/app/comissoes/types";
import { RepasseDocument, type LinhaDoc } from "./RepasseDocument";

type PageProps = { params: Promise<{ parceiroId: string }> };

const mesVigente = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const monthKey = (iso?: string | null) => (iso || "").slice(0, 7);
const monthLabel = (key: string) => {
    if (!key) return "—";
    const [y, m] = key.split("-");
    const s = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(Number(y), Number(m) - 1, 1));
    return s.charAt(0).toUpperCase() + s.slice(1);
};
const dateLabel = (iso?: string | null) => {
    if (!iso) return null;
    try {
        return new Intl.DateTimeFormat("pt-BR").format(new Date(iso));
    } catch {
        return null;
    }
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
    const mes = mesVigente();

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
            valor: Number(it.valor_liquido || 0),
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

    const agora = new Date();
    const emitidoEm = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(agora);
    const voltarHref = `/app/parceiros/${parceiroId}`;
    const carimbo = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}_${String(agora.getHours()).padStart(2, "0")}${String(agora.getMinutes()).padStart(2, "0")}`;
    const nomeSanitizado = (parceiro.nome || "parceiro").replace(/[\\/:*?"<>|]+/g, "").trim();
    const docTitleBase = `Repasses - ${nomeSanitizado} - ${mes} - ${carimbo}`;

    return (
        <div style={{ background: "#eef0f2" }} className="h-full overflow-y-auto p-4 text-neutral-900">
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #repasse-print, #repasse-print * { visibility: visible !important; }
                    #repasse-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; margin: 0 !important; }
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
                docTitleBase={docTitleBase}
                aPagar={aPagar}
                pagos={pagos}
            />
        </div>
    );
}
