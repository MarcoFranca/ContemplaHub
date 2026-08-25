"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, ExternalLink, CalendarClock, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AlertaPendente, updateAlertaStatusAction } from "@/app/app/carteira/actions/alertas";

function hoje() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmt(d: string) {
    const [y, m, dd] = d.slice(0, 10).split("-");
    return `${dd}/${m}/${y}`;
}

function AlertaRow({ a, onChanged }: { a: AlertaPendente; onChanged: () => void }) {
    const [pending, start] = React.useTransition();
    const href = a.contrato_id ? `/app/contratos/${a.contrato_id}` : `/app/cartas/${a.cota_id}`;

    function setStatus(status: "concluido" | "cancelado") {
        start(async () => {
            const res = await updateAlertaStatusAction(a.id, status);
            if (!res.ok) {
                toast.error(res.error || "Falha.");
                return;
            }
            toast.success(status === "concluido" ? "Alerta concluído." : "Alerta cancelado.");
            onChanged();
        });
    }

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarClock className="h-4 w-4 text-amber-400" />
                    {fmt(a.data)} · {a.mensagem}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {a.cliente_nome ?? "Cliente"} · Cota {a.numero_cota ?? "-"} · Grupo {a.grupo_codigo ?? "-"}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
                <Button asChild variant="ghost" size="icon" title="Abrir carta">
                    <Link href={href}>
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-1 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10" disabled={pending} onClick={() => setStatus("concluido")}>
                    <Check className="h-3.5 w-3.5" /> Concluir
                </Button>
                <Button variant="ghost" size="icon" className="text-red-300" title="Cancelar" disabled={pending} onClick={() => setStatus("cancelado")}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export function AlertasClient({ initial }: { initial: AlertaPendente[] }) {
    const router = useRouter();
    const onChanged = () => router.refresh();
    const [today] = React.useState(() => hoje());

    if (!initial.length) {
        return (
            <div className="rounded-xl border border-white/10 p-10 text-center text-muted-foreground">
                <CheckCheck className="mx-auto mb-3 h-8 w-8 text-emerald-500/60" />
                Nenhum alerta pendente. Tudo em dia!
            </div>
        );
    }

    const atrasados = initial.filter((a) => a.data < today);
    const doDia = initial.filter((a) => a.data === today);
    const proximos = initial.filter((a) => a.data > today);

    const secao = (titulo: string, lista: AlertaPendente[], cls: string) =>
        lista.length ? (
            <section>
                <h2 className={`mb-2 text-sm font-semibold ${cls}`}>
                    {titulo} ({lista.length})
                </h2>
                <div className="space-y-2">
                    {lista.map((a) => (
                        <AlertaRow key={a.id} a={a} onChanged={onChanged} />
                    ))}
                </div>
            </section>
        ) : null;

    return (
        <div className="space-y-6">
            {secao("Atrasados", atrasados, "text-red-300")}
            {secao("Hoje", doDia, "text-amber-300")}
            {secao("Próximos", proximos, "text-muted-foreground")}
        </div>
    );
}
