"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionDivider({
                                   flip = false,
                                   emerald = true,
                                   subtle = false,
                               }: {
    flip?: boolean;
    emerald?: boolean;
    subtle?: boolean;
}) {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 400], [0, flip ? -18 : 18]);

    const base = subtle
        ? "from-transparent via-white/[0.03] to-transparent"
        : emerald
            ? "from-transparent via-emerald-400/12 to-transparent"
            : "from-transparent via-sky-400/12 to-transparent";

    return (
        <motion.div
            aria-hidden
            style={{ y }}
            initial={{ opacity: 0, y: flip ? -10 : 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "relative isolate h-[92px] w-full bg-gradient-to-b",
                base,
                flip && "rotate-180"
            )}
        >
            {/* fade lateral para esconder cortes duros em telas largas */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    maskImage:
                        "radial-gradient(140% 60% at 50% 0%, black 40%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(140% 60% at 50% 0%, black 40%, transparent 100%)",
                }}
            />
            {/* linha central sutil */}
            <div
                aria-hidden
                className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/8 to-transparent"
            />
        </motion.div>
    );
}
