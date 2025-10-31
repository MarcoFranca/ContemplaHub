"use client";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function Header() {
    const path = usePathname();
    const title = (() => {
        if (path.startsWith("/app/leads")) return "Leads";
        if (path.startsWith("/app/usuarios")) return "Usuários";
        if (path.startsWith("/app/organizacao")) return "Organização";
        if (path.startsWith("/app/landing-pages")) return "Landing Pages";
        return "Painel";
    })();

    return (
        <motion.header
            className="sticky top-0 z-30 flex items-center justify-between bg-slate-900/60 border-b border-white/10 backdrop-blur-md px-6 py-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        </motion.header>
    );
}
