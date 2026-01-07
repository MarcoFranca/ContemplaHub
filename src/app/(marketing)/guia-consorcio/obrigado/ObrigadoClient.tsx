"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { downloadGuideUrl } from "../api";

export function ObrigadoClient() {
    const sp = useSearchParams();
    const leadId = sp.get("lead");

    if (!leadId) {
        return (
            <main className="mx-auto max-w-xl px-6 py-12">
                <h1 className="text-2xl font-semibold">Não foi possível identificar seu cadastro</h1>
                <p className="mt-2 text-muted-foreground">
                    Volte e preencha o formulário para liberar o download do guia.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/guia-consorcio">Voltar</Link>
                </Button>
            </main>
        );
    }

    const href = downloadGuideUrl(leadId);

    return (
        <main className="mx-auto max-w-xl px-6 py-12">
            <h1 className="text-2xl font-semibold">Tudo certo!</h1>
            <p className="mt-2 text-muted-foreground">
                Seu acesso ao guia foi liberado. Clique abaixo para baixar o PDF.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                    <a href={href}>Baixar guia (PDF)</a>
                </Button>

                <Button asChild size="lg" variant="outline">
                    <Link href="/guia-consorcio">Voltar</Link>
                </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
                Material educativo. Não contém promessa de contemplação. Download liberado mediante consentimento (LGPD).
            </p>
        </main>
    );
}
