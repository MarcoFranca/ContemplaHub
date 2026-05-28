"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Target } from "lucide-react";

import { CreateCarteiraClienteSheet } from "@/app/app/carteira/ui/CreateCarteiraClienteSheet";
import { CreateLeadSheet } from "@/app/app/leads/ui/CreateLeadSheet";
import { LeadsToolbar } from "@/app/app/leads/ui/LeadsToolbar";
import { MobileNav } from "@/components/app/MobileNav";
import { Button } from "@/components/ui/button";

export function Header({
    collapsed,
    isManager = false,
    onToggle,
}: {
    collapsed: boolean;
    isManager?: boolean;
    onToggle: () => void;
}) {
    void collapsed;
    void onToggle;

    const path = usePathname();
    const isCarteira = path.startsWith("/app/carteira");
    const isLances = path.startsWith("/app/lances");

    const title = (() => {
        if (path.startsWith("/app/leads")) return "Leads";
        if (isCarteira) return "Carteira";
        if (isLances) return "Lances";
        if (path.startsWith("/app/comissoes")) return "Comissoes";
        if (path.startsWith("/app/meta-integracoes")) return "Meta Ads";
        if (path.startsWith("/app/contratos")) return "Contratos";
        if (path.startsWith("/app/usuarios")) return "Usuarios";
        if (path.startsWith("/app/organizacao")) return "Organizacao";
        if (path.startsWith("/app/landing-pages")) return "Landing Pages";
        return "Painel";
    })();

    const isRichHeader = isCarteira || isLances;

    return (
        <motion.header
            className={
                isRichHeader
                    ? "flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/60 px-3 py-3 backdrop-blur-md md:px-6"
                    : "flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/60 px-3 backdrop-blur-md md:px-6"
            }
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="flex min-w-0 items-center gap-3">
                <MobileNav />

                {isRichHeader ? (
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                            {isCarteira ? <Sparkles className="h-3 w-3" /> : <Target className="h-3 w-3" />}
                            {isCarteira ? "Operacao de carteira" : "Operacao de lances"}
                        </div>
                        <div className="mt-2">
                            <h2 className="text-xl font-semibold tracking-tight text-white">
                                {isCarteira ? "Carteira" : "Lances do mes"}
                            </h2>
                            <p className="max-w-3xl text-sm text-slate-400">
                                {isCarteira
                                    ? "Vista operacional compacta para clientes e cartas, com foco em leitura rapida, densidade e acoes sem perder o acabamento premium."
                                    : "Defina o lance, acompanhe a execucao mensal e de baixa no que ja foi tratado com uma visao operacional enxuta."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
                )}
            </div>

            {path.startsWith("/app/leads") ? (
                <div className="mr-8 flex h-auto items-center justify-center gap-8">
                    <LeadsToolbar />
                    <CreateLeadSheet variant="fab" />
                </div>
            ) : null}

            {isCarteira ? (
                <div className="flex items-start gap-2 self-start">
                    <Link href="/app/leads">
                        <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/[0.03]">
                            Ver Leads
                        </Button>
                    </Link>

                    {isManager ? (
                        <Link href="/app/carteira/importar">
                            <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/[0.03]">
                                Importar planilha
                            </Button>
                        </Link>
                    ) : null}

                    <CreateCarteiraClienteSheet />

                    <div id="app-header-actions-slot" className="contents" />
                </div>
            ) : null}

            {isLances ? (
                <div className="flex items-start gap-2 self-start">
                    <Link href="/app/carteira">
                        <Button variant="outline" size="sm" className="h-9 rounded-xl border-white/10 bg-white/[0.03]">
                            Ver Carteira
                        </Button>
                    </Link>
                </div>
            ) : null}
        </motion.header>
    );
}
