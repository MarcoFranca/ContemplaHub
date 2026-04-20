import type { ContratoFormValues } from "../types/contrato-form.types";

type FinancialInputs = Pick<
  ContratoFormValues,
  | "valorCarta"
  | "prazo"
  | "taxaAdminPercentual"
  | "taxaAdminValorMensal"
  | "fundoReservaPercentual"
  | "fundoReservaValorMensal"
  | "seguroPrestamistaAtivo"
  | "seguroPrestamistaPercentual"
  | "seguroPrestamistaValorMensal"
  | "taxaAdminAntecipadaValorTotal"
  | "parcelaReduzida"
  | "percentualReducao"
  | "valorParcelaSemRedutor"
>;

function isValidNumber(value?: number | null): value is number {
  return value != null && Number.isFinite(value);
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function resolveComponentEstimate(params: {
  percentual?: number | null;
  mensal?: number | null;
  base?: number | null;
  prazo?: number | null;
}) {
  const { percentual, mensal, base, prazo } = params;

  if (isValidNumber(percentual) && isValidNumber(base)) {
    return roundCurrency((base * percentual) / 100);
  }

  if (isValidNumber(mensal) && isValidNumber(prazo) && prazo > 0) {
    return roundCurrency(mensal * prazo);
  }

  return null;
}

export function calculateCartaFinancialSnapshot(values: FinancialInputs) {
  const taxaAdministrativaTotal = resolveComponentEstimate({
    percentual: values.taxaAdminPercentual,
    mensal: values.taxaAdminValorMensal,
    base: values.valorCarta,
    prazo: values.prazo,
  });

  const fundoReservaTotal = resolveComponentEstimate({
    percentual: values.fundoReservaPercentual,
    mensal: values.fundoReservaValorMensal,
    base: values.valorCarta,
    prazo: values.prazo,
  });

  const seguroPrestamistaTotalEstimado = values.seguroPrestamistaAtivo
    ? resolveComponentEstimate({
        percentual: values.seguroPrestamistaPercentual,
        mensal: values.seguroPrestamistaValorMensal,
        base: values.valorCarta,
        prazo: values.prazo,
      })
    : null;

  const baseTotalCarta =
    isValidNumber(values.valorCarta)
      ? roundCurrency(
          values.valorCarta +
            (taxaAdministrativaTotal ?? 0) +
            (fundoReservaTotal ?? 0),
        )
      : null;

  const parcelaCheiaSemRedutor =
    isValidNumber(baseTotalCarta) &&
    isValidNumber(values.prazo) &&
    values.prazo > 0
      ? roundCurrency(baseTotalCarta / values.prazo)
      : null;

  const parcelaCheiaReferencia =
    isValidNumber(values.valorParcelaSemRedutor)
      ? values.valorParcelaSemRedutor
      : parcelaCheiaSemRedutor;

  const parcelaComRedutorEstimada =
    values.parcelaReduzida &&
    isValidNumber(values.percentualReducao) &&
    isValidNumber(parcelaCheiaReferencia)
      ? roundCurrency(
          parcelaCheiaReferencia * (1 - values.percentualReducao / 100),
        )
      : null;

  const custoTotalEstimado =
    isValidNumber(values.valorCarta)
      ? roundCurrency(
          values.valorCarta +
            (taxaAdministrativaTotal ?? 0) +
            (fundoReservaTotal ?? 0) +
            (seguroPrestamistaTotalEstimado ?? 0) +
            (values.taxaAdminAntecipadaValorTotal ?? 0),
        )
      : null;

  return {
    taxaAdministrativaTotal,
    fundoReservaTotal,
    seguroPrestamistaTotalEstimado,
    baseTotalCarta,
    parcelaCheiaSemRedutor,
    parcelaCheiaReferencia,
    parcelaComRedutorEstimada,
    custoTotalEstimado,
    usaParcelaCheiaInformada:
      isValidNumber(values.valorParcelaSemRedutor) &&
      values.parcelaReduzida,
    prestamistaPodeVariar: Boolean(values.seguroPrestamistaAtivo),
    parcelaReduzidaPodeVariar: Boolean(values.parcelaReduzida),
  };
}
