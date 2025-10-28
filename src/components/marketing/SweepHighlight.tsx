"use client";
import {motion, useReducedMotion} from "framer-motion";

export function SweepHighlight() {
    const reduce = useReducedMotion();
    return (
        <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
                background:
                    "conic-gradient(from 210deg at 70% 20%, rgba(56,189,248,0.18), transparent 110deg)",
                mixBlendMode: "screen",
                maskImage: "radial-gradient(70% 50% at 60% 30%, black 40%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(70% 50% at 60% 30%, black 40%, transparent 100%)",
            }}
            animate={reduce ? {} : { rotate: [0, 6, 0] }}
            transition={reduce ? {} : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}
