// app/(marketing)/guia-consorcio/page.tsx
import Link from "next/link";
import { BookOpen, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideForm } from "./GuideForm";

export default function GuiaConsorcioPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-12">
            <div className="rounded-3xl border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                        <BookOpen className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">Guia Estratégico do Consórcio</h1>
                        <p className="text-sm text-muted-foreground">
                            Entenda como transformar consórcio em uma estratégia previsível, segura e sem juros.
                        </p>
                    </div>
                </div>

                <ul className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    <li className="inline-flex items-start gap-3">
                        <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-600" />
                        Diferença Consórcio x Financiamento
                    </li>
                    <li className="inline-flex items-start gap-3">
                        <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-600" />
                        Estratégias de lance por perfil
                    </li>
                    <li className="inline-flex items-start gap-3">
                        <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-600" />
                        Simulações e cenários práticos
                    </li>
                    <li className="inline-flex items-start gap-3">
                        <CheckCircle2 className="mt-[2px] h-4 w-4 text-emerald-600" />
                        Checklist LGPD e compliance
                    </li>
                </ul>

                <GuideForm />

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" variant="outline">
                        <Link href="/#guia">
                            <ShieldCheck className="mr-2 h-5 w-5" />
                            Voltar para a landing
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
