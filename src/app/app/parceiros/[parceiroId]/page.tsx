export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, ShieldCheck, Users } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/server";
import { Badge } from "@/components/ui/badge";
import { getParceiroExtratoAction, listPartnerUsersAction } from "../actions";
import type { ComissaoLancamento } from "../../comissoes/types";
import {
    ParceiroRepasses,
    HistoricoRepasses,
    type RepasseItem,
    type ClienteGrupo,
} from "./ParceiroRepasses";
import { CartasVisao, type CartaTimeline, type CellStatus } from "./CartasVisao";

type PageProps = { params: Promise<{ parceiroId: string }> };

const formatPhone = (value?: string | null) => {
    if (!value) return "Sem telefone";
    const d = value.replace(/\D/g, "");
    if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    return value;
};

const mesVigente = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const compMonth = (it: ComissaoLancamento) => (it.competencia_prevista || "").slice(0, 7);
const isAtraso = (it: ComissaoLancamento) => (it.observacoes || "").includes("INADIMPLENTE");
const toLite = (it: ComissaoLancamento): RepasseItem => ({
    id: it.id,
    cliente_nome: it.cliente_nome || "Cliente sem nome",
    numero_cota: it.numero_cota || "—",
    grupo_codigo: it.grupo_codigo || "—",
    contrato_id: it.contrato_id,
    competencia: it.competencia_prevista ?? null,
    valor: Number(it.valor_liquido || 0),
});

export default async function ParceiroDetalhePage({ params }: PageProps) {
    const { parceiroId } = await params;
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    const [extrato, acessos] = await Promise.all([
        getParceiroExtratoAction(parceiroId).catch(() => null),
        listPartnerUsersAction().catch(() => []),
    ]);

    if (!extrato?.parceiro) notFound();

    const parceiro = extrato.parceiro;
    const acesso = acessos.find((a) => a.parceiro_id === parceiroId);
    const items: ComissaoLancamento[] = extrato.items ?? [];
    const mes = mesVigente();
    const refreshPath = `/app/parceiros/${parceiroId}`;

    // Até o mês vigente, pendentes (nada de futuro)
    const atabular = items.filter(
        (it) =>
            it.repasse_status === "pendente" &&
            it.status !== "cancelado" &&
            compMonth(it) !== "" &&
            compMonth(it) <= mes,
    );
    const aPagarItems = atabular.filter((it) => !isAtraso(it));
    const emAtraso = atabular.filter(isAtraso).map(toLite);
    const pagos = items.filter((it) => it.repasse_status === "pago").map(toLite);

    // Agrupa "a pagar" por cliente
    const mapa = new Map<string, ClienteGrupo>();
    for (const it of aPagarItems) {
        const nome = it.cliente_nome || "Cliente sem nome";
        const g = mapa.get(nome) ?? { cliente_nome: nome, total: 0, items: [] };
        const lite = toLite(it);
        g.items.push(lite);
        g.total += lite.valor;
        mapa.set(nome, g);
    }
    const aPagar = Array.from(mapa.values()).sort((a, b) => b.total - a.total);
    const totalAPagar = aPagar.reduce((s, g) => s + g.total, 0);
    const qtdAPagar = aPagarItems.length;

    // Visão das cartas (timeline por cota, todos os meses)
    const cellStatus = (it: ComissaoLancamento): CellStatus => {
        if (it.repasse_status === "pago") return "pago";
        if (isAtraso(it)) return "atrasado";
        const mk = compMonth(it);
        if (mk && mk < mes) return "atrasado";
        if (mk === mes) return "pendente";
        return "a_receber";
    };
    const cartaMapa = new Map<string, CartaTimeline>();
    for (const it of items) {
        if (it.repasse_status === "cancelado" || it.status === "cancelado") continue;
        const c =
            cartaMapa.get(it.cota_id) ??
            ({
                cota_id: it.cota_id,
                cliente_nome: it.cliente_nome || "Cliente sem nome",
                numero_cota: it.numero_cota || "—",
                grupo_codigo: it.grupo_codigo || "—",
                cells: [],
            } as CartaTimeline);
        c.cells.push({ mes: compMonth(it), valor: Number(it.valor_liquido || 0), status: cellStatus(it) });
        cartaMapa.set(it.cota_id, c);
    }
    const cartas = Array.from(cartaMapa.values())
        .map((c) => ({ ...c, cells: c.cells.sort((a, b) => a.mes.localeCompare(b.mes)) }))
        .sort((a, b) => a.cliente_nome.localeCompare(b.cliente_nome));

    const clientesVinculados = new Set(items.map((i) => i.cliente_nome).filter(Boolean)).size;
    const clientesComRepasse = new Set(
        [...aPagarItems, ...atabular.filter(isAtraso)].map((i) => i.cliente_nome).filter(Boolean),
    ).size;

    return (
        <div className="h-full overflow-y-auto">
            <main className="mx-auto max-w-4xl space-y-6 p-6">
                {/* Header */}
                <div>
                    <Link href="/app/parceiros" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar aos parceiros
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold">{parceiro.nome}</h1>
                        <Badge variant={parceiro.ativo ? "default" : "secondary"}>{parceiro.ativo ? "Ativo" : "Inativo"}</Badge>
                        {acesso ? (
                            <Badge variant={acesso.ativo ? "default" : "outline"} className="gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                {acesso.ativo ? "Acesso ativo" : "Acesso inativo"}
                            </Badge>
                        ) : (
                            <Badge variant="outline">Sem acesso ao portal</Badge>
                        )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {parceiro.email || "Sem e-mail"}</span>
                        <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {formatPhone(parceiro.telefone)}</span>
                        <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" /> {clientesVinculados} cliente{clientesVinculados !== 1 ? "s" : ""}
                            {clientesComRepasse > 0 ? ` · ${clientesComRepasse} com repasse` : ""}
                        </span>
                    </div>
                </div>

                {/* Repasses (o foco) */}
                <ParceiroRepasses
                    refreshPath={refreshPath}
                    aPagar={aPagar}
                    emAtraso={emAtraso}
                    totalAPagar={totalAPagar}
                    qtdAPagar={qtdAPagar}
                />

                {/* Visão das cartas (panorama visual, recolhível) */}
                <CartasVisao cartas={cartas} />

                {/* Histórico */}
                <HistoricoRepasses pagos={pagos} />
            </main>
        </div>
    );
}
