import {
  BadgePercent,
  Calculator,
  FileBadge2,
  HandCoins,
  Shield,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { DeepPartial } from "react-hook-form";

import { ContratoFormSummaryItem } from "./contrato-form-summary-item";
import type { ContratoFormMode, ContratoFormValues } from "../../types/contrato-form.types";
import { calculateCartaFinancialSnapshot } from "../../utils/financial-calculations";

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
  mode: ContratoFormMode;
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
  mode,
  values,
  administradoraNome,
  parceiroNome,
  className,
}: Props) {
  const fixosAtivos = (values.opcoesLanceFixo ?? []).filter(
    (item) => item?.ativo && item.percentual != null,
  );
  const financialSnapshot = calculateCartaFinancialSnapshot({
    valorCarta: values.valorCarta,
    prazo: values.prazo,
    taxaAdminPercentual: values.taxaAdminPercentual ?? null,
    taxaAdminValorMensal: values.taxaAdminValorMensal ?? null,
    fundoReservaPercentual: values.fundoReservaPercentual ?? null,
    fundoReservaValorMensal: values.fundoReservaValorMensal ?? null,
    seguroPrestamistaAtivo: Boolean(values.seguroPrestamistaAtivo),
    seguroPrestamistaPercentual: values.seguroPrestamistaPercentual ?? null,
    seguroPrestamistaValorMensal: values.seguroPrestamistaValorMensal ?? null,
    taxaAdminAntecipadaValorTotal: values.taxaAdminAntecipadaValorTotal ?? null,
    parcelaReduzida: Boolean(values.parcelaReduzida),
    percentualReducao: values.percentualReducao ?? null,
    valorParcelaSemRedutor: values.valorParcelaSemRedutor ?? null,
  });

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
        <ContratoFormSummaryItem
          label="Modo do fluxo"
          value={mode === "fromLead" ? "Nova venda (fromLead)" : "Cadastro existente (registerExisting)"}
        />
        <ContratoFormSummaryItem label="Administradora" value={administradoraNome} />
        <ContratoFormSummaryItem label="Grupo" value={values.grupoCodigo || "—"} />
        <ContratoFormSummaryItem label="Cota" value={values.numeroCota || "—"} />
        <ContratoFormSummaryItem label="Produto" value={values.produto || "—"} />
        <ContratoFormSummaryItem label="Contrato" value={values.numeroContrato || "—"} />
        <ContratoFormSummaryItem
          label="Assinatura"
          value={values.dataAssinatura || "—"}
        />
        <ContratoFormSummaryItem label="Valor da carta" value={formatMoneyBR(values.valorCarta)} />
        <ContratoFormSummaryItem label="Valor da parcela" value={formatMoneyBR(values.valorParcela)} />
        <ContratoFormSummaryItem label="Prazo" value={values.prazo ? `${values.prazo} meses` : "—"} />
        <ContratoFormSummaryItem
          label="Assembleia"
          value={values.assembleiaDia ? `Dia ${values.assembleiaDia}` : "—"}
        />
        <ContratoFormSummaryItem
          label="Data de adesão"
          value={values.dataAdesao || "—"}
        />
        <ContratoFormSummaryItem
          label="Taxa administrativa"
          value={
            values.taxaAdminValorMensal != null
              ? formatMoneyBR(values.taxaAdminValorMensal)
              : formatPercentBR(values.taxaAdminPercentual)
          }
        />
        <ContratoFormSummaryItem
          label="Taxa administrativa total"
          value={formatMoneyBR(financialSnapshot.taxaAdministrativaTotal)}
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
          label="Fundo de reserva total"
          value={formatMoneyBR(financialSnapshot.fundoReservaTotal)}
        />
        <ContratoFormSummaryItem
          label="Base total da carta"
          value={formatMoneyBR(financialSnapshot.baseTotalCarta)}
        />
        <ContratoFormSummaryItem
          label="Parcela cheia sem redutor"
          value={formatMoneyBR(financialSnapshot.parcelaCheiaSemRedutor)}
        />
        <ContratoFormSummaryItem
          label="Parcela com redutor (estimada)"
          value={
            values.parcelaReduzida
              ? formatMoneyBR(financialSnapshot.parcelaComRedutorEstimada)
              : "—"
          }
        />
        <ContratoFormSummaryItem
          label="Custo total estimado"
          value={formatMoneyBR(financialSnapshot.custoTotalEstimado)}
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
          label="Taxa adm. antecipada"
          value={
            values.taxaAdminAntecipadaAtivo
              ? values.taxaAdminAntecipadaFormaPagamento === "parcelado"
                ? `${values.taxaAdminAntecipadaParcelas ?? "—"}x de ${formatMoneyBR(values.taxaAdminAntecipadaValorParcela)}`
                : formatMoneyBR(values.taxaAdminAntecipadaValorTotal)
              : "Não possui"
          }
        />
        <ContratoFormSummaryItem
          label="Base usada no redutor"
          value={
            values.parcelaReduzida
              ? financialSnapshot.usaParcelaCheiaInformada
                ? "Parcela cheia informada manualmente"
                : "Parcela cheia calculada pela carta"
              : "—"
          }
        />
        <ContratoFormSummaryItem label="Lance fixo" value={fixosAtivos.length ? `${fixosAtivos.length} modalidade(s)` : "Não possui"} />
        <ContratoFormSummaryItem label="Comissão da carta" value={formatPercentBR(values.percentualComissao)} />
        <ContratoFormSummaryItem label="Parceiro" value={parceiroNome} />
        <ContratoFormSummaryItem label="Repasse parceiro" value={values.parceiroId ? formatPercentBR(values.repassePercentualComissao, "% da comissão") : "Sem parceiro"} />
        {mode === "registerExisting" ? (
          <>
            <ContratoFormSummaryItem
              label="Status inicial do contrato"
              value={values.contractStatus || "—"}
            />
            <ContratoFormSummaryItem
              label="Situação inicial da cota"
              value={values.cotaSituacao || "—"}
            />
          </>
        ) : (
          <>
            <ContratoFormSummaryItem label="Status inicial do contrato" value="Fluxo comercial padrão" />
            <ContratoFormSummaryItem label="Situação inicial da cota" value="Ativa" />
          </>
        )}
      </div>

      <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <FileBadge2 className="h-4 w-4 text-emerald-300" />
          Leitura final antes de salvar
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Revise carta, contrato, modo atual e estados iniciais antes de concluir. No modo{" "}
          <span className="text-slate-200">{mode === "fromLead" ? "fromLead" : "registerExisting"}</span>, o
          frontend mantém separadas as camadas de contrato e cota para não misturar formalização com operação.
        </p>
        {(financialSnapshot.parcelaReduzidaPodeVariar || financialSnapshot.prestamistaPodeVariar) ? (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Valores com redutor e prestamista devem ser lidos como estimados e sujeitos a variação quando a regra exata da administradora ainda não estiver modelada no sistema.
          </p>
        ) : null}
      </div>
    </div>
  );
}
