"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";
import {
    MessageCircle,
    Mail,
    ArrowUpRight,
    ShieldCheck,
    MapPin,
    Building2,
    Linkedin,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    waPhone?: string; // ex: process.env.NEXT_PUBLIC_WA_PHONE
    email?: string; // ex: "contato@autentikaseguros.com.br"
    cnpj?: string; // ex: "00.000.000/0001-00"
    linkedinUrl?: string; // opcional
    siteUrl?: string; // opcional (recomendado quando tiver domínio)
};

export function SiteFooter({
                               waPhone = process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999",
                               email = "contato@autentikaseguros.com.br",
                               cnpj,
                               linkedinUrl,
                               siteUrl = "https://autentika.example.com",
                           }: Props) {
    const waHref = useMemo(() => {
        const wa = new URL(`https://wa.me/${waPhone}`);
        wa.searchParams.set("text", "Olá! Gostaria de falar com a Autentika sobre consórcio.");
        wa.searchParams.set("utm_source", "lp_home");
        wa.searchParams.set("utm_medium", "footer_cta");
        return wa.toString();
    }, [waPhone]);

    return (
        <footer
            className={cn(
                "border-t border-border bg-background/80 backdrop-blur-sm",
                "dark:bg-white/[0.02]"
            )}
        >
            <Section className="relative isolate py-12">
                {/* JSON-LD Organization */}
                <script
                    type="application/ld+json"
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "Autentika Seguros",
                            slogan: "Planeje hoje, conquiste sempre.",
                            url: siteUrl,
                            sameAs: linkedinUrl ? [linkedinUrl] : [],
                            contactPoint: [
                                {
                                    "@type": "ContactPoint",
                                    contactType: "customer service",
                                    telephone: `+${waPhone}`,
                                    email,
                                    areaServed: "BR",
                                    availableLanguage: ["pt-BR"],
                                },
                            ],
                        }),
                    }}
                />

                <div className="grid gap-10 md:grid-cols-4">
                    {/* Coluna 1 */}
                    <div>
                        <div className="flex items-center gap-2">
                            <Image
                                src="/icone.png"
                                alt="Autentika Corretora"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                            <p className="font-semibold text-foreground">Autentika Corretora</p>
                        </div>

                        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                            Soluções inteligentes de consórcio e proteção patrimonial — método, previsibilidade e disciplina.
                        </p>

                        {cnpj && (
                            <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground/80">
                                <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                                CNPJ {cnpj}
                            </p>
                        )}
                    </div>

                    {/* Coluna 2 */}
                    <nav aria-label="Navegação" className="grid content-start gap-2 text-sm">
                        <p className="font-semibold text-foreground">Navegue</p>

                        <Link className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href="#como-funciona">
                            Como funciona <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>

                        <Link className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href="#depoimentos">
                            Depoimentos <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>

                        <Link className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href="#guia">
                            Guia Estratégico <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>

                        <Link className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href="#diagnostico">
                            Diagnóstico <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </nav>

                    {/* Coluna 3 */}
                    <div className="grid content-start gap-2 text-sm">
                        <p className="font-semibold text-foreground">Atendimento</p>

                        <p className="inline-flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                            SP e RJ — capitais e cidades-chave
                        </p>

                        <p className="text-xs text-muted-foreground/80">
                            São Paulo, Campinas, Ribeirão Preto, São José dos Campos, Rio de Janeiro, Niterói, Petrópolis, Juiz de Fora.
                        </p>
                    </div>

                    {/* Coluna 4 */}
                    <div className="grid content-start gap-3">
                        <p className="font-semibold text-foreground">Fale com a gente</p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button asChild className="bg-emerald-500 text-black hover:bg-emerald-400">
                                <Link href={waHref} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    WhatsApp
                                </Link>
                            </Button>

                            <Button asChild variant="outline" className="border-border text-foreground hover:bg-muted">
                                <a href={`mailto:${email}`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    {email}
                                </a>
                            </Button>
                        </div>

                        {linkedinUrl && (
                            <Link
                                href={linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <Linkedin className="h-4 w-4" />
                                LinkedIn
                            </Link>
                        )}
                    </div>
                </div>

                {/* Compliance */}
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    <div className="text-sm text-muted-foreground">
                        <p className="inline-flex items-center gap-2 text-foreground">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                            LGPD & Compliance
                        </p>

                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground/80">
                            <li>
                                <Link href="/privacidade" className="underline underline-offset-2">
                                    Política de Privacidade
                                </Link>{" "}
                                e registro de consentimento.
                            </li>
                            <li>Administradoras autorizadas pelo Banco Central (BACEN).</li>
                            <li>Sem promessas de “contemplação garantida”. Estimativas são projeções.</li>
                        </ul>
                    </div>

                    <p className="text-sm text-muted-foreground md:text-right">
                        “O propósito da Autentika não é vender consórcio, é construir liberdade com método.”
                    </p>
                </div>

                {/* Copy final */}
                <div className="mt-8 text-xs text-muted-foreground/80">
                    © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Autentika Corretora. Todos os direitos reservados.
                </div>
            </Section>
        </footer>
    );
}
