import { Section } from "./Section";
import { CheckCircle2 } from "lucide-react";


const bullets = [
    "Consultoria personalizada (não vendemos tabela)",
    "Simulações com previsão de contemplação (média histórica + sazonalidade)",
    "Acompanhamento até a entrega da carta"
];


export function WhyAutentika() {
    return (
        <Section>
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-semibold md:text-4xl">Mais do que consórcio — uma estratégia de vida</h2>
                <ul className="mt-6 space-y-3 text-left">
                    {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-lg">
                            <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                            <span className="text-muted-foreground">{b}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </Section>
    );
}