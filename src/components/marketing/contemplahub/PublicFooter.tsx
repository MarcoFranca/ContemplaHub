import Image from "next/image";
import Link from "next/link";

const footerLinks = [
    { href: "#produto", label: "Produto" },
    { href: "#seguranca", label: "Segurança" },
    { href: "/login", label: "Login" },
    { href: "mailto:comercial@contemplahub.com", label: "Contato" },
];

export function PublicFooter() {
    return (
        <footer className="border-t border-white/10 bg-[#0B1220]">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-md">
                        <Image
                            src="/logo_horizontal_branca_verde.png"
                            alt="ContemplaHub"
                            width={178}
                            height={36}
                            className="h-8 w-auto"
                        />
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            Plataforma de gestão e inteligência operacional para consultorias,
                            corretoras e operações comerciais de consórcio.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        {footerLinks.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="transition hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row md:items-end md:justify-between">
                    <p>
                        O ContemplaHub é uma plataforma de gestão e inteligência operacional.
                        Não garante contemplação e não substitui regras das administradoras.
                    </p>
                    <p>© 2026 ContemplaHub. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
