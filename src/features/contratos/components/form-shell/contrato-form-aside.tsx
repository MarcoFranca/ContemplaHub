import { BadgeCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
  produto?: string | null;
  valorCarta?: number | null;
  prazo?: number | null;
  parceiroNome?: string | null;
  checklist: Array<{ label: string; ok: boolean }>;
}

export function ContratoFormAside({ checklist, ...props }: Props) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-0 space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BadgeCheck className="h-4 w-4 text-emerald-300" />
            Resumo da operação
          </div>

          <div className="mt-5 space-y-4">
            <ContratoFormSummaryItem label="Administradora" value={props.administradoraNome} />
            <ContratoFormSummaryItem label="Grupo" value={props.grupoCodigo} />
            <ContratoFormSummaryItem label="Cota" value={props.numeroCota} />
            <ContratoFormSummaryItem label="Contrato" value={props.numeroContrato} />
            <ContratoFormSummaryItem label="Produto" value={props.produto} />
            <ContratoFormSummaryItem label="Valor da carta" value={formatMoneyBR(props.valorCarta)} />
            <ContratoFormSummaryItem label="Prazo" value={props.prazo ? `${props.prazo} meses` : "—"} />
            <ContratoFormSummaryItem label="Parceiro" value={props.parceiroNome} />

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <div className="text-sm font-medium text-white">Checklist visual</div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2"
                  >
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <span className={item.ok ? "text-xs font-medium text-emerald-300" : "text-xs font-medium text-slate-500"}>
                      {item.ok ? "OK" : "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
