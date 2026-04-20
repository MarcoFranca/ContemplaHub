import {
  BadgePercent,
  Calculator,
  HandCoins,
  Shield,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { DeepPartial } from "react-hook-form";

import { ContratoFormSummaryItem } from "./contrato-form-summary-item";
import type { ContratoFormValues } from "../../types/contrato-form.types";

function formatMoneyBR(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPercentBR(value?: number | null, suffix = "%") {
  if (value == null || Number.isNaN(value)) return "—";
  return `${String(value).replace(".", ",")}${suffix}`;
}

interface Props {
  values: DeepPartial<ContratoFormValues>;
  administradoraNome: string;
  parceiroNome: string;
  className?: string;
}

function CapabilityPill({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        active
          ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-50"
          : "border-white/10 bg-white/[0.03] text-slate-400",
      ].join(" ")}
    >
      {icon}
      {label}
    </div>
  );
}

export function ContratoFormReviewCard({
  values,
  administradoraNome,
  parceiroNome,
  className,
}: Props) {
  const fixosAtivos = (values.opcoesLanceFixo ?? []).filter(
    (item) => item?.ativo && item.percentual != null,
  );

  return (
    <div className={className}>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Revisão antes de salvar</h3>
        <p className="text-sm leading-6 text-slate-400">
          Confira os principais dados da operação antes de concluir o cadastro.
        </p>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Capacidades da carta
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <CapabilityPill
            icon={<BadgePercent className="h-3.5 w-3.5" />}
            label={values.parcelaReduzida ? `Redutor ${formatPercentBR(values.percentualReducao)}` : "Sem redutor"}
            active={Boolean(values.parcelaReduzida)}
          />
          <CapabilityPill
            icon={<WalletCards className="h-3.5 w-3.5" />}
            label={values.embutidoPermitido ? `Embutido ${formatPercentBR(values.embutidoMaxPercent, "% máx.")}` : "Sem embutido"}
            active={Boolean(values.embutidoPermitido)}
          />
          <CapabilityPill
            icon={<HandCoins className="h-3.5 w-3.5" />}
            label={values.fgtsPermitido ? "FGTS permitido" : "Sem FGTS"}
            active={Boolean(values.fgtsPermitido)}
          />
          <CapabilityPill
            icon={<Shield className="h-3.5 w-3.5" />}
            label={values.autorizacaoGestao ? "Gestão autorizada" : "Sem gestão autorizada"}
            active={Boolean(values.autorizacaoGestao)}
          />
          <CapabilityPill
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label={values.seguroPrestamistaAtivo ? "Seguro prestamista ativo" : "Sem seguro prestamista"}
            active={Boolean(values.seguroPrestamistaAtivo)}
          />
          <CapabilityPill
            icon={<Calculator className="h-3.5 w-3.5" />}
            label={values.taxaAdminAntecipadaAtivo ? "Taxa antecipada ativa" : "Sem taxa antecipada"}
            active={Boolean(values.taxaAdminAntecipadaAtivo)}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <ContratoFormSummaryItem label="Administradora" value={administradoraNome} />
        <ContratoFormSummaryItem label="Grupo" value={values.grupoCodigo || "—"} />
        <ContratoFormSummaryItem label="Cota" value={values.numeroCota || "—"} />
        <ContratoFormSummaryItem label="Contrato" value={values.numeroContrato || "—"} />
        <ContratoFormSummaryItem label="Valor da carta" value={formatMoneyBR(values.valorCarta)} />
        <ContratoFormSummaryItem label="Prazo" value={values.prazo ? `${values.prazo} meses` : "—"} />
        <ContratoFormSummaryItem
          label="Assembleia"
          value={values.assembleiaDia ? `Dia ${values.assembleiaDia}` : "—"}
        />
        <ContratoFormSummaryItem
          label="Taxa adm. anual"
          value={
            values.taxaAdminValorMensal != null
              ? formatMoneyBR(values.taxaAdminValorMensal)
              : formatPercentBR(values.taxaAdminPercentual)
          }
        />
        <ContratoFormSummaryItem
          label="Fundo de reserva"
          value={
            values.fundoReservaValorMensal != null
              ? formatMoneyBR(values.fundoReservaValorMensal)
              : formatPercentBR(values.fundoReservaPercentual)
          }
        />
        <ContratoFormSummaryItem
          label="Seguro prestamista"
          value={
            values.seguroPrestamistaAtivo
              ? values.seguroPrestamistaValorMensal != null
                ? formatMoneyBR(values.seguroPrestamistaValorMensal)
                : formatPercentBR(values.seguroPrestamistaPercentual)
              : "Inativo"
          }
        />
        <ContratoFormSummaryItem
          label="Taxa antecipada"
          value={
            values.taxaAdminAntecipadaAtivo
              ? values.taxaAdminAntecipadaFormaPagamento === "parcelado"
                ? `${values.taxaAdminAntecipadaParcelas ?? "—"}x de ${formatMoneyBR(values.taxaAdminAntecipadaValorParcela)}`
                : formatMoneyBR(values.taxaAdminAntecipadaValorTotal)
              : "Não possui"
          }
        />
        <ContratoFormSummaryItem label="Parcela sem redutor" value={values.parcelaReduzida ? formatMoneyBR(values.valorParcelaSemRedutor) : "—"} />
        <ContratoFormSummaryItem label="Lance fixo" value={fixosAtivos.length ? `${fixosAtivos.length} modalidade(s)` : "Não possui"} />
        <ContratoFormSummaryItem label="Comissão da carta" value={formatPercentBR(values.percentualComissao)} />
        <ContratoFormSummaryItem label="Parceiro" value={parceiroNome} />
        <ContratoFormSummaryItem label="Repasse parceiro" value={values.parceiroId ? formatPercentBR(values.repassePercentualComissao, "% da comissão") : "Sem parceiro"} />
      </div>
    </div>
  );
}
