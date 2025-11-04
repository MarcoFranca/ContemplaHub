// src/app/app/leads/ui/InterestDetailsDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

type Interest = {
    produto?: string | null;
    valorTotal?: string | null;
    prazoMeses?: number | null;
    objetivo?: string | null;
    perfilDesejado?: string | null;
    observacao?: string | null;
};

export function InterestDetailsDialog({ interest }: { interest: Interest }) {
    const { produto, valorTotal, prazoMeses, objetivo, perfilDesejado, observacao } = interest;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Ver interesse</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg md:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Interesse do lead</DialogTitle>
                </DialogHeader>

                <div className="grid gap-3 text-sm">
                    <Field label="Produto" value={produto} />
                    <div className="grid gap-1 md:grid-cols-2">
                        <Field label="Valor total" value={formatMoeda(valorTotal)} />
                        <Field label="Prazo (meses)" value={prazoMeses} />
                    </div>
                    <Field label="Objetivo" value={objetivo} />
                    <Field label="Perfil" value={perfilDesejado} />
                    <Field label="Observação" value={observacao} multiline />
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline">Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Field({
                   label, value, multiline,
               }: { label: string; value?: unknown; multiline?: boolean }) {
    const content = value ?? "—";
    return (
        <div className="grid gap-1">
            <span className="text-muted-foreground">{label}</span>
            <span className={multiline ? "font-medium whitespace-pre-wrap break-words" : "font-medium truncate"}>
        {String(content)}
      </span>
        </div>
    );
}

function formatMoeda(v?: string | null) {
    if (!v) return "—";
    const n = Number(String(v).replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? `R$ ${n.toLocaleString("pt-BR")}` : String(v);
}
