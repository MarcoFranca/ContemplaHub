export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getMinhaOrg, renomearOrg, criarOrg, atualizarContatoBranding } from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyInline";

export default async function OrganizacaoPage() {
    const me = await getCurrentProfile();

    // 1) Sem org: criar
    if (!me?.orgId) {
        async function actionCreate(formData: FormData) {
            "use server";
            const nome = String(formData.get("nome") ?? "");
            await criarOrg(nome);
        }

        return (
            <main className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                    <h1 className="text-2xl font-semibold">Criar organização</h1>
                </div>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader><CardTitle>Dados básicos</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <form action={actionCreate} className="space-y-4 max-w-md">
                            <div className="grid gap-2">
                                <Label>Nome da organização</Label>
                                <Input name="nome" placeholder="Ex.: Autentika Seguros" required />
                            </div>

                            <Button type="submit">Criar</Button>
                            <p className="text-xs text-muted-foreground">
                                Seu usuário será vinculado como administrador desta organização.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </main>
        );
    }

    // 2) Com org
    const org = await getMinhaOrg();
    const brand = (org?.brand ?? {}) as Record<string, unknown>;
    const brandLogo = (brand.logoUrl as string) ?? "";
    const brandPrimary = (brand.primary as string) ?? "";
    const brandSecondary = (brand.secondary as string) ?? "";

    async function actionRename(formData: FormData) {
        "use server";
        const nome = String(formData.get("nome") ?? "");
        await renomearOrg(nome);
    }

    async function actionContatoBranding(formData: FormData) {
        "use server";
        const obj = {
            slug: (formData.get("slug") as string) || null,
            active: (formData.get("active") as string) === "on",
            whatsapp_phone: (formData.get("whatsapp_phone") as string) || null,
            email_from: (formData.get("email_from") as string) || null,
            timezone: (formData.get("timezone") as string) || null,
            cnpj: (formData.get("cnpj") as string) || null,
            susep: (formData.get("susep") as string) || null,
            brand_logo: (formData.get("brand_logo") as string) || null,
            brand_primary: (formData.get("brand_primary") as string) || null,
            brand_secondary: (formData.get("brand_secondary") as string) || null,
        };
        await atualizarContatoBranding(obj);
    }

    // bloco “dados para LP” (JSON enxuto)
    const lpJson = JSON.stringify(
        {
            org_id: org?.id,
            org_nome: org?.nome,
            slug: org?.slug,
            whatsapp_phone: org?.whatsapp_phone,
            email_from: org?.email_from,
            timezone: org?.timezone,
            cnpj: org?.cnpj,
            susep: org?.susep,
            brand: { logoUrl: brandLogo, primary: brandPrimary, secondary: brandSecondary },
        },
        null,
        2
    );

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                    <h1 className="text-2xl font-semibold">Organização</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild><Link href="/app/usuarios">Usuários</Link></Button>
                    <Button variant="outline" asChild><Link href="/app/landing-pages">Landing Pages</Link></Button>
                </div>
            </div>

            {/* Básico */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Dados básicos</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <form action={actionRename} className="space-y-4">
                        <div className="grid gap-2 max-w-md">
                            <Label className="text-muted-foreground">ID</Label>
                            <div className="flex gap-2">
                                <Input readOnly value={org?.id ?? ""} />
                                <CopyButton value={org?.id ?? ""} />
                            </div>
                        </div>

                        <div className="grid gap-2 max-w-md">
                            <Label>Nome</Label>
                            <Input name="nome" defaultValue={org?.nome ?? ""} required />
                        </div>

                        <div className="grid gap-2 max-w-md">
                            <Label className="text-muted-foreground">Criada em</Label>
                            <Input readOnly value={org?.created_at ? new Date(org.created_at).toLocaleString("pt-BR") : ""} />
                        </div>

                        <Button type="submit" disabled={!me.isManager}>Salvar</Button>
                        {!me.isManager && (
                            <p className="text-xs text-muted-foreground">Apenas administradores podem editar.</p>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Contato & Branding */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Contato & Branding</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <form action={actionContatoBranding} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label>Slug (opcional)</Label>
                            <div className="flex gap-2">
                                <Input name="slug" placeholder="autentika" defaultValue={org?.slug ?? ""} />
                                <CopyButton value={org?.slug ?? ""} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Ativa</Label>
                            <div className="flex items-center gap-2">
                                <Switch name="active" defaultChecked={!!org?.active} />
                                <span className="text-sm text-muted-foreground">{org?.active ? "Ativa" : "Inativa"}</span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>WhatsApp padrão</Label>
                            <div className="flex gap-2">
                                <Input name="whatsapp_phone" placeholder="55DDDNNNNNNNN" defaultValue={org?.whatsapp_phone ?? ""} />
                                <CopyButton value={org?.whatsapp_phone ?? ""} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>E-mail de envio</Label>
                            <div className="flex gap-2">
                                <Input name="email_from" placeholder="contato@autentika.com.br" defaultValue={org?.email_from ?? ""} />
                                <CopyButton value={org?.email_from ?? ""} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Timezone</Label>
                            <div className="flex gap-2">
                                <Input name="timezone" placeholder="America/Sao_Paulo" defaultValue={org?.timezone ?? "America/Sao_Paulo"} />
                                <CopyButton value={org?.timezone ?? "America/Sao_Paulo"} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>CNPJ (opcional)</Label>
                            <div className="flex gap-2">
                                <Input name="cnpj" placeholder="00.000.000/0000-00" defaultValue={org?.cnpj ?? ""} />
                                <CopyButton value={org?.cnpj ?? ""} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>SUSEP (opcional)</Label>
                            <div className="flex gap-2">
                                <Input name="susep" placeholder="código" defaultValue={org?.susep ?? ""} />
                                <CopyButton value={org?.susep ?? ""} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Brand • Logo URL</Label>
                            <div className="flex gap-2">
                                <Input name="brand_logo" placeholder="https://..." defaultValue={brandLogo} />
                                <CopyButton value={brandLogo} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Brand • Primary</Label>
                            <div className="flex gap-2">
                                <Input name="brand_primary" placeholder="#10b981" defaultValue={brandPrimary} />
                                <CopyButton value={brandPrimary} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Brand • Secondary</Label>
                            <div className="flex gap-2">
                                <Input name="brand_secondary" placeholder="#0ea5e9" defaultValue={brandSecondary} />
                                <CopyButton value={brandSecondary} />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex items-center gap-3">
                            <Button type="submit" disabled={!me.isManager}>Salvar contato/branding</Button>
                            {!me.isManager && <p className="text-xs text-muted-foreground">Apenas administradores podem editar.</p>}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Bloco rápido para LP */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Dados para Landing Page</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Copie e cole este JSON na configuração/ENV da LP (ou use parcialmente).
                        </p>
                        <CopyButton value={lpJson} />
                    </div>
                    <Textarea readOnly value={lpJson} className="font-mono text-xs h-44" />
                </CardContent>
            </Card>
        </main>
    );
}
