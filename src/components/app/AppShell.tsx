"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type ShellStyle = React.CSSProperties & {
    "--sidebar-w": string;
    "--header-h": string;
};

export function AppShell({
    children,
    hasOrg = true,
    isManager = false,
    badges = {},
}: {
    children: React.ReactNode;
    hasOrg?: boolean;
    isManager?: boolean;
    badges?: Record<string, number>;
}) {
    const [collapsed, setCollapsed] = React.useState(false);
    const pathname = usePathname();
    const isCarteira = pathname.startsWith("/app/carteira");
    const isLances = pathname.startsWith("/app/lances");

    const sidebarW = collapsed ? "4.5rem" : "15rem";
    const headerH = isCarteira || isLances ? "96px" : "56px";

    return (
        <div
            className="flex h-full w-full"
            style={
                {
                    "--sidebar-w": sidebarW,
                    "--header-h": headerH,
                } as ShellStyle
            }
        >
            <Sidebar
                collapsed={collapsed}
                hasOrg={hasOrg}
                badges={badges}
                onToggle={() => setCollapsed((v) => !v)}
            />

            <div className="hidden shrink-0 md:block" style={{ width: "var(--sidebar-w)" }} />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    collapsed={collapsed}
                    isManager={isManager}
                    onToggle={() => setCollapsed((v) => !v)}
                />

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
