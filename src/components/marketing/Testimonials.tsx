import { Card, CardContent } from "@/components/ui/card";
import { Section } from "./Section";


const depo = [
    {
        name: "Thiago R.",
        text: "Fui contemplado em 8 meses seguindo o plano da Autentika.",
    },
    {
        name: "Larissa M.",
        text: "Finalmente entendi consórcio como investimento de verdade.",
    },
    {
        name: "Eduardo V.",
        text: "Paguei sem aperto e tive suporte em cada etapa. Confiança total.",
    },
];


export function Testimonials() {
    return (
        <Section>
            <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="text-3xl font-semibold md:text-4xl">Histórias de quem conquistou com método</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                {depo.map((d) => (
                    <Card key={d.name} className="border-muted/40">
                        <CardContent className="pt-6">
                            <p className="text-base leading-relaxed">“{d.text}”</p>
                            <p className="mt-4 text-sm text-muted-foreground">— {d.name}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Section>
    );
}