import { FileCheck2 } from "lucide-react";
import { ContratoFormSummaryItem } from "./contrato-form-summary-item";

function formatMoneyBR(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

interface Props {
  administradoraNome: string;
  grupoCodigo?: string | null;
  numeroCota?: string | null;
  numeroContrato?: string | null;
  valorCarta?: number | null;
  prazo?: number | null;
}

export function ContratoFormReviewCard(props: Props) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <FileCheck2 className="h-4 w-4 text-emerald-300" />
        Revisão antes de salvar
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Confira os principais dados da operação antes de concluir o cadastro.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <ContratoFormSummaryItem label="Administradora" value={props.administradoraNome} />
        <ContratoFormSummaryItem label="Grupo" value={props.grupoCodigo} />
        <ContratoFormSummaryItem label="Cota" value={props.numeroCota} />
        <ContratoFormSummaryItem label="Contrato" value={props.numeroContrato} />
        <ContratoFormSummaryItem label="Valor da carta" value={formatMoneyBR(props.valorCarta)} />
        <ContratoFormSummaryItem label="Prazo" value={props.prazo ? `${props.prazo} meses` : "—"} />
      </div>
    </section>
  );
}
