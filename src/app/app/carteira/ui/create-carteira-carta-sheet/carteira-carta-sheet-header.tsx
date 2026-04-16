import type { ClienteCartaOption } from "../CreateCarteiraCartaSheet";

export function CarteiraCartaSheetHeader({ cliente }: { cliente: ClienteCartaOption | null }) {
  if (!cliente) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Carteira</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Selecionar cliente</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Escolha um cliente da carteira para iniciar o cadastro da carta com contexto e fluidez.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div className="text-xs uppercase tracking-[0.16em] text-emerald-300">Cliente selecionado</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Cadastrar carta / contrato</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Fluxo operacional para <span className="font-medium text-slate-200">{cliente.nome}</span>.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Telefone</div>
          <div className="mt-1 text-sm font-medium text-slate-100">{cliente.telefone || "Não informado"}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">E-mail</div>
          <div className="mt-1 text-sm font-medium text-slate-100">{cliente.email || "Não informado"}</div>
        </div>
      </div>
    </div>
  );
}
