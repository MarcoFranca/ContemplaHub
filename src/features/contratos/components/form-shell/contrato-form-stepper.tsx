import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepItem {
    key: string;
    title: string;
    description: string;
    icon: any;
}

interface Props {
    steps: StepItem[];
    currentIndex: number;
    currentStep: string;
    onChange: (step: string) => void;
}

export function ContratoFormStepper({
                                        steps,
                                        currentIndex,
                                        currentStep,
                                        onChange,
                                    }: Props) {
    return (
        <div className={cn("grid gap-3", steps.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3")}>
            {steps.map((item, index) => {
                const Icon = item.icon;
                const isActive = item.key === currentStep;
                const isDone = index < currentIndex;

                return (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => onChange(item.key)}
                        className={[
                            "rounded-2xl border px-4 py-4 text-left transition-all",
                            isActive
                                ? "border-emerald-400/35 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]"
                                : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]",
                        ].join(" ")}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={[
                                    "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl",
                                    isDone || isActive
                                        ? "bg-emerald-400/15 text-emerald-300"
                                        : "bg-white/5 text-slate-300",
                                ].join(" ")}
                            >
                                {isDone ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <Icon className="h-5 w-5" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-white">{item.title}</p>
                                <p className="text-xs leading-5 text-slate-400">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
