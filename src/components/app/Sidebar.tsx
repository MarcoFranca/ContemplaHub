"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Building2,
    CircleDollarSign,
    Facebook,
    Globe2,
    Handshake,
    Home,
    Landmark,
    PanelLeftClose,
    PanelLeftOpen,
    Briefcase,
    Target,
    Trello,
    Users,
    Wallet,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

type SidebarLink = {
    href: string;
    icon: typeof Home;
    label: string;
    children?: Array<{ href: string; label: string }>;
};

const links: SidebarLink[] = [
    { href: "/app", icon: Home, label: "Painel" },
    { href: "/app/leads", icon: Trello, label: "Leads" },
    { href: "/app/carteira", icon: Briefcase, label: "Carteira" },
    { href: "/app/lances", icon: Target, label: "Lances" },
    {
        href: "/app/financeiro",
        icon: Landmark,
        label: "Financeiro",
        children: [
            { href: "/app/financeiro", label: "Panorama" },
            { href: "/app/financeiro/pagamentos", label: "Pagamentos" },
        ],
    },
    { href: "/app/parceiros", icon: Handshake, label: "Parceiros" },
    { href: "/app/comissoes", icon: CircleDollarSign, label: "Comissões" },
    { href: "/app/meta-integracoes", icon: Facebook, label: "Meta Ads" },
    { href: "/app/usuarios", icon: Users, label: "Usuários" },
    { href: "/app/organizacao", icon: Building2, label: "Organização" },
    { href: "/app/landing-pages", icon: Globe2, label: "Landing Pages" },
];

const onboardingLinks: SidebarLink[] = [
    { href: "/app", icon: Home, label: "Painel" },
    { href: "/app/organizacao", icon: Building2, label: "Organização" },
];

export function Sidebar({
    collapsed,
    hasOrg,
    onToggle,
}: {
    collapsed: boolean;
    hasOrg: boolean;
    onToggle: () => void;
}) {
    const path = usePathname();
    const visibleLinks = hasOrg ? links : onboardingLinks;

    return (
        <aside
            className={cn(
                "hidden md:flex fixed inset-y-0 left-0 z-40 bg-slate-950/60 border-r border-white/10 backdrop-blur-xl flex-col transition-[width] duration-300",
                collapsed ? "w-[4.5rem]" : "w-60",
            )}
        >
            <div className="px-3 py-3 border-b border-white/10 flex items-center justify-between">
                {!collapsed && (
                    <div className="pl-1">
                        <h1 className="text-lg font-semibold text-emerald-400">Autentika</h1>
                        <p className="text-xs text-slate-400">Gestão de Consórcios</p>
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="text-slate-400 hover:text-white transition p-2"
                    title={collapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                {visibleLinks.map(({ href, icon: Icon, label, children }) => {
                    const active =
                        href === "/app"
                            ? path === "/app"
                            : path === href || path.startsWith(href + "/");
                    return (
                        <div key={href} className="space-y-1">
                            <Link
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                                    active ? "bg-emerald-500/10 text-emerald-300" : "text-slate-300 hover:bg-white/10 hover:text-white",
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>{label}</span>}
                            </Link>

                            {!collapsed && children?.length && active ? (
                                <div className="ml-9 grid gap-1 border-l border-white/10 pl-3">
                                    {children.map((child) => {
                                        const childActive = path === child.href || path.startsWith(child.href + "/");
                                        return (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition",
                                                    childActive
                                                        ? "bg-emerald-500/10 text-emerald-200"
                                                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                                                )}
                                            >
                                                <Wallet className="h-3.5 w-3.5 shrink-0" />
                                                <span>{child.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </nav>

            <div className="px-3 py-3 border-t border-white/10 text-xs text-slate-500 flex items-center justify-between">
                {!collapsed && <span>v1.0.0</span>}
                <LogoutButton className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition" />
            </div>
        </aside>
    );
}
