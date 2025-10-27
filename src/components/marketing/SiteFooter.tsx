// ============================
// FILE: components/marketing/SiteFooter.tsx
// ============================
"use client";

import Link from "next/link";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, ArrowUpRight, ShieldCheck, MapPin, Building2, Linkedin } from "lucide-react";

type Props = {
    waPhone?: string;          // ex: process.env.NEXT_PUBLIC_WA_PHONE
    email?: string;            // ex: "contato@autentikaseguros.com.br"
    cnpj?: string;             // ex: "00.000.000/0001-00"
    linkedinUrl?: string;      // opcional
};

export function SiteFooter({
                               waPhone = process.env.NEXT_PUBLIC_WA_PHONE ?? "5511999999999",
                               email = "contato@autentikaseguros.com.br",
                               cnpj,
                               linkedinUrl,
                           }: Props) {
    const wa = new URL(`https://wa.me/${waPhone}`);
    wa.searchParams.set("text", "Olá! Gostaria de falar com a Autentika sobre consórcio.");
    wa.searchParams.set("utm_source", "lp_home");
    wa.searchParams.set("utm_medium", "footer_cta");

    return (
        <footer className="border-t border-white/10 bg-white/[0.02]">
            <Section className="py-12">
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
                            url: "https://autentika.example.com", // ajuste quando tiver domínio
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
                    {/* Coluna 1: Marca / propósito */}
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-400" />
                            <p className="font-semibold">Autentika Seguros</p>
                        </div>
                        <p className="mt-3 text-sm text-slate-400 max-w-sm">
                            Soluções inteligentes de consórcio e proteção patrimonial — método, previsibilidade e disciplina.
                        </p>

                        {cnpj && (
                            <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                                <Building2 className="h-4 w-4 text-emerald-400" aria-hidden />
                                CNPJ {cnpj}
                            </p>
                        )}
                    </div>

                    {/* Coluna 2: Navegação rápida */}
                    <nav aria-label="Navegação" className="grid content-start gap-2 text-sm">
                        <p className="font-semibold text-white">Navegue</p>
                        <Link className="text-slate-400 hover:text-white inline-flex items-center gap-1" href="#como-funciona">
                            Como funciona <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link className="text-slate-400 hover:text-white inline-flex items-center gap-1" href="#depoimentos">
                            Depoimentos <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link className="text-slate-400 hover:text-white inline-flex items-center gap-1" href="#guia">
                            Guia Estratégico <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link className="text-slate-400 hover:text-white inline-flex items-center gap-1" href="#diagnostico">
                            Diagnóstico <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </nav>

                    {/* Coluna 3: Cobertura / SEO Local */}
                    <div className="grid content-start gap-2 text-sm">
                        <p className="font-semibold text-white">Atendimento</p>
                        <p className="inline-flex items-center gap-2 text-slate-400">
                            <MapPin className="h-4 w-4 text-emerald-400" aria-hidden />
                            SP e RJ — capitais e cidades-chave
                        </p>
                        <p className="text-slate-500 text-xs">
                            São Paulo, Campinas, Ribeirão Preto, São José dos Campos, Rio de Janeiro, Niterói, Petrópolis, Juiz de Fora.
                        </p>
                    </div>

                    {/* Coluna 4: Contato / CTAs */}
                    <div className="grid content-start gap-3">
                        <p className="font-semibold text-white">Fale com a gente</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <Button asChild className="bg-emerald-500 text-black hover:bg-emerald-400">
                                <Link href={wa.toString()} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    WhatsApp
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="border-white/20 text-slate-100 hover:bg-white/10">
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
                                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
                            >
                                <Linkedin className="h-4 w-4" />
                                LinkedIn
                            </Link>
                        )}
                    </div>
                </div>

                {/* Linha de compliance */}
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    <div className="text-sm text-slate-400">
                        <p className="inline-flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden />
                            LGPD & Compliance
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-500">
                            <li>
                                <Link href="/privacidade" className="underline">
                                    Política de Privacidade
                                </Link>{" "}
                                e registro de consentimento.
                            </li>
                            <li>Administradoras autorizadas pelo Banco Central (BACEN).</li>
                            <li>Sem promessas de “contemplação garantida”. Estimativas são projeções.</li>
                        </ul>
                    </div>

                    <p className="text-sm text-slate-400 md:text-right">
                        “O propósito da Autentika não é vender consórcio, é construir liberdade com método.”
                    </p>
                </div>

                {/* Copy final */}
                <div className="mt-8 text-xs text-slate-500">
                    © {new Date().getFullYear()} Autentika Seguros. Todos os direitos reservados.
                </div>
            </Section>
        </footer>
    );
}
