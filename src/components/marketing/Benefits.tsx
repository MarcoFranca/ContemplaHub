import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "./Section";
import { HandCoins, ShieldCheck, Timer } from "lucide-react";


const items = [
    {
        icon: HandCoins,
        title: "Sem juros, sem dívidas",
        text: "Você investe no seu tempo — disciplina substitui o juro composto do banco.",
    },
    {
        icon: Timer,
        title: "Planejamento real",
        text: "Objetivo, prazo e estratégia de lance alinhados ao seu momento de vida.",
    },
    {
        icon: ShieldCheck,
        title: "Flexível e seguro",
        text: "Produtos fiscalizados pelo Banco Central e curadoria Autentika.",
    },
];


export function Benefits() {
    return (
        <Section id="como-funciona">
            <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="text-3xl font-semibold md:text-4xl">O jeito moderno de construir patrimônio</h2>
                <p className="mt-3 text-muted-foreground">Consórcio como investimento: método, previsibilidade e segurança.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                {items.map((it) => (
                    <Card key={it.title} className="border-muted/40">
                        <CardHeader>
                            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <it.icon className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-xl">{it.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{it.text}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Section>
    );
}