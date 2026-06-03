"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Facebook,
  Globe2,
  Handshake,
  Home,
  LayoutDashboard,
  List,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Target,
  Trello,
  Users,
  Wallet,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

// ── Tipos ────────────────────────────────────────────────────────────────────

type NavChild = {
  href: string;
  label: string;
  icon: typeof Home;
  /** rotas extras que contam como "ativa" para este filho */
  alsoActiveFor?: string[];
};

type NavItem = {
  href: string;
  icon: typeof Home;
  label: string;
  children?: NavChild[];
  /** rotas extras que ativam o pai */
  alsoActiveFor?: string[];
};

type NavSection = {
  label: string;
  items: NavItem[];
};

// ── Estrutura de navegação ────────────────────────────────────────────────────

const sections: NavSection[] = [
  {
    label: "Operação",
    items: [
      { href: "/app", icon: Home, label: "Painel" },
      { href: "/app/leads", icon: Trello, label: "Leads" },
      { href: "/app/carteira", icon: Briefcase, label: "Carteira" },
      { href: "/app/lances", icon: Target, label: "Lances" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      {
        href: "/app/comissoes",
        icon: CircleDollarSign,
        label: "Comissões",
        alsoActiveFor: ["/app/financeiro"],
        children: [
          {
            href: "/app/comissoes?tab=dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            alsoActiveFor: ["/app/comissoes"],
          },
          {
            href: "/app/comissoes?tab=pipeline",
            label: "Pipeline",
            icon: BarChart3,
          },
          {
            href: "/app/comissoes?tab=lancamentos",
            label: "Lançamentos",
            icon: List,
          },
          {
            href: "/app/comissoes?tab=repasses",
            label: "Repasses",
            icon: ArrowLeftRight,
          },
          {
            href: "/app/comissoes?tab=cronograma",
            label: "Cronograma",
            icon: CalendarDays,
          },
          {
            href: "/app/financeiro/pagamentos",
            label: "Config. Comissão",
            icon: BookOpen,
            alsoActiveFor: ["/app/financeiro/pagamentos"],
          },
        ],
      },
      {
        href: "/app/parceiros",
        icon: Handshake,
        label: "Parceiros",
      },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { href: "/app/meta-integracoes", icon: Facebook, label: "Meta Ads" },
      { href: "/app/usuarios", icon: Users, label: "Usuários" },
      { href: "/app/organizacao", icon: Building2, label: "Organização" },
      { href: "/app/landing-pages", icon: Globe2, label: "Landing Pages" },
    ],
  },
];

const onboardingItems: NavItem[] = [
  { href: "/app", icon: Home, label: "Painel" },
  { href: "/app/organizacao", icon: Building2, label: "Organização" },
];

// ── Helpers de active state ───────────────────────────────────────────────────

function isItemActive(path: string, href: string, alsoActiveFor?: string[]): boolean {
  const base = href.split("?")[0];
  if (base === "/app") return path === "/app";
  if (path === base || path.startsWith(base + "/")) return true;
  return alsoActiveFor?.some((alt) => path === alt || path.startsWith(alt + "/")) ?? false;
}

function isChildActive(path: string, child: NavChild): boolean {
  const base = child.href.split("?")[0];
  if (path === base) return true;
  return child.alsoActiveFor?.some((alt) => path === alt || path.startsWith(alt + "/")) ?? false;
}

function isParentActive(path: string, item: NavItem): boolean {
  if (isItemActive(path, item.href, item.alsoActiveFor)) return true;
  return item.children?.some((c) => isChildActive(path, c)) ?? false;
}

// ── Componente ────────────────────────────────────────────────────────────────

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

  const items = hasOrg ? sections : [{ label: "Menu", items: onboardingItems }];

  return (
    <aside
      className={cn(
        "hidden md:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-white/10 bg-slate-950/60 backdrop-blur-xl transition-[width] duration-300",
        collapsed ? "w-[4.5rem]" : "w-60",
      )}
    >
      {/* Logo / toggle */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
        {!collapsed && (
          <div className="pl-1">
            <h1 className="text-base font-bold tracking-tight text-emerald-400">Autentika</h1>
            <p className="text-[11px] text-slate-500">Gestão de Consórcios</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {items.map((section, sIdx) => (
          <div key={section.label} className={cn(sIdx > 0 && "mt-4")}>
            {/* Section label */}
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {section.label}
              </p>
            )}
            {collapsed && sIdx > 0 && (
              <div className="mx-3 my-2 border-t border-white/8" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const parentActive = isParentActive(path, item);
                const Icon = item.icon;

                return (
                  <div key={item.href}>
                    {/* Parent item */}
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        parentActive
                          ? "bg-emerald-500/12 text-emerald-300"
                          : "text-slate-400 hover:bg-white/8 hover:text-slate-100",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>

                    {/* Children — show only when parent section is active */}
                    {!collapsed && item.children && parentActive && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                        {item.children.map((child) => {
                          const childActive = isChildActive(path, child);
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                                childActive
                                  ? "bg-emerald-500/10 text-emerald-200 font-medium"
                                  : "text-slate-500 hover:bg-white/5 hover:text-slate-200",
                              )}
                            >
                              <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 px-3 py-3">
        {!collapsed && <span className="text-[11px] text-slate-600">v1.0.0</span>}
        <LogoutButton className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-rose-400" />
      </div>
    </aside>
  );
}
