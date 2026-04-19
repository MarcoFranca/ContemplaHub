import type { ReactNode } from "react";

interface Props {
  label: string;
  value?: ReactNode;
}

export function ContratoFormSummaryItem({ label, value }: Props) {
  return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
          {label}
        </div>
        <div className="mt-1 text-sm font-medium text-slate-100">
          {value ?? "—"}
        </div>
      </div>
  );
}
