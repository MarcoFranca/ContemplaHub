import type { ComponentType } from "react";
import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StepItem = {
  key: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

interface Props {
  mode: "fromLead" | "registerExisting";
  steps: StepItem[];
  currentIndex: number;
  currentStepKey: string;
  progress: number;
  onSelect: (stepKey: string) => void;
}

export function ContratoFormHeader({
  mode,
  steps,
  currentIndex,
  currentStepKey,
  progress,
  onSelect,
}: Props) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            Experiência premium de cadastro
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {mode === "fromLead" ? "Formalização de venda" : "Cadastro de carta da carteira"}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              {mode === "fromLead"
                ? "Estruture a venda com leitura clara, progressão guiada e revisão viva antes de salvar."
                : "Cadastre a carta existente com um fluxo fluido, elegante e pronto para o operacional da carteira."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Progresso</div>
          <div className="mt-1 text-sm font-medium text-slate-100">
            Etapa {currentIndex + 1} de {steps.length}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Progress value={progress} className="h-2 bg-white/10" />
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.key === currentStepKey;
            const isDone = index < currentIndex;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={cn(
                  "group rounded-2xl border px-4 py-3 text-left transition",
                  isActive
                    ? "border-emerald-400/25 bg-emerald-400/10"
                    : "border-white/8 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "rounded-2xl p-2 transition",
                      isActive || isDone
                        ? "bg-emerald-400/15 text-emerald-200"
                        : "bg-white/[0.05] text-slate-300"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{item.title}</span>
                      {isDone ? (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-emerald-200">
                          concluída
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs leading-5 text-slate-400">{item.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
