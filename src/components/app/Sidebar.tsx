"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home, Trello, Users, Building2, Globe2, LogOut,
    PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

const links = [
    { href: "/app", icon: Home, label: "Painel" },
    { href: "/app/leads", icon: Trello, label: "Leads" },
    { href: "/app/usuarios", icon: Users, label: "Usuários" },
    { href: "/app/organizacao", icon: Building2, label: "Organização" },
    { href: "/app/landing-pages", icon: Globe2, label: "Landing Pages" },
];

export function Sidebar({
                            collapsed,
                            onToggle,
                        }: {
    collapsed: boolean;
    onToggle: () => void;
}) {
    const path = usePathname();

    return (
        <aside
            className={cn(
                "hidden md:flex fixed inset-y-0 left-0 z-40 bg-slate-950/60 border-r border-white/10 backdrop-blur-xl flex-col transition-[width] duration-300",
                collapsed ? "w-[4.5rem]" : "w-60"
            )}
        >
            {/* topo */}
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

            {/* navegação */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                {links.map(({ href, icon: Icon, label }) => {
                    const active = path === href || path.startsWith(href + "/");
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                                active ? "bg-emerald-500/10 text-emerald-300" : "text-slate-300 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* footer */}
            <div className="px-3 py-3 border-t border-white/10 text-xs text-slate-500 flex items-center justify-between">
                {!collapsed && <span>v1.0.0</span>}
                <button
                    className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition"
                    onClick={() => (window.location.href = "/logout")}
                >
                    <LogOut className="h-3.5 w-3.5" />
                    {!collapsed && "Sair"}
                </button>
            </div>
        </aside>
    );
}
