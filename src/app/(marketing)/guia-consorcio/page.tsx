import { Suspense } from "react";
import { GuidePageClient } from "./GuidePageClient";

export default function GuiaConsorcioPage() {
    return (
        <Suspense
            fallback={
                <main className="mx-auto max-w-xl px-6 py-12">
                    <h1 className="text-2xl font-semibold">Carregando...</h1>
                    <p className="mt-2 text-muted-foreground">Preparando o formulário.</p>
                </main>
            }
        >
            <GuidePageClient />
        </Suspense>
    );
}
