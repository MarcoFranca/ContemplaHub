"use client";
import { motion, useReducedMotion } from "framer-motion";

export function BokehOrbs() {
    const reduce = useReducedMotion();
    return (
        <div className="pointer-events-none absolute inset-0 -z-10">
            <motion.div
                aria-hidden
                className="absolute -top-10 left-1/4 h-64 w-64 rounded-full"
                style={{
                    background:
                        "radial-gradient(closest-side, rgba(56,189,248,0.22), transparent 70%)",
                    filter: "blur(8px)",
                }}
                animate={reduce ? {} : { scale: [1, 1.05, 1], opacity: [0.7, 0.95, 0.7], y: [0, -8, 0] }}
                transition={reduce ? {} : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden
                className="absolute top-1/3 right-[15%] h-56 w-56 rounded-full"
                style={{
                    background:
                        "radial-gradient(closest-side, rgba(16,185,129,0.18), transparent 70%)",
                    filter: "blur(10px)",
                }}
                animate={reduce ? {} : { scale: [1, 1.06, 1], opacity: [0.6, 0.9, 0.6], x: [0, 10, 0] }}
                transition={reduce ? {} : { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
            <motion.div
                aria-hidden
                className="absolute bottom-0 left-[10%] h-72 w-72 rounded-full"
                style={{
                    background:
                        "radial-gradient(closest-side, rgba(99,102,241,0.15), transparent 70%)",
                    filter: "blur(14px)",
                }}
                animate={reduce ? {} : { scale: [1, 1.04, 1], opacity: [0.5, 0.8, 0.5], y: [0, 12, 0] }}
                transition={reduce ? {} : { duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
        </div>
    );
}

