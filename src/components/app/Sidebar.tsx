"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  CalendarDays,
  CircleDollarSign,
  Facebook,
  Globe2,
  Handshake,
  Home,
  Layers,
  LayoutDashboard,
  List,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
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
      {
        href: "/app/pendencias",
        icon: Bell,
        label: "Pendências",
        children: [
          { href: "/app/pendencias?cat=comissao_config", label: "Sem comissão", icon: CircleDollarSign },
          { href: "/app/pendencias?cat=contrato_sem_lancamento", label: "Sem lançamentos", icon: BookOpen },
          { href: "/app/pendencias?cat=comissao_inadimplente", label: "Em cobrança", icon: Wallet },
          { href: "/app/pendencias?cat=repasse_vencido", label: "Repasses vencidos", icon: AlertTriangle },
          { href: "/app/pendencias?cat=repasse_pendente", label: "Repasses do mês", icon: ArrowLeftRight },
          { href: "/app/pendencias?cat=carta_sem_assembleia", label: "Sem assembleia", icon: CalendarDays },
        ],
      },
      { href: "/app/leads", icon: Trello, label: "Leads" },
      {
        href: "/app/carteira",
        icon: Briefcase,
        label: "Carteira",
        children: [
          { href: "/app/carteira?view=clientes", label: "Clientes", icon: Users },
          { href: "/app/carteira?view=cartas", label: "Cartas", icon: Wallet },
        ],
      },
      { href: "/app/lances", icon: Target, label: "Lances" },
      {
        href: "/app/simuladores",
        icon: Calculator,
        label: "Simuladores",
        children: [
          { href: "/app/simuladores?sim=consorcio", label: "Consórcio (lance)", icon: Calculator },
          { href: "/app/simuladores?sim=comparativo", label: "Consórcio × Financiamento", icon: Scale },
        ],
      },
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
          {
            href: "/app/comissoes/modelos",
            label: "Modelos",
            icon: Layers,
          },
        ],
      },
      {
        href: "/app/parceiros",
        icon: Handshake,
        label: "Parceiros",
        children: [
          { href: "/app/parceiros", label: "Cadastro", icon: Users },
          {
            href: "/app/parceiros/gerencial",
            label: "Gerencial",
            icon: BarChart3,
          },
        ],
      },
    ],
  },
  {
    label: "Plataforma",
    items: [
      {
        href: "/app/organizacao",
        icon: Settings,
        label: "Configurações",
        alsoActiveFor: ["/app/meta-integracoes", "/app/usuarios", "/app/landing-pages", "/app/operadoras", "/app/whatsapp"],
        children: [
          { href: "/app/organizacao", label: "Organização", icon: Building2 },
          { href: "/app/operadoras", label: "Operadoras", icon: Building2 },
          { href: "/app/usuarios", label: "Usuários", icon: Users },
          { href: "/app/meta-integracoes", label: "Meta Ads", icon: Facebook },
          { href: "/app/whatsapp", label: "WhatsApp", icon: MessageCircle },
          { href: "/app/landing-pages", label: "Landing Pages", icon: Globe2 },
        ],
      },
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

function NavBadge({ count }: { count: number }) {
  return (
    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/90 px-1.5 text-[10px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Sidebar({
  collapsed,
  hasOrg,
  badges = {},
  onToggle,
}: {
  collapsed: boolean;
  hasOrg: boolean;
  badges?: Record<string, number>;
  onToggle: () => void;
}) {
  const path = usePathname();

  // Expansão manual dos submenus (independe de navegar até a categoria).
  // undefined = segue o estado ativo; true/false = escolha explícita do usuário.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (href: string) =>
    setExpanded((prev) => ({ ...prev, [href]: !(prev[href] ?? false) }));

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
        {collapsed ? (
          <Image
            src="/icon.png"
            alt="ContemplaHub"
            width={28}
            height={28}
            className="mx-auto h-7 w-7"
            priority
          />
        ) : (
          <Link href="/app" className="pl-1">
            <Image
              src="/logo_horizontal_branca_verde.png"
              alt="ContemplaHub"
              width={160}
              height={32}
              className="h-12 w-auto"
              priority
            />
            <p className="mt-0.5 text-[11px] text-slate-500">Gestão de Consórcios</p>
          </Link>
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
                const hasChildren = !collapsed && Boolean(item.children?.length);
                const childrenOpen = expanded[item.href] ?? parentActive;
                const parentCount = badges[item.href] ?? 0;

                return (
                  <div key={item.href}>
                    {/* Parent item */}
                    <div
                      className={cn(
                        "flex items-center rounded-lg pr-1 transition-colors",
                        parentActive
                          ? "bg-emerald-500/12 text-emerald-300"
                          : "text-slate-400 hover:bg-white/8 hover:text-slate-100",
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium"
                      >
                        <span className="relative shrink-0">
                          <Icon className="h-4 w-4" />
                          {collapsed && parentCount > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-rose-500" />
                          )}
                        </span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && parentCount > 0 && <NavBadge count={parentCount} />}
                      </Link>

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.href)}
                          aria-label={childrenOpen ? "Recolher submenu" : "Expandir submenu"}
                          aria-expanded={childrenOpen}
                          className="rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
                        >
                          {childrenOpen ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Children — visíveis quando a categoria está ativa OU expandida manualmente */}
                    {hasChildren && childrenOpen && item.children && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                        {item.children.map((child) => {
                          const childActive = isChildActive(path, child);
                          const ChildIcon = child.icon;
                          const childCount = badges[child.href] ?? 0;
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
                              {childCount > 0 && <NavBadge count={childCount} />}
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
