import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClienteCartaOption } from "../CreateCarteiraCartaSheet";

interface Props {
  clientes: ClienteCartaOption[];
  selectedClienteId: string;
  onChange: (clienteId: string) => void;
}

export function CarteiraCartaSheetClientSelector({ clientes, selectedClienteId, onChange }: Props) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Passo inicial</div>
        <h3 className="text-xl font-semibold">Escolha o cliente da carteira</h3>
        <p className="text-sm leading-6 text-slate-400">
          Assim que o cliente for escolhido, o fluxo abre já contextualizado para um cadastro mais fluido.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        <Label className="text-slate-200">Cliente</Label>
        <Select value={selectedClienteId} onValueChange={onChange}>
          <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white">
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
