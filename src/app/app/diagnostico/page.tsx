export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import {
    Sparkles,
    ExternalLink,
    Share2,
    ToggleLeft,
    ToggleRight,
    Settings2,
    Users,
    ClipboardList,
    Inbox,
} from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/server";
import { listLandingPages, createLandingPage, toggleLandingActive } from "@/app/app/landing-pages/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/CopyInline";
import { ToastAnnouncer } from "@/components/ToastAnnouncer";

export default async function DiagnosticoPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return (
            <main className="p-6">
                <Card className="border-white/10 bg-white/5">
                    <CardHeader>
                        <CardTitle>Diagnóstico do Investidor</CardTitle>
                    </CardHeader>
                    <CardContent>Vincule-se a uma organização para usar esta página.</CardContent>
                </Card>
            </main>
        );
    }

    const landings = await listLandingPages();
    // "página" primária para o diagnóstico: prioriza uma ativa, senão a primeira
    const primary = landings.find((l) => l.active) ?? landings[0] ?? null;

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    const key = primary ? primary.slug ?? primary.public_hash : null;
    const shareUrl = key ? `${siteUrl}/diagnostico/${key}` : null;
    const relativeUrl = key ? `/diagnostico/${key}` : null;

    async function ativar() {
        "use server";
        await createLandingPage({ active: true });
        redirect("/app/diagnostico?toast=created");
    }

    async function toggle(id: string, next: boolean) {
        "use server";
        await toggleLandingActive(id, next);
        redirect(`/app/diagnostico?toast=${next ? "toggled_on" : "toggled_off"}`);
    }

    return (
        <div className="h-full overflow-y-auto">
            <main className="mx-auto max-w-5xl space-y-6 p-6">
                <ToastAnnouncer />

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15">
                            <Sparkles className="h-5 w-5 text-emerald-400" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold">Diagnóstico do Investidor</h1>
                            <p className="text-sm text-muted-foreground">
                                Um funil que gera um diagnóstico pro cliente e captura o lead direto na sua carteira.
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="border-white/10">
                        <Link href="/app/landing-pages">
                            <Settings2 className="mr-2 h-4 w-4" />
                            Avançado
                        </Link>
                    </Button>
                </div>

                {!primary ? (
                    /* ESTADO VAZIO — ativar */
                    <Card className="border-emerald-500/20 bg-emerald-500/[0.05]">
                        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                                <Sparkles className="h-7 w-7 text-emerald-400" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold">Ative seu diagnóstico</h2>
                                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                                    Vamos gerar um link exclusivo da sua organização. Quem preencher vira lead na sua carteira automaticamente.
                                </p>
                            </div>
                            {me.isManager ? (
                                <form action={ativar}>
                                    <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Ativar meu diagnóstico
                                    </Button>
                                </form>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Peça a um administrador da organização para ativar.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,360px)]">
                        {/* Coluna esquerda: link + como funciona */}
                        <div className="space-y-6">
                            {/* Link */}
                            <Card className="border-white/10 bg-white/5">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Share2 className="h-4 w-4 text-emerald-400" />
                                        Seu link do diagnóstico
                                    </CardTitle>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                            primary.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-muted-foreground"
                                        }`}
                                    >
                                        {primary.active ? "Ativo" : "Inativo"}
                                    </span>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center">
                                        <code className="flex-1 break-all text-sm text-emerald-200">{shareUrl}</code>
                                        <div className="flex shrink-0 gap-2">
                                            <CopyButton value={shareUrl ?? ""} />
                                            <Button asChild size="sm" variant="outline" className="border-white/10">
                                                <a href={relativeUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                                    Abrir
                                                </a>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {me.isManager && (
                                            <form action={toggle.bind(null, primary.id, !primary.active)}>
                                                <Button type="submit" size="sm" variant="outline" className="border-white/10">
                                                    {primary.active ? (
                                                        <>
                                                            <ToggleRight className="mr-1.5 h-4 w-4 text-emerald-400" />
                                                            Desativar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft className="mr-1.5 h-4 w-4" />
                                                            Ativar
                                                        </>
                                                    )}
                                                </Button>
                                            </form>
                                        )}
                                    </div>

                                    {!primary.active && (
                                        <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                                            O link está inativo. Quem abrir verá um aviso e não conseguirá enviar. Ative para começar a captar.
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Dica: coloque este link na bio do Instagram, no WhatsApp e nos anúncios.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Como funciona */}
                            <Card className="border-white/10 bg-white/5">
                                <CardHeader>
                                    <CardTitle className="text-base">Como funciona</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-3">
                                    <Passo icon={<Share2 className="h-4 w-4" />} n={1} titulo="Compartilhe o link" texto="Bio, anúncios, WhatsApp. O link é exclusivo da sua organização." />
                                    <Passo icon={<ClipboardList className="h-4 w-4" />} n={2} titulo="O cliente responde" texto="3 etapas rápidas e recebe um diagnóstico personalizado na hora." />
                                    <Passo icon={<Inbox className="h-4 w-4" />} n={3} titulo="Cai na carteira" texto="O lead entra automaticamente em Leads/Carteira, com o diagnóstico salvo." />
                                </CardContent>
                            </Card>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                Os leads aparecem em{" "}
                                <Link href="/app/leads" className="text-emerald-400 hover:underline">
                                    Leads
                                </Link>{" "}
                                e na{" "}
                                <Link href="/app/carteira" className="text-emerald-400 hover:underline">
                                    Carteira
                                </Link>
                                .
                            </div>
                        </div>

                        {/* Coluna direita: preview em celular */}
                        <div className="lg:sticky lg:top-6">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Pré-visualização
                            </p>
                            <div className="mx-auto w-full max-w-[320px] rounded-[2.2rem] border-4 border-neutral-800 bg-neutral-900 p-2 shadow-2xl">
                                <div className="mx-auto mb-1 h-1.5 w-16 rounded-full bg-neutral-700" />
                                <div className="overflow-hidden rounded-[1.6rem] bg-white">
                                    {relativeUrl ? (
                                        <iframe
                                            src={relativeUrl}
                                            title="Pré-visualização do diagnóstico"
                                            className="h-[560px] w-full"
                                        />
                                    ) : null}
                                </div>
                            </div>
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                É exatamente o que o cliente vê no celular.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function Passo({ icon, n, titulo, texto }: { icon: React.ReactNode; n: number; titulo: string; texto: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    {icon}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">Passo {n}</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-foreground">{titulo}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{texto}</p>
        </div>
    );
}
