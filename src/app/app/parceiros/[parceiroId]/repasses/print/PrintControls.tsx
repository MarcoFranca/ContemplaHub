"use client";

import * as React from "react";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function PrintControls({ voltarHref, docTitle }: { voltarHref: string; docTitle?: string }) {
    React.useEffect(() => {
        if (!docTitle) return;
        const anterior = document.title;
        document.title = docTitle;
        return () => {
            document.title = anterior;
        };
    }, [docTitle]);

    return (
        <div className="no-print mb-4 flex items-center justify-between gap-3">
            <Link href={voltarHref} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
                <ArrowLeft className="h-4 w-4" />
                Voltar
            </Link>
            <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
                <Printer className="h-4 w-4" />
                Salvar PDF / Imprimir
            </button>
        </div>
    );
}
