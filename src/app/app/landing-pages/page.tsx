export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { listLandingPages, createLandingPage, toggleLandingActive, deleteLandingPage, regenHash } from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe2, Link as LinkIcon, RefreshCw, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default async function LandingPagesPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return (
            <main className="p-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader><CardTitle>Landing Pages</CardTitle></CardHeader>
                    <CardContent>Vincule-se a uma organização para acessar esta página.</CardContent>
                </Card>
            </main>
        );
    }

    const rows = await listLandingPages();

    async function onCreate(formData: FormData) {
        "use server";
        const slug = String(formData.get("slug") ?? "").trim() || null;
        await createLandingPage({ slug });
    }

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-emerald-400" />
                <h1 className="text-2xl font-semibold">Landing Pages</h1>
            </div>

            {/* Criar nova LP */}
            {me.isManager && (
                <Card className="bg-white/5 border-white/10">
                    <CardHeader><CardTitle>Criar</CardTitle></CardHeader>
                    <CardContent>
                        <form action={onCreate} className="flex flex-col md:flex-row gap-3">
                            <div className="grid gap-2">
                                <label className="text-sm">Slug (opcional, SEO)</label>
                                <Input name="slug" placeholder="ex.: consorcio-imobiliario-sp" />
                            </div>
                            <div className="md:self-end">
                                <Button type="submit">Criar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Lista */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Minhas páginas</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {rows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma LP criada.</p>
                    ) : (
                        <ul className="space-y-2">
                            {rows.map((lp: any) => {
                                const publicUrl = lp.slug
                                    ? `${process.env.NEXT_PUBLIC_SITE_URL}/lp/${lp.slug}`
                                    : `${process.env.NEXT_PUBLIC_SITE_URL}/lp?h=${lp.public_hash}`;

                                return (
                                    <li key={lp.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <LinkIcon className="h-4 w-4 text-emerald-400" />
                                                <span className="font-medium">{lp.slug ?? `hash: ${lp.public_hash}`}</span>
                                                <span className="text-xs text-muted-foreground">• {lp.active ? "Ativa" : "Inativa"}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground break-all">{publicUrl}</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <form action={async () => { "use server"; await regenHash(lp.id); }}>
                                                <Button type="submit" variant="ghost" size="icon" title="Gerar novo hash">
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            </form>

                                            <form action={async () => { "use server"; await toggleLandingActive(lp.id, !lp.active); }}>
                                                <Button type="submit" variant="ghost" size="icon" title={lp.active ? "Desativar" : "Ativar"}>
                                                    {lp.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                                </Button>
                                            </form>

                                            <form action={async () => { "use server"; await deleteLandingPage(lp.id); }}>
                                                <Button type="submit" variant="ghost" size="icon" className="text-red-400" title="Excluir">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
