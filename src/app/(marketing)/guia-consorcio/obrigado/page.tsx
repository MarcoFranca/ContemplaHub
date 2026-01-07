// app/(marketing)/guia-consorcio/obrigado/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { downloadGuideUrl, buildGuidePdf } from "../api";

export default function ObrigadoPage() {
    const sp = useSearchParams();
    const leadId = sp.get("lead");

    // Para testar agora: manter hash fixo (igual seu LeadForm).
    // Depois você pode passar via query ?lp= ou puxar de config.
    const landingHash = useMemo(() => sp.get("lp") ?? "autentika", [sp]);

    const href = leadId ? downloadGuideUrl(leadId) : null;

    const [pending, startTransition] = useTransition();
    const [buildInfo, setBuildInfo] = useState<{ bucket: string; path: string } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const canBuildFromFront = Boolean(process.env.NEXT_PUBLIC_INTERNAL_PDF_TOKEN);

    if (!leadId) {
        return (
            <main className="mx-auto max-w-xl px-6 py-12">
                <h1 className="text-2xl font-semibold">Não foi possível identificar seu cadastro</h1>
                <p className="mt-2 text-muted-foreground">
                    Volte e preencha o formulário para liberar o download do guia.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/guia-consorcio">Voltar</Link>
                </Button>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-xl px-6 py-12">
            <h1 className="text-2xl font-semibold">Tudo certo!</h1>
            <p className="mt-2 text-muted-foreground">
                Seu acesso ao guia foi liberado. Clique abaixo para baixar o PDF.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                    <a href={href!}>Baixar guia (PDF)</a>
                </Button>

                <Button asChild size="lg" variant="outline">
                    <Link href="/guia-consorcio">Voltar</Link>
                </Button>
            </div>

            {canBuildFromFront ? (
                <div className="mt-8 rounded-xl border p-4">
                    <div className="text-sm font-semibold">Dev/Staging</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Se o PDF ainda não foi publicado no bucket, gere agora para o hash: <span className="font-mono">{landingHash}</span>.
                    </p>

                    {errorMsg ? <p className="mt-2 text-sm text-destructive">{errorMsg}</p> : null}
                    {buildInfo ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                            PDF gerado em <span className="font-mono">{buildInfo.bucket}/{buildInfo.path}</span>
                        </p>
                    ) : null}

                    <div className="mt-3">
                        <Button
                            type="button"
                            disabled={pending}
                            onClick={() => {
                                setErrorMsg(null);
                                startTransition(async () => {
                                    try {
                                        const res = await buildGuidePdf(landingHash);
                                        setBuildInfo({ bucket: res.bucket, path: res.path });
                                    } catch (e: any) {
                                        setErrorMsg(e?.message ?? "Falha ao gerar PDF.");
                                    }
                                });
                            }}
                        >
                            {pending ? "Gerando..." : "Gerar PDF agora"}
                        </Button>
                    </div>
                </div>
            ) : null}

            <p className="mt-6 text-xs text-muted-foreground">
                Material educativo. Não contém promessa de contemplação. Download liberado mediante consentimento (LGPD).
            </p>
        </main>
    );
}
