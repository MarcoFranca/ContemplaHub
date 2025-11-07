"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

type Variant = "emerald" | "sky" | "neutral";
type Preset = "aurora" | "split" | "mesh" | "fineLines" | "nebula";

type Props = {
    className?: string;
    variant?: Variant;
    beamsTilt?: number;
    preset?: Preset;
    showGrid?: boolean;   // para alternar grid vs linhas
    showLines?: boolean;  // novo: linhas finas diagonais
};

export function SectionFX({
                              className,
                              variant = "emerald",
                              beamsTilt = -8,
                              preset = "aurora",
                              showGrid,
                              showLines,
                          }: Props) {
    const reduce = useReducedMotion();

    const palette =
        variant === "emerald"
            ? { auraFrom: "rgba(16,185,129,0.22)", auraMid: "rgba(16,185,129,0.10)", beam: "rgba(16,185,129,0.14)", accent: "rgba(16,185,129,0.35)", grid: "rgba(255,255,255,0.06)", vignette: "rgba(0,0,0,0.35)" }
            : variant === "sky"
                ? { auraFrom: "rgba(56,189,248,0.22)", auraMid: "rgba(56,189,248,0.10)", beam: "rgba(56,189,248,0.14)", accent: "rgba(56,189,248,0.35)", grid: "rgba(255,255,255,0.06)", vignette: "rgba(0,0,0,0.35)" }
                : { auraFrom: "rgba(148,163,184,0.20)", auraMid: "rgba(148,163,184,0.08)", beam: "rgba(148,163,184,0.12)", accent: "rgba(148,163,184,0.30)", grid: "rgba(255,255,255,0.05)", vignette: "rgba(0,0,0,0.35)" };

    const useGrid = showGrid ?? (preset !== "split"); // grid no aurora/mesh por padrão
    const useLines = showLines ?? (preset === "split"); // linhas no split por padrão

    return (
        <div className={cn("absolute inset-0 -z-10 isolate overflow-hidden", className)}>
            {/* --- PRESETS --- */}
            {preset === "aurora" && (
                <>
                    {/* Aurora radial + leve deslocamento */}
                    <motion.div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(80% 60% at 50% 0%, ${palette.auraFrom}, transparent 60%), radial-gradient(50% 40% at 50% 65%, ${palette.auraMid}, transparent 70%)`,
                        }}
                        animate={reduce ? {} : { opacity: [0.85, 1, 0.85], scale: [1, 1.03, 1], y: [0, -8, 0] }}
                        transition={reduce ? {} : { duration: 14, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                    />
                    {/* Beams diagonais */}
                    <motion.div
                        aria-hidden
                        className="absolute -inset-x-10 top-[-10%] h-[160%] opacity-70"
                        style={{
                            backgroundImage: `repeating-linear-gradient(${beamsTilt}deg, transparent 0 24px, ${palette.beam} 24px 28px)`,
                            maskImage: "linear-gradient(to bottom, transparent, black 10%, black 80%, transparent)",
                            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 80%, transparent)",
                            filter: "blur(0.2px)",
                        }}
                        animate={reduce ? {} : { x: [0, 12, 0] }}
                        transition={reduce ? {} : { duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    />
                </>
            )}

            {preset === "fineLines" && (
                <>
                    {/* listras finíssimas diagonais */}
                    <motion.div
                        aria-hidden
                        className="absolute inset-0 opacity-[0.35]"
                        style={{
                            backgroundImage:
                                `repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 14px)`,
                        }}
                        animate={
                            reduce
                                ? {}
                                : { backgroundPosition: ["0px 0px", "14px 14px", "0px 0px"] }
                        }
                        transition={
                            reduce
                                ? {}
                                : { duration: 20, repeat: Infinity, ease: "linear" }
                        }
                    />
                </>
            )}

            {preset === "split" && (
                <>
                    {/* Split diagonal mais evidente */}
                    <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
          linear-gradient(135deg, var(--split-dark, #020617) 30%, var(--split-light, #0a2739) 70%),
          radial-gradient(60% 40% at 80% 10%, ${palette.auraFrom}, transparent 70%)
        `,
                            backgroundBlendMode: "overlay",
                        }}
                    />

                    {/* Faixa de luz que cria a quebra */}
                    <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
          linear-gradient(120deg, transparent 40%, ${palette.accent}20 50%, transparent 60%)
        `,
                            mixBlendMode: "screen",
                            opacity: 0.4,
                        }}
                    />
                </>
            )}


            {preset === "mesh" && (
                <>
                    {/* Mesh/Conic suave (look diferente do aurora) */}
                    <motion.div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                radial-gradient(40% 35% at 20% 15%, ${palette.auraFrom}, transparent 70%),
                radial-gradient(40% 35% at 80% 30%, ${palette.auraMid}, transparent 70%),
                conic-gradient(from 120deg at 50% 60%, ${palette.accent}, transparent 120deg)
              `,
                            filter: "saturate(1.05)",
                        }}
                        animate={reduce ? {} : { opacity: [0.9, 1, 0.9] }}
                        transition={reduce ? {} : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    />
                </>
            )}

            {/* Overlay de linhas ou grid — muda a textura */}
            {useLines && (
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `repeating-linear-gradient(135deg, transparent 0 16px, ${palette.grid} 16px 17px)`,
                        opacity: 0.45,
                        maskImage: "radial-gradient(100% 60% at 50% 40%, black 60%, transparent 100%)",
                        WebkitMaskImage: "radial-gradient(100% 60% at 50% 40%, black 60%, transparent 100%)",
                    }}
                />
            )}
            {useGrid && (
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(${palette.grid} 1px, transparent 1px)`,
                        backgroundSize: "12px 12px",
                        opacity: 0.5,
                        maskImage: "radial-gradient(100% 60% at 50% 40%, black 60%, transparent 100%)",
                        WebkitMaskImage: "radial-gradient(100% 60% at 50% 40%, black 60%, transparent 100%)",
                    }}
                />
            )}

            {/* Vignette leve */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(120% 80% at 50% -10%, transparent 40%, ${palette.vignette})`,
                    opacity: 0.5,
                }}
            />

            {/* Grain */}
            <div
                aria-hidden
                className="absolute inset-0 mix-blend-overlay opacity-[0.05]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.8'/></svg>\")",
                    backgroundSize: "300px 300px",
                }}
            />
            {preset === "nebula" && (
                <>
                    {/* fundo com blobs maiores e conic girando devagar */}
                    <motion.div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
          radial-gradient(48% 42% at 18% 20%, ${palette.auraFrom}, transparent 72%),
          radial-gradient(42% 38% at 82% 30%, ${palette.auraMid}, transparent 70%),
          conic-gradient(from 200deg at 50% 60%, ${palette.accent} 0deg, transparent 80deg, ${palette.accent} 220deg, transparent 360deg)
        `,
                            filter: "saturate(1.06) contrast(1.02)",
                        }}
                        animate={
                            reduce ? {} : {
                                opacity: [0.9, 1, 0.92],
                                scale: [1, 1.015, 1],
                            }
                        }
                        transition={reduce ? {} : { duration: 14, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* leve rotação do conic pra dar vida */}
                    <motion.div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `conic-gradient(from 0deg at 50% 60%, ${palette.accent}15, transparent 180deg, ${palette.accent}10 270deg, transparent)`,
                            mixBlendMode: "screen",
                        }}
                        animate={reduce ? {} : { rotate: [0, 6, 0] }}
                        transition={reduce ? {} : { duration: 24, repeat: Infinity, ease: "easeInOut" }}
                    />
                </>
            )}
        </div>
    );
}
