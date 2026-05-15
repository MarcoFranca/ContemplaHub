import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/server";
import { ImportadorClient } from "./importador-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CarteiraImportPage() {
    const profile = await getCurrentProfile();

    if (!profile?.orgId) {
        redirect("/app/carteira");
    }

    if (!profile.isManager) {
        redirect("/app/carteira");
    }

    return (
        <main className="h-full overflow-auto px-4 py-4 md:px-6">
            <div className="mx-auto max-w-7xl space-y-6 pb-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold">Importação de cartas e cotas</h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Valide primeiro, confira o preview por linha e só depois confirme a gravação em lote.
                        </p>
                    </div>

                    <Link href="/app/carteira">
                        <Button variant="outline">Voltar para carteira</Button>
                    </Link>
                </div>

                <ImportadorClient />
            </div>
        </main>
    );
}
