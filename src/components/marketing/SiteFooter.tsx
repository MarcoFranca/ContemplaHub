// ============================
// FILE: components/marketing/SiteFooter.tsx
// ============================
import { Section } from "./Section";


export function SiteFooter() {
    return (
        <footer className="border-t">
            <Section className="py-10">
                <div className="grid gap-6 md:grid-cols-3">
                    <div>
                        <p className="font-semibold">Autentika Seguros</p>
                        <p className="mt-2 text-sm text-muted-foreground max-w-sm">Soluções inteligentes de consórcio e proteção patrimonial.</p>
                    </div>
                    <div>
                        <p className="font-semibold">LGPD & Compliance</p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <li><a className="underline" href="/privacidade">Política de Privacidade</a></li>
                            <li>Logs de consentimento e origem de lead</li>
                            <li>Sem promessas de "contemplação garantida"</li>
                        </ul>
                    </div>
                    <div className="md:text-right">
                        <p className="text-sm text-muted-foreground">“O propósito da Autentika não é vender consórcio, é construir liberdade com método.”</p>
                    </div>
                </div>
                <div className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} Autentika Seguros. Todos os direitos reservados.</div>
            </Section>
        </footer>
    );
}