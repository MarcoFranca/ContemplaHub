export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { listCarteira, type CarteiraItem } from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function fmtCurrency(v: string | null) {
    if (!v) return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return `R$ ${n.toLocaleString("pt-BR")}`;
}

export default async function CarteiraPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

    let rows: CarteiraItem[] = [];
    let loadErr: string | null = null;

    try {
        rows = await listCarteira();
    } catch (e: unknown) {
        loadErr = e instanceof Error ? e.message : "Falha ao carregar carteira.";
    }

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Carteira de Clientes</h1>
                    <p className="text-sm text-muted-foreground">
                        Acompanhe contratos, assembleias e contemplações. Use “Leads” para pré-venda.
                    </p>
                </div>
                <Link href="/app/leads">
                    <Button variant="outline">Ver Leads</Button>
                </Link>
            </div>

            {loadErr && (
                <Card className="bg-red-500/10 border-red-500/30">
                    <CardHeader>
                        <CardTitle className="text-red-300">Erro</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-red-200">{loadErr}</CardContent>
                </Card>
            )}

            {!loadErr && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {rows.map((c) => (
                        <Card key={c.id} className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{c.nome}</span>
                                    <Badge
                                        variant={
                                            c.status === "contemplada"
                                                ? "default"
                                                : c.status === "ativa"
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                        className="capitalize"
                                    >
                                        {c.status}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm text-muted-foreground">
                                <p>🏢 {c.administradora ?? "—"}</p>
                                <p>💰 Carta: {fmtCurrency(c.valorCarta)}</p>
                                <p>📅 Assembleia: {c.assembleia ?? "—"}</p>
                                {c.motivo && <p>⭐ Contemplação: {c.motivo}</p>}

                                <div className="pt-3 flex justify-between">
                                    <Link href={`/app/clientes/${c.id}`}>
                                        <Button size="sm" variant="outline">
                                            Ver detalhes
                                        </Button>
                                    </Link>
                                    <form action={`/app/leads`} method="GET">
                                        <input type="hidden" name="fromClient" value={c.id} />
                                        <Button size="sm">Nova negociação</Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {rows.length === 0 && (
                        <p className="text-center text-muted-foreground col-span-full">
                            Nenhum cliente na carteira ainda.
                        </p>
                    )}
                </div>
            )}
        </main>
    );
}
