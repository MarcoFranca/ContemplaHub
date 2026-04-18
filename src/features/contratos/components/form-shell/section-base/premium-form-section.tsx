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
                "rounded-[28px] border border-white/10 bg-white/[0.035] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-6",
                className
            )}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    {(eyebrow || icon) && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                            {icon}
                            {eyebrow}
                        </div>
                    )}

                    <div className="space-y-2">
                        {badge ? (
                            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                                {badge}
                            </div>
                        ) : null}

                        <h3 className="text-2xl font-semibold tracking-tight text-white">
                            {title}
                        </h3>

                        {description ? (
                            <p className="max-w-3xl text-sm leading-6 text-slate-400">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>

                {headerAside ? <div className="shrink-0">{headerAside}</div> : null}
            </div>

            <div className={cn("mt-5", contentClassName)}>{children}</div>
        </section>
    );
}