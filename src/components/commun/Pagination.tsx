"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function Pagination({ total, page, pageSize }: { total: number; page: number; pageSize: number }) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const router = useRouter();
    const sp = useSearchParams();

    const go = (p: number) => {
        const qp = new URLSearchParams(sp.toString());
        qp.set("page", String(p));
        router.push(`?${qp.toString()}`);
    };

    return (
        <div className="flex items-center justify-end gap-2 text-sm">
            <button
                className="px-3 py-1 rounded bg-white/5 border border-white/10 disabled:opacity-50"
                onClick={() => go(page - 1)}
                disabled={page <= 1}
            >
                Anterior
            </button>
            <span className="opacity-70">Página {page} de {pages}</span>
            <button
                className="px-3 py-1 rounded bg-white/5 border border-white/10 disabled:opacity-50"
                onClick={() => go(page + 1)}
                disabled={page >= pages}
            >
                Próxima
            </button>
        </div>
    );
}
