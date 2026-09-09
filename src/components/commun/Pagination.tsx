"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function Pagination({ total, page, pageSize }: { total: number; page: number; pageSize: number }) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);
    const router = useRouter();
    const sp = useSearchParams();

    const go = (p: number) => {
        const qp = new URLSearchParams(sp.toString());
        qp.set("page", String(p));
        router.push(`?${qp.toString()}`);
    };

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-slate-400">
                Mostrando <strong className="font-medium text-slate-200">{start}-{end}</strong> de{" "}
                <strong className="font-medium text-slate-200">{total}</strong>
            </span>
            <div className="flex items-center justify-end gap-2">
                <button
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 disabled:opacity-50"
                    onClick={() => go(page - 1)}
                    disabled={page <= 1}
                >
                    Anterior
                </button>
                <span className="text-slate-400">Página {page} de {pages}</span>
                <button
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 disabled:opacity-50"
                    onClick={() => go(page + 1)}
                    disabled={page >= pages}
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}
