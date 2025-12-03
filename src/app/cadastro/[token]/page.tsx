// src/app/cadastro/[token]/page.tsx
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CadastroPFForm } from "./CadastroPFForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

type LeadCadastroPublic = {
    id: string;
    org_id: string;
    lead_id: string;
    proposta_id: string;
    tipo_cliente: "pf" | "pj";
    status: string;
    token_publico: string;
    // se você depois quiser anexar mais info (nome do cliente, título da proposta etc.)
    // pode incluir aqui também.
};

async function loadCadastroByToken(token: string): Promise<LeadCadastroPublic> {
    const res = await fetch(
        `${BACKEND_URL}/lead-cadastros/p/${encodeURIComponent(token)}`,
        { cache: "no-store" },
    );

    if (res.status === 404) {
        notFound();
    }

    if (!res.ok) {
        throw new Error(`Falha ao carregar cadastro: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as LeadCadastroPublic;
}

export default async function CadastroPublicPage({
                                                     params,
                                                 }: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const cadastro = await loadCadastroByToken(token);

    // Por enquanto vamos só tratar PF. Depois extendemos pra PJ com outro form.
    if (cadastro.tipo_cliente !== "pf") {
        // você pode customizar depois com uma página específica para PJ
        // ou redirecionar pra outra rota
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
            <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-400">
                            Autentika Consórcios · ContemplaHub
                        </p>
                        <h1 className="text-base md:text-lg font-semibold">
                            Finalização do cadastro para contratação
                        </h1>
                    </div>
                    <span className="text-[11px] text-slate-500">
            Protocolo: {cadastro.id.slice(0, 8)}...
          </span>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-6">
                <Card className="bg-slate-950/90 border-slate-800">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm md:text-base">
                            Seus dados para análise e emissão do contrato
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3 text-sm text-slate-300">
                        <p>
                            Recebemos a sua aprovação da proposta de consórcio. Agora precisamos
                            de algumas informações cadastrais para seguir com a análise e emissão
                            do contrato.
                        </p>
                        <p className="text-xs text-slate-400">
                            Os dados são tratados com segurança e utilizados apenas para fins de
                            análise de crédito e formalização do consórcio.
                        </p>
                    </CardContent>
                </Card>

                <Separator className="bg-slate-800/80" />

                {/* Formulário PF */}
                <Card className="bg-slate-950/90 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-sm md:text-base">
                            Dados pessoais – Pessoa Física
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CadastroPFForm token={cadastro.token_publico} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
