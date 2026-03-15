"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {EditCartaSheet} from "@/app/app/lances/components/EditCartaSheet";

type Props = {
    cotaId: string;
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

export function DetalheHeaderActions({ cotaId, cota, opcoesLanceFixo = [] }: Props) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Editar carta</Button>

            <EditCartaSheet
                open={open}
                onOpenChange={setOpen}
                cotaId={cotaId}
                initialData={cota}
                opcoesLanceFixo={opcoesLanceFixo}
                onSuccess={() => window.location.reload()}
            />
        </>
    );
}