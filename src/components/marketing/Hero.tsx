"use client";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { useRouter } from "next/navigation";


export function Hero() {
    const router = useRouter();
    return (
        <div className="relative overflow-hidden">
            {/* BG visual simples; troque por imagem ou vídeo quando tiver os assets */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/15 via-sky-500/10 to-emerald-500/15" />
            <Section className="pt-16">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs md:text-sm text-muted-foreground bg-background/60 backdrop-blur">
                        <span className="font-medium">Autentika Seguros</span>
                        <span>•</span>
                        <span>“Planeje hoje, conquiste sempre.”</span>
                    </div>
                    <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
                        Transforme o tempo em seu maior aliado
                    </h1>
                    <p className="mt-4 text-balance text-lg text-muted-foreground md:text-xl">
                        Sem juros. Sem pressa. Com método. Consórcio como estratégia real de liberdade financeira.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button size="lg" onClick={() => router.push("#diagnostico")}>Simular no WhatsApp</Button>
                        <Button size="lg" variant="outline" onClick={() => router.push("#como-funciona")}>Ver como funciona</Button>
                    </div>
                    <p className="mt-6 text-sm text-muted-foreground">+300 clientes planejando o futuro com método</p>
                </div>
            </Section>
        </div>
    );
}