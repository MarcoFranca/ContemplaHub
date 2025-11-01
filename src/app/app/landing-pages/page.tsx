export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import {
    listLandingPages,
    createLandingPage,
    toggleLandingActive,
    deleteLandingPage,
    regenHash,
} from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CopyButton } from "@/components/CopyInline";
import {
    Globe2,
    Link as LinkIcon,
    ToggleRight,
    ToggleLeft,
    RefreshCw,
    Trash2,
    Plus,
} from "lucide-react";
import { ToastAnnouncer } from "@/components/ToastAnnouncer";

function normalizeSlug(s: string | null | undefined) {
    const raw = (s ?? "").trim().toLowerCase();
    if (!raw) return null;
    return raw
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export default async function LandingPagesPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return (
            <main className="p-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle>Landing Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        Vincule-se a uma organização para acessar esta página.
                    </CardContent>
                </Card>
            </main>
        );
    }

    // Server action local para criar — redireciona com toast=created
    async function actionCreate(formData: FormData) {
        "use server";
        const slug = normalizeSlug(String(formData.get("slug") ?? ""));
        const allowedRaw = String(formData.get("allowed_domains") ?? "");
        const utmRaw = String(formData.get("utm_defaults") ?? "");
        const active = String(formData.get("active") ?? "") === "on";

        const allowed_domains = allowedRaw
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean);

        let utm_defaults: Record<string, unknown> | null = null;
        try {
            utm_defaults = utmRaw ? JSON.parse(utmRaw) : null;
            if (utm_defaults && typeof utm_defaults !== "object") utm_defaults = null;
        } catch {
            utm_defaults = null;
        }

        const out = await createLandingPage({
            slug,
            allowed_domains,
            utm_defaults,
            active,
        });

        redirect(`/app/landing-pages/${out.id}?toast=created`);
    }

    const rows = await listLandingPages();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

    return (
        <main className="p-6 space-y-6">
            {/* dispara toasts com base no query param ?toast=... */}
            <ToastAnnouncer />

            <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-emerald-400" />
                <h1 className="text-2xl font-semibold">Landing Pages</h1>
            </div>

            {/* Criar nova LP */}
            {me.isManager && (
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Criar nova Landing Page</CardTitle>
                        <Plus className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <form
                            action={actionCreate}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div className="space-y-2">
                                <Label>Slug (opcional, SEO)</Label>
                                <Input name="slug" placeholder="ex.: consorcio-imobiliario-sp" />
                                <p className="text-xs text-muted-foreground">
                                    Se deixar vazio, use apenas o link com <code>?h=HASH</code>.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Ativa</Label>
                                <div className="flex items-center gap-2">
                                    <Switch name="active" defaultChecked />
                                    <span className="text-sm text-muted-foreground">
                    Receber leads desta LP
                  </span>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-1">
                                <Label>Allowed Domains</Label>
                                <Textarea
                                    name="allowed_domains"
                                    placeholder={`ex.:
autentika.com.br
meu-wordpress.com
minha-lp.vercel.app`}
                                    className="h-28"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Um por linha (ou separado por vírgula). Verificado em{" "}
                                    <code>Origin/Referer</code>.
                                </p>
                            </div>

                            <div className="space-y-2 md:col-span-1">
                                <Label>UTM Defaults (JSON opcional)</Label>
                                <Textarea
                                    name="utm_defaults"
                                    placeholder='ex.: {"utm_source":"google","utm_medium":"cpc"}'
                                    className="h-28 font-mono text-xs"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Preenchidos quando a LP externa não enviar UTMs.
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <Button type="submit">Criar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Lista */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>Minhas páginas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {rows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma LP criada.</p>
                    ) : (
                        <ul className="space-y-2">
                            {rows.map((lp: any) => {
                                const publicUrl = lp.slug
                                    ? `${siteUrl}/lp/${lp.slug}`
                                    : `${siteUrl}/lp?h=${lp.public_hash}`;
                                return (
                                    <li
                                        key={lp.id}
                                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    title="Configurar"
                                                >
                                                    <Link
                                                        href={`/app/landing-pages/${lp.id}`}
                                                        prefetch={false}
                                                    >
                                                        Configurar
                                                    </Link>
                                                </Button>
                                                <LinkIcon className="h-4 w-4 text-emerald-400" />
                                                <span className="font-medium">
                          {lp.slug ?? `hash: ${lp.public_hash}`}
                        </span>
                                                <span className="text-xs text-muted-foreground">
                          • {lp.active ? "Ativa" : "Inativa"}
                        </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground break-all flex items-center gap-2">
                                                <span>{publicUrl}</span>
                                                <CopyButton value={publicUrl} />
                                            </div>
                                            {lp.allowed_domains?.length ? (
                                                <div className="text-[11px] text-muted-foreground">
                                                    Domínios: {lp.allowed_domains.join(", ")}
                                                </div>
                                            ) : (
                                                <div className="text-[11px] text-muted-foreground">
                                                    Domínios: (qualquer)
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Regenerar hash → volta com toast=hash */}
                                            <form
                                                action={async () => {
                                                    "use server";
                                                    await regenHash(lp.id);
                                                    redirect("/app/landing-pages?toast=hash");
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Gerar novo hash público"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            </form>

                                            {/* Toggle → volta com toast conforme estado */}
                                            <form
                                                action={async () => {
                                                    "use server";
                                                    const next = !lp.active;
                                                    await toggleLandingActive(lp.id, next);
                                                    redirect(
                                                        `/app/landing-pages?toast=${
                                                            next ? "toggled_on" : "toggled_off"
                                                        }`,
                                                    );
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    title={lp.active ? "Desativar" : "Ativar"}
                                                >
                                                    {lp.active ? (
                                                        <ToggleRight className="h-4 w-4" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </form>

                                            {/* Delete → volta com toast=deleted */}
                                            <form
                                                action={async () => {
                                                    "use server";
                                                    await deleteLandingPage(lp.id);
                                                    redirect("/app/landing-pages?toast=deleted");
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-400"
                                                    title="Excluir"
                                                >
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
