import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentPartnerAccess } from "@/lib/auth/partner-server";
import { partnerBackendFetch } from "@/lib/backend-partner";

export default async function PartnerMePage() {
    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user || !session?.access_token) {
        redirect("/login");
    }

    const partner = await getCurrentPartnerAccess();
    if (!partner) {
        redirect("/app");
    }

    const data = await partnerBackendFetch("/partner/me", {
        method: "GET",
        accessToken: session.access_token,
    });

    const me = data?.me;
    const parceiro = data?.parceiro;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Minha conta</h1>
                <p className="text-sm text-muted-foreground">
                    Dados do seu acesso e cadastro de parceiro.
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Acesso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <Info label="Nome" value={me?.nome || "—"} />
                        <Info label="Email" value={me?.email || "—"} />
                        <Info label="Telefone" value={me?.telefone || "—"} />
                        <Info label="Ativo" value={me?.ativo ? "Sim" : "Não"} />
                        <Info
                            label="Ver contratos"
                            value={me?.can_view_contracts ? "Sim" : "Não"}
                        />
                        <Info
                            label="Ver comissões"
                            value={me?.can_view_commissions ? "Sim" : "Não"}
                        />
                        <Info
                            label="Ver dados do cliente"
                            value={me?.can_view_client_data ? "Sim" : "Não"}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cadastro do parceiro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <Info label="Nome" value={parceiro?.nome || "—"} />
                        <Info label="Email" value={parceiro?.email || "—"} />
                        <Info label="Telefone" value={parceiro?.telefone || "—"} />
                        <Info label="PIX tipo" value={parceiro?.pix_tipo || "—"} />
                        <Info label="PIX chave" value={parceiro?.pix_chave || "—"} />
                        <Info label="Ativo" value={parceiro?.ativo ? "Sim" : "Não"} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium">{value}</div>
        </div>
    );
}