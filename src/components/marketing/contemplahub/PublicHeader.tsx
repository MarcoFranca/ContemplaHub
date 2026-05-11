import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "#produto", label: "Produto" },
    { href: "#funcionalidades", label: "Funcionalidades" },
    { href: "#operacao", label: "Operação" },
    { href: "#ia", label: "IA" },
    { href: "#seguranca", label: "Segurança" },
];

export function PublicHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1220]/82 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#27E0A5]/20 bg-white/[0.04] shadow-[0_0_0_1px_rgba(39,224,165,0.08)]">
                        <Image
                            src="/icon.png"
                            alt="Ícone ContemplaHub"
                            width={28}
                            height={28}
                            className="h-7 w-7"
                        />
                    </span>
                    <Image
                        src="/logo_horizontal_branca_verde.png"
                        alt="ContemplaHub"
                        width={178}
                        height={36}
                        className="h-8 w-auto"
                        priority
                    />
                </Link>

                <nav className="hidden items-center gap-7 lg:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm text-slate-300 transition hover:text-white",
                                "underline-offset-4 hover:underline"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        href="/login"
                        className="text-sm text-slate-300 transition hover:text-white"
                    >
                        Entrar
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    <Button
                        asChild
                        variant="ghost"
                        className="hidden border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 sm:inline-flex"
                    >
                        <Link href="/login">Entrar</Link>
                    </Button>
                    <Button
                        asChild
                        className="rounded-full bg-[#00C389] px-5 text-[#0B1220] hover:bg-[#27E0A5]"
                    >
                        <Link href="#demo">Solicitar demonstração</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
