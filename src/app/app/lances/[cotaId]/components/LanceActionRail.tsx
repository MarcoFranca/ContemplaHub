import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PencilLine, Sparkles } from "lucide-react";
import type { CotaLanceFixoOpcao, LancesCartaDetalhe } from "../../types";
import { DetalheHeaderActions } from "@/app/app/lances/components/detalhe-header-actions";

type Props = {
    cotaId: string;
    competencia: string;
    data: LancesCartaDetalhe;
};

export function LanceActionRail({ cotaId, competencia, data }: Props) {
    return (
        <Card className="border-white/10 bg-white/5 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="inline-flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4" />
                    Ações rápidas
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                <DetalheHeaderActions
                    cotaId={cotaId}
                    competencia={competencia}
                    cota={data.cota}
                    opcoesLanceFixo={(data.opcoes_lance_fixo ?? []) as CotaLanceFixoOpcao[]}
                />

                <Link href={`/app/lances?competencia=${competencia}`} className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para operação do mês
                    </Button>
                </Link>

                <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                    <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                        <PencilLine className="h-3.5 w-3.5" />
                        Diretriz
                    </p>
                    <p className="mt-2 text-sm text-slate-100">
                        Use “Editar carta” para corrigir assembleia, preferência de lance,
                        estratégia e modalidades fixas antes de operar a competência.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}