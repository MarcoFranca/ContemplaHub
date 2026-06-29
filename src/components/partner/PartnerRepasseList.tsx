"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Loader2, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPartnerComprovanteUrlAction } from "@/app/partner/repasses/actions";

export type PartnerRepasseLote = {
    id: string;
    total: number | string;
    quantidade: number;
    forma_pagamento?: string | null;
    observacoes?: string | null;
    comprovante_filename?: string | null;
    tem_comprovante?: boolean;
    pago_em?: string | null;
    created_at?: string | null;
};

const brl = (v: number | string | null | undefined) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));
const dataHora = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Não informado";

export function PartnerRepasseList({ lotes }: { lotes: PartnerRepasseLote[] }) {
    const [busy, setBusy] = React.useState<string | null>(null);

    const abrir = (loteId: string) => {
        setBusy(loteId);
        getPartnerComprovanteUrlAction(loteId)
            .then((res) => {
                if (res.ok && res.url) window.open(res.url, "_blank", "noopener,noreferrer");
                else toast.error(res.error || "Comprovante indisponível.");
            })
            .finally(() => setBusy(null));
    };

    if (lotes.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                    <Wallet className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Nenhum repasse recebido ainda.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {lotes.map((l) => (
                <Card key={l.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                            <div className="text-lg font-semibold tabular-nums text-emerald-400">{brl(l.total)}</div>
                            <div className="text-xs text-muted-foreground">
                                {dataHora(l.pago_em || l.created_at)} · {l.quantidade} parcela(s)
                            </div>
                            {l.observacoes && (
                                <p className="mt-1 text-xs text-muted-foreground">{l.observacoes}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {l.forma_pagamento && <Badge variant="outline">{l.forma_pagamento}</Badge>}
                            {l.tem_comprovante ? (
                                <button
                                    type="button"
                                    onClick={() => abrir(l.id)}
                                    disabled={busy === l.id}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-sm text-emerald-300 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                                >
                                    {busy === l.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileText className="h-4 w-4" />
                                    )}
                                    Comprovante
                                </button>
                            ) : (
                                <span className="text-xs text-muted-foreground">sem comprovante</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
