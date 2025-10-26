"use client";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import { useRouter } from "next/navigation";


export function SimulatorCTA() {
    const router = useRouter();
    return (
        <Section>
            <div className="mx-auto grid max-w-4xl items-center gap-4 rounded-2xl border bg-card p-6 md:grid-cols-[1fr_auto_auto] md:p-8">
                <div>
                    <h3 className="text-2xl font-semibold">Descubra o valor da sua liberdade</h3>
                    <p className="mt-1 text-muted-foreground">Simule agora e receba um plano ideal com estimativa de contemplação.</p>
                </div>
                <Button size="lg" onClick={() => router.push("/simulador/imobiliario")}>Imobiliário</Button>
                <Button size="lg" variant="outline" onClick={() => router.push("/simulador/auto")}>Automóvel</Button>
            </div>
        </Section>
    );
}