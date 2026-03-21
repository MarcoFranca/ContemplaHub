"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FileText,
    LayoutDashboard,
    Wallet,
    UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    {
        href: "/partner",
        label: "Início",
        icon: LayoutDashboard,
    },
    {
        href: "/partner/contracts",
        label: "Contratos",
        icon: FileText,
    },
    {
        href: "/partner/commissions",
        label: "Comissões",
        icon: Wallet,
    },
    {
        href: "/partner/me",
        label: "Minha conta",
        icon: UserCircle2,
    },
];

export function PartnerSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex w-72 shrink-0 border-r border-border/60 bg-background">
            <div className="flex w-full flex-col">
                <div className="border-b border-border/60 px-5 py-5">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Portal do parceiro
                    </div>
                    <div className="mt-2 text-xl font-semibold tracking-tight">
                        ContemplaHub
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Acompanhe contratos, comissões e documentos vinculados ao seu acesso.
                    </p>
                </div>

                <nav className="flex flex-col gap-1 p-3">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const active =
                            pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all",
                                    active
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto p-3">
                    <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                        <div className="text-sm font-medium">Área segura</div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Os dados e contratos exibidos aqui respeitam os vínculos e permissões do seu acesso.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}