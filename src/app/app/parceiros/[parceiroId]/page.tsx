export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getParceiroExtratoAction, listPartnerUsersAction } from "../actions";
import type { ComissaoLancamento } from "../../comissoes/types";

type PageProps = {
  params: Promise<{ parceiroId: string }>;
};

const money = (v: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

const mes = (iso?: string | null) => {
  if (!iso) return "—";
  const [y, m] = iso.split("-");
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(
    new Date(Number(y), Number(m) - 1, 1)
  );
};

const formatPhone = (value?: string | null) => {
  if (!value) return "Sem telefone";
  const d = value.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return value;
};

const REPASSE_BADGE: Record<string, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  pago: { label: "Pago", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  cancelado: { label: "Cancelado", cls: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
  nao_aplicavel: { label: "—", cls: "border-white/10 bg-white/5 text-muted-foreground" },
};

type CartaResumo = {
  cota_id: string;
  cliente_nome: string;
  numero_cota: string;
  grupo_codigo: string;
  contrato_id: string;
  contrato_numero: string;
  lancamentos: number;
  totalLiquido: number;
  pendentes: number;
};

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

  // ── Derivações do panorama ───────────────────────────────────────────────
  const clientes = new Set(items.map((i) => i.cliente_nome).filter(Boolean));
  const cartasMap = new Map<string, CartaResumo>();

  let totalLiquido = 0;
  let totalLiquidoPendente = 0;
  let totalLiquidoPago = 0;
  let repassesPendentes = 0;
  let repassesPagos = 0;

  for (const it of items) {
    const liquido = Number(it.valor_liquido || 0);
    totalLiquido += liquido;
    if (it.repasse_status === "pendente") {
      totalLiquidoPendente += liquido;
      repassesPendentes += 1;
    } else if (it.repasse_status === "pago") {
      totalLiquidoPago += liquido;
      repassesPagos += 1;
    }

    const key = it.cota_id;
    const carta =
      cartasMap.get(key) ??
      (cartasMap.set(key, {
        cota_id: key,
        cliente_nome: it.cliente_nome || "Cliente sem nome",
        numero_cota: it.numero_cota || "—",
        grupo_codigo: it.grupo_codigo || "—",
        contrato_id: it.contrato_id,
        contrato_numero: it.contrato_numero || "Sem contrato",
        lancamentos: 0,
        totalLiquido: 0,
        pendentes: 0,
      }),
      cartasMap.get(key)!);
    carta.lancamentos += 1;
    carta.totalLiquido += liquido;
    if (it.repasse_status === "pendente") carta.pendentes += 1;
  }

  const cartas = Array.from(cartasMap.values()).sort((a, b) => b.totalLiquido - a.totalLiquido);
  const extratoOrdenado = [...items].sort((a, b) =>
    (b.competencia_prevista || "").localeCompare(a.competencia_prevista || "")
  );

  const kpis = [
    { label: "Clientes", value: String(clientes.size), icon: Users, hint: "clientes distintos com repasse" },
    { label: "Cartas", value: String(cartas.length), icon: CreditCard, hint: "cotas vinculadas" },
    { label: "Repasse total (líquido)", value: money(totalLiquido), icon: Wallet, hint: `${items.length} lançamentos` },
    { label: "A pagar", value: money(totalLiquidoPendente), icon: Clock, hint: `${repassesPendentes} pendente${repassesPendentes !== 1 ? "s" : ""}` },
    { label: "Já pago", value: money(totalLiquidoPago), icon: CheckCircle2, hint: `${repassesPagos} repasse${repassesPagos !== 1 ? "s" : ""}` },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <main className="space-y-6 p-6">
        {/* Header */}
        <div>
          <Link
            href="/app/parceiros"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar aos parceiros
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{parceiro.nome}</h1>
            <Badge variant={parceiro.ativo ? "default" : "secondary"}>
              {parceiro.ativo ? "Ativo" : "Inativo"}
            </Badge>
            {acesso ? (
              <Badge variant={acesso.ativo ? "default" : "outline"} className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                {acesso.ativo ? "Acesso ativo" : "Acesso inativo"}
              </Badge>
            ) : (
              <Badge variant="outline">Sem acesso ao portal</Badge>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> {parceiro.email || "Sem e-mail"}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" /> {formatPhone(parceiro.telefone)}
            </span>
            {parceiro.cpf_cnpj && <span>{parceiro.cpf_cnpj}</span>}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.label} className="border-emerald-500/15">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Icon className="h-4 w-4 text-emerald-500" />
                    {k.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-semibold tabular-nums">{k.value}</div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{k.hint}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cartas vinculadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              Cartas vinculadas ({cartas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cartas.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma carta com repasse vinculada a este parceiro ainda.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/8">
                <div className="grid grid-cols-[1fr_8rem_7rem_8rem_5rem] gap-3 border-b border-white/8 bg-card/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  <span>Cliente</span>
                  <span>Grupo / Cota</span>
                  <span className="text-center">Lançamentos</span>
                  <span className="text-right">Repasse líquido</span>
                  <span className="text-center">Pend.</span>
                </div>
                {cartas.map((c) => (
                  <Link
                    key={c.cota_id}
                    href={`/app/contratos/${c.contrato_id}`}
                    className="grid grid-cols-[1fr_8rem_7rem_8rem_5rem] items-center gap-3 border-b border-white/5 px-4 py-2.5 text-sm transition-colors last:border-0 hover:bg-white/3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c.cliente_nome}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.contrato_numero}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {c.grupo_codigo} · {c.numero_cota}
                    </span>
                    <span className="text-center tabular-nums text-muted-foreground">{c.lancamentos}</span>
                    <span className="text-right font-semibold tabular-nums">{money(c.totalLiquido)}</span>
                    <span className="text-center">
                      {c.pendentes > 0 ? (
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                          {c.pendentes}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extrato de repasses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-emerald-500" />
              Extrato de repasses ({extratoOrdenado.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {extratoOrdenado.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum repasse lançado para este parceiro ainda.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/8">
                <div className="grid grid-cols-[6rem_1fr_8rem_8rem_7rem] gap-3 border-b border-white/8 bg-card/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  <span>Competência</span>
                  <span>Cliente / Cota</span>
                  <span className="text-right">Bruto</span>
                  <span className="text-right">Líquido</span>
                  <span className="text-center">Repasse</span>
                </div>
                {extratoOrdenado.map((it) => {
                  const badge = REPASSE_BADGE[it.repasse_status] ?? REPASSE_BADGE.nao_aplicavel;
                  return (
                    <div
                      key={it.id}
                      className="grid grid-cols-[6rem_1fr_8rem_8rem_7rem] items-center gap-3 border-b border-white/5 px-4 py-2.5 text-sm last:border-0"
                    >
                      <span className="text-xs capitalize text-muted-foreground">
                        {mes(it.competencia_prevista)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate">{it.cliente_nome || "Cliente sem nome"}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {it.grupo_codigo || "—"} · Cota {it.numero_cota || "—"}
                        </div>
                      </div>
                      <span className="text-right tabular-nums text-muted-foreground">{money(it.valor_bruto)}</span>
                      <span className="text-right font-semibold tabular-nums">{money(it.valor_liquido)}</span>
                      <span className="flex justify-center">
                        <Badge variant="outline" className={badge.cls}>
                          {badge.label}
                        </Badge>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
