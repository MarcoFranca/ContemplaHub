"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MobileNav } from "@/components/app/MobileNav";
import {LeadsToolbar} from "@/app/app/leads/ui/LeadsToolbar";
import {CreateLeadSheet} from "@/app/app/leads/ui/CreateLeadSheet";

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
                <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
            </div>

            {/* Ação contextual — exemplo: Leads tem “+” */}
            {path.startsWith("/app/leads") && (
                <div className={"flex h-auto mr-8 items-center justify-center gap-8"}>
                    <LeadsToolbar />
                    <CreateLeadSheet variant="fab" />
                </div>
            )}
        </motion.header>
    );
}
