"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";


type Props = {
    cotaId: string;
    competencia?: string;
    cota: {
        grupo_codigo: string;
        numero_cota: string;
        produto: string;
        valor_carta?: number | string | null;
        valor_parcela?: number | string | null;
        prazo?: number | null;
        status: string;
        autorizacao_gestao: boolean;
        embutido_permitido: boolean;
        embutido_max_percent?: number | string | null;
        fgts_permitido: boolean;
        tipo_lance_preferencial?: string | null;
        estrategia?: string | null;
        objetivo?: string | null;
        assembleia_dia?: number | null;
        data_adesao?: string | null;
    };
    opcoesLanceFixo?: Array<{
        id: string;
        cota_id: string;
        percentual: number | string;
        ordem: number;
        ativo: boolean;
        observacoes?: string | null;
        created_at?: string | null;
    }>;
};

export function DetalheHeaderActions({
                                         cotaId,
                                         competencia,
                                         cota,
                                         opcoesLanceFixo = [],
                                     }: Props) {
    const [open, setOpen] = React.useState(false);

    // const data = React.useMemo(
    //     () =>
    //         mapLegacyCartaToEditSheetData({
    //             cotaId,
    //             competencia,
    //             cota,
    //             opcoesLanceFixo,
    //         }),
    //     [cotaId, competencia, cota, opcoesLanceFixo]
    // );

    return (
        <>
            <Button onClick={() => setOpen(true)}>Editar carta</Button>

            {/*<EditCartaSheetV2*/}
            {/*    open={open}*/}
            {/*    onOpenChange={setOpen}*/}
            {/*    data={data}*/}
            {/*    onSuccess={() => window.location.reload()}*/}
            {/*/>*/}
        </>
    );
}