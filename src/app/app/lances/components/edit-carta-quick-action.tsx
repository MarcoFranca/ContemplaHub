"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import { EditCartaSheet } from "./EditCartaSheet";
import type { LanceCartaListItem } from "../types";

type Props = {
    item: LanceCartaListItem;
    competencia: string;
};

export function EditCartaQuickAction({ item, competencia }: Props) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="w-full justify-center"
            >
                <PencilLine className="mr-2 h-4 w-4" />
                Editar carta
            </Button>

            <EditCartaSheet
                open={open}
                onOpenChange={setOpen}
                cotaId={item.cota_id}
                competencia={competencia}
                initialData={{
                    grupo_codigo: item.grupo_codigo,
                    numero_cota: item.numero_cota,
                    produto: item.produto,
                    valor_carta: item.valor_carta ?? null,
                    valor_parcela: item.valor_parcela ?? null,
                    prazo: item.prazo ?? null,
                    status: item.status,
                    autorizacao_gestao: item.autorizacao_gestao,
                    embutido_permitido: item.embutido_permitido,
                    embutido_max_percent: item.embutido_max_percent ?? null,
                    fgts_permitido: item.fgts_permitido,
                    tipo_lance_preferencial: item.tipo_lance_preferencial ?? null,
                    estrategia: item.estrategia ?? null,
                    assembleia_dia: item.assembleia_dia ?? null,
                }}
                opcoesLanceFixo={item.opcoes_lance_fixo ?? []}
                onSuccess={() => {
                    router.refresh();
                }}
            />
        </>
    );
}