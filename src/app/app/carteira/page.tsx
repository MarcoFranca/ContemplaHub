export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { listCarteira, type CarteiraItem } from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function fmtCurrency(v: number | null) {
    if (v == null) return "—";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CarteiraPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return <main className="p-6">Vincule-se a uma organização.</main>;
    }

    let rows: CarteiraItem[] = [];
    let loadErr: string | null = null;

    try {
        rows = await listCarteira();
    } catch (err: unknown) {
        loadErr = err instanceof Error ? err.message : "Erro ao carregar carteira.";
    }

    return (
        <main className="p-6 space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Carteira de Clientes</h1>
                    <p className="text-sm text-muted-foreground">
                        Acompanhe clientes ativos, pendências e contratos em andamento.
                    </p>
                </div>

                <Link href="/app/leads">
                    <Button variant="outline">Ver Leads</Button>
                </Link>
            </div>

            {/* ERRO */}
            {loadErr && (
                <Card className="bg-red-500/10 border-red-500/30">
                    <CardHeader>
                        <CardTitle className="text-red-300">Erro</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-red-200">
                        {loadErr}
                    </CardContent>
                </Card>
            )}

            {/* GRID DA CARTEIRA */}
            {!loadErr && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {rows.map((c) => (
                        <Card key={c.contratoId} className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{c.nome}</span>
                                    <Badge className="capitalize">{c.status}</Badge>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="text-sm space-y-1 text-muted-foreground">
                                <p>🏢 {c.administradora ?? "—"}</p>
                                <p>💰 Carta: {fmtCurrency(c.valorCarta)}</p>
                                <p>📝 Assinatura: {c.dataAssinatura ?? "—"}</p>

                                <div className="pt-3 flex justify-between">
                                    <Link href={`/app/clientes/${c.leadId}`}>
                                        <Button size="sm" variant="outline">
                                            Ver cliente
                                        </Button>
                                    </Link>

                                    <form action="/app/leads" method="GET">
                                        <input type="hidden" name="fromClient" value={c.leadId} />
                                        <Button size="sm">
                                            Nova negociação
                                        </Button>
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
