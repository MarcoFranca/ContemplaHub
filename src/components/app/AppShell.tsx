"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * Controla o estado de "collapsed" da sidebar e aplica CSS vars globais.
 * --sidebar-w: largura dinâmica (recolhida/expandida)
 * --header-h:  altura do header (para cálculos de altura)
 */
export function AppShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = React.useState(false);

    const sidebarW = collapsed ? "4.5rem" : "15rem"; // 72px / 240px
    const headerH = "56px"; // h-14

    return (
        <div
            className="flex h-full w-full"
            style={
                {
                    // CSS vars usadas no layout todo
                    ["--sidebar-w" as any]: sidebarW,
                    ["--header-h" as any]: headerH,
                } as React.CSSProperties
            }
        >
            {/* Sidebar fixa */}
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

            {/* Spacer que ocupa o espaço da sidebar apenas no md+ (sincronizado com a largura) */}
            <div className="hidden md:block shrink-0" style={{ width: `var(--sidebar-w)` }} />

            {/* Coluna principal: Header + Main */}
            <div className="flex flex-1 flex-col min-w-0">
                <Header collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

                {/* main NÃO rola; quem rola é o próprio children */}
                <main
                    className="flex-1 overflow-hidden"
                    style={{ height: "calc(100dvh - var(--header-h))" }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
