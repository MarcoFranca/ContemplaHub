"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

type Props = {
    className?: string;
    variant?: "emerald" | "sky" | "neutral";
    beamsTilt?: number; // graus (positivo inclina à direita)
};

export function SectionFX({ className, variant = "emerald", beamsTilt = -8 }: Props) {
    const reduce = useReducedMotion();

    const palette =
        variant === "emerald"
            ? {
                auraFrom: "rgba(16,185,129,0.20)",
                auraMid: "rgba(16,185,129,0.10)",
                beam: "rgba(56,189,248,0.14)",
                grid: "rgba(255,255,255,0.06)",
                vignette: "rgba(0,0,0,0.35)",
            }
            : variant === "sky"
                ? {
                    auraFrom: "rgba(56,189,248,0.22)",
                    auraMid: "rgba(56,189,248,0.10)",
                    beam: "rgba(16,185,129,0.14)",
                    grid: "rgba(255,255,255,0.06)",
                    vignette: "rgba(0,0,0,0.35)",
                }
                : {
                    auraFrom: "rgba(148,163,184,0.20)",
                    auraMid: "rgba(148,163,184,0.08)",
                    beam: "rgba(255,255,255,0.10)",
                    grid: "rgba(255,255,255,0.05)",
                    vignette: "rgba(0,0,0,0.35)",
                };

    return (
        <div className={cn("absolute inset-0 -z-10 isolate overflow-hidden", className)}>
            {/* Aurora */}
            <motion.div
                aria-hidden
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(80% 60% at 50% 0%, ${palette.auraFrom}, transparent 60%), radial-gradient(50% 40% at 50% 65%, ${palette.auraMid}, transparent 70%)`,
                }}
                animate={
                    reduce ? {} : { opacity: [0.85, 1, 0.85], scale: [1, 1.03, 1], y: [0, -8, 0] }
                }
                transition={reduce ? {} : { duration: 14, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* Beams diagonais */}
            <motion.div
                aria-hidden
                className="absolute -inset-x-10 top-[-10%] h-[160%] opacity-70"
                style={{
                    backgroundImage:
                        `repeating-linear-gradient(${beamsTilt}deg, transparent 0 24px, ${palette.beam} 24px 28px)`,
                    maskImage:
                        "linear-gradient(to bottom, transparent, black 10%, black 80%, transparent)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, transparent, black 10%, black 80%, transparent)",
                    filter: "blur(0.2px)",
                }}
                animate={reduce ? {} : { x: [0, 12, 0] }}
                transition={reduce ? {} : { duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Grid sutil */}
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        `radial-gradient(${palette.grid} 1px, transparent 1px)`,
                    backgroundSize: "12px 12px",
                    opacity: 0.5,
                    maskImage:
                        "radial-gradient(100% 60% at 50% 40%, black 60%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(100% 60% at 50% 40%, black 60%, transparent 100%)",
                }}
            />

            {/* Vignette leve para costurar com o divider */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        `radial-gradient(120% 80% at 50% -10%, transparent 40%, ${palette.vignette})`,
                    opacity: 0.5,
                }}
            />

            {/* Grão (grain) */}
            <div
                aria-hidden
                className="absolute inset-0 mix-blend-overlay opacity-[0.05]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.8'/></svg>\")",
                    backgroundSize: "300px 300px",
                }}
            />
        </div>
    );
}
