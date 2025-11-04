"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { MobileNav } from "@/components/app/MobileNav";

export function Header({
                           collapsed,
                           onToggle,
                       }: {
    collapsed: boolean;
    onToggle: () => void;
}) {
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
            className="flex items-center justify-between bg-slate-900/60 border-b border-white/10 backdrop-blur-md px-3 md:px-6 h-14 shrink-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="flex items-center gap-2">
                {/* Mobile: hambúrguer (abre drawer) */}
                <MobileNav />
                {/* Desktop: recolher/expandir sidebar */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="hidden md:inline-flex"
                    onClick={onToggle}
                    title={collapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </Button>

                <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
            </div>

            {/* Ação contextual — exemplo: Leads tem “+” */}
            {path.startsWith("/app/leads") && (
                <Button size="icon" className="bg-emerald-600 hover:bg-emerald-500" title="Novo lead">
                    <Plus className="h-5 w-5" />
                </Button>
            )}
        </motion.header>
    );
}
