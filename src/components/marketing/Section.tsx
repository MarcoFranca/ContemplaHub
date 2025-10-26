import type { ReactNode } from "react";
import { cn } from "@/lib/utils";


export function Section({
                            id,
                            children,
                            className,
                            containerClassName,
                        }: {
    id?: string;
    children: ReactNode;
    className?: string;
    containerClassName?: string;
}) {
    return (
        <section id={id} className={cn("py-14 md:py-20", className)}>
            <div className={cn("container mx-auto px-4 md:px-6", containerClassName)}>
                {children}
            </div>
        </section>
    );
}