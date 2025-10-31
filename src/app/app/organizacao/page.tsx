export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getMinhaOrg, renomearOrg } from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default async function OrganizacaoPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return (
            <main className="p-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader><CardTitle>Organização</CardTitle></CardHeader>
                    <CardContent>Vincule-se a uma organização para acessar esta página.</CardContent>
                </Card>
            </main>
        );
    }

    const org = await getMinhaOrg();

    async function action(formData: FormData) {
        "use server";
        const nome = String(formData.get("nome") ?? "");
        await renomearOrg(nome);
    }

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                <h1 className="text-2xl font-semibold">Organização</h1>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>Dados básicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form action={action} className="space-y-4">
                        <div className="grid gap-2 max-w-md">
                            <label className="text-sm text-muted-foreground">ID</label>
                            <Input readOnly value={org?.id ?? ""} />
                        </div>

                        <div className="grid gap-2 max-w-md">
                            <label className="text-sm">Nome</label>
                            <Input name="nome" defaultValue={org?.nome ?? ""} required />
                        </div>

                        <div className="grid gap-2 max-w-md">
                            <label className="text-sm text-muted-foreground">Criada em</label>
                            <Input readOnly value={org?.created_at ? new Date(org.created_at).toLocaleString("pt-BR") : ""} />
                        </div>

                        <Button type="submit" disabled={!me.isManager}>Salvar</Button>
                        {!me.isManager && (
                            <p className="text-xs text-muted-foreground">
                                Apenas administradores podem editar o nome da organização.
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
