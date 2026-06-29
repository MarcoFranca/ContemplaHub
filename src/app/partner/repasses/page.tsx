import { notFound, redirect } from "next/navigation";
import { HandCoins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentPartnerAccess } from "@/lib/auth/partner-server";
import { partnerBackendFetch } from "@/lib/backend-partner";
import { PartnerRepasseList, type PartnerRepasseLote } from "@/components/partner/PartnerRepasseList";

export const dynamic = "force-dynamic";

const brl = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default async function PartnerRepassesPage() {
    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user || !session.access_token) redirect("/login");

    const partner = await getCurrentPartnerAccess();
    if (!partner) redirect("/app");
    if (!partner.canViewCommissions) notFound();

    const data = (await partnerBackendFetch(`/partner/repasses/lotes`, {
        method: "GET",
        accessToken: session.access_token,
    })) as { items?: PartnerRepasseLote[] } | null;

    const lotes = data?.items ?? [];
    const totalRecebido = lotes.reduce((s, l) => s + Number(l.total || 0), 0);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Financeiro</p>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                    <HandCoins className="h-6 w-6 text-emerald-400" />
                    Meus repasses
                </h1>
                <p className="text-sm text-muted-foreground">
                    Repasses pagos a você, com forma de pagamento e comprovante para download.
                </p>
            </div>

            {lotes.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground">Total recebido</div>
                            <div className="text-2xl font-bold tabular-nums text-emerald-400">{brl(totalRecebido)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground">Pagamentos</div>
                            <div className="text-2xl font-bold tabular-nums">{lotes.length}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <PartnerRepasseList lotes={lotes} />
        </div>
    );
}
