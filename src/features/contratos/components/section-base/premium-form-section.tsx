import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PremiumFormSectionProps {
    badge?: string;
    title: string;
    description?: string;
    eyebrow?: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    headerAside?: ReactNode;
}

export function PremiumFormSection({
                                       badge,
                                       title,
                                       description,
                                       eyebrow,
                                       icon,
                                       children,
                                       className,
                                       contentClassName,
                                       headerAside,
                                   }: PremiumFormSectionProps) {
    return (
        <section
            className={cn(
                "rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl md:p-5",
                className
            )}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2.5">
                    {(eyebrow || icon) && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                            {icon}
                            {eyebrow}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        {badge ? (
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {badge}
                            </div>
                        ) : null}

                        <h3 className="text-xl font-semibold tracking-tight text-white md:text-[1.35rem]">
                            {title}
                        </h3>

                        {description ? (
                            <p className="max-w-3xl text-[13px] leading-6 text-slate-400 md:text-sm">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>

                {headerAside ? <div className="shrink-0">{headerAside}</div> : null}
            </div>

            <div className={cn("mt-4", contentClassName)}>{children}</div>
        </section>
    );
}
