// src/components/app/MobileNav.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    { href: "/app", label: "Painel" },
    { href: "/app/leads", label: "Leads" },
    { href: "/app/usuarios", label: "Usuários" },
    { href: "/app/organizacao", label: "Organização" },
    { href: "/app/landing-pages", label: "Landing Pages" },
];

export function MobileNav() {
    const [open, setOpen] = React.useState(false);
    const path = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
                <div className="px-5 py-4 border-b border-white/10">
                    <h1 className="text-lg font-semibold text-emerald-400">Autentika CRM</h1>
                    <p className="text-xs text-slate-400">Gestão de Consórcios</p>
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {links.map((l) => {
                        const active = path === l.href || path.startsWith(l.href + "/");
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={cn(
                                    "block px-3 py-2 rounded-lg text-sm transition",
                                    active ? "bg-emerald-500/10 text-emerald-300" : "text-slate-300 hover:bg-white/10 hover:text-white"
                                )}
                                onClick={() => setOpen(false)}
                            >
                                {l.label}
                            </Link>
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
