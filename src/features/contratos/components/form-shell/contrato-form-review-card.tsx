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
    values: Partial<ContratoFormValues>;
    administradoraNome: string;
    parceiroNome: string;
    className?: string;
}

export function ContratoFormReviewCard({
                                           values,
                                           administradoraNome,
                                           parceiroNome,
                                           className,
                                       }: Props) {
    return (
        <div className={className}>
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                    Revisão antes de salvar
                </h3>
                <p className="text-sm leading-6 text-slate-400">
                    Confira os principais dados da operação antes de concluir o cadastro.
                </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
                <ContratoFormSummaryItem
                    label="Administradora"
                    value={administradoraNome}
                />
                <ContratoFormSummaryItem
                    label="Grupo"
                    value={values.grupoCodigo || "—"}
                />
                <ContratoFormSummaryItem
                    label="Cota"
                    value={values.numeroCota || "—"}
                />
                <ContratoFormSummaryItem
                    label="Contrato"
                    value={values.numeroContrato || "—"}
                />
                <ContratoFormSummaryItem
                    label="Valor da carta"
                    value={formatMoneyBR(values.valorCarta)}
                />
                <ContratoFormSummaryItem
                    label="Prazo"
                    value={values.prazo ? `${values.prazo} meses` : "—"}
                />
                <ContratoFormSummaryItem
                    label="Comissão da carta"
                    value={formatPercentBR(values.percentualComissao)}
                />
                <ContratoFormSummaryItem
                    label="Imposto parceiro"
                    value={formatPercentBR(values.impostoRetidoPct)}
                />
                <ContratoFormSummaryItem
                    label="Parceiro"
                    value={parceiroNome}
                />
                <ContratoFormSummaryItem
                    label="Repasse parceiro"
                    value={
                        values.parceiroId
                            ? formatPercentBR(
                                values.repassePercentualComissao,
                                "% da comissão"
                            )
                            : "Sem parceiro"
                    }
                />
            </div>
        </div>
    );
}