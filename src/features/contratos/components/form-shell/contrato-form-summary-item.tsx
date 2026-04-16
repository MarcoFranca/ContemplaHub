function formatText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : "—";
}

export function ContratoFormSummaryItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100">{formatText(value)}</div>
    </div>
  );
}
