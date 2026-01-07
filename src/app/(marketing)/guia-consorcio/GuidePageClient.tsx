"use client";

import { GuideForm } from "./GuideForm";

export function GuidePageClient() {
    return (
        <main className="mx-auto max-w-xl px-6 py-12">
            <h1 className="text-3xl font-semibold">Baixe o Guia Estratégico do Consórcio</h1>
            <p className="mt-2 text-muted-foreground">
                Preencha seus dados para liberar o download do PDF. Sem promessas de contemplação.
            </p>

            <GuideForm />
        </main>
    );
}
