import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  currentIndex: number;
  total: number;
  isPending: boolean;
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  submitLabel?: string;
}

export function ContratoFormFooter({
  currentIndex,
  total,
  isPending,
  onReset,
  onPrev,
  onNext,
  submitLabel = "Cadastrar carta",
}: Props) {
  return (
    <div className="sticky bottom-0 z-10 rounded-[28px] border border-white/10 bg-slate-950/80 p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-slate-400">
          {currentIndex === 0 && "Defina a base da operação com contexto claro e leitura imediata."}
          {currentIndex === 1 && "Complete as condições da carta com foco em conferência rápida."}
          {currentIndex === 2 && "Finalize parceiro, estado inicial e documento antes de salvar."}
        </p>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onReset} disabled={isPending}>
            Limpar
          </Button>

          {currentIndex > 0 ? (
            <Button type="button" variant="outline" onClick={onPrev} disabled={isPending}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
          ) : null}

          {currentIndex < total - 1 ? (
            <Button type="button" onClick={onNext} disabled={isPending}>
              Próximo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
