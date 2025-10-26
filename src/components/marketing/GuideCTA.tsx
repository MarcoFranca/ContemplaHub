// ============================
// FILE: components/marketing/GuideCTA.tsx
// ============================
"use client";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { useRouter } from "next/navigation";


export function GuideCTA() {
    const router = useRouter();
    return (
        <Section>
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
                <h3 className="text-2xl font-semibold">Guia Estratégico do Consórcio</h3>
                <p className="text-muted-foreground">Aprenda antes de decidir: funcionamento, estratégias de lance e riscos. Baixe grátis.</p>
                <Button size="lg" onClick={() => router.push("/guia-consorcio")}>Baixar meu guia gratuito</Button>
            </div>
        </Section>
    );
}