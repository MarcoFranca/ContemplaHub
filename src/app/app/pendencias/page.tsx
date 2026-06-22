export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BellRing, CheckCircle2, CircleAlert } from "lucide-react";

import { getPendencias } from "../_data/dashboard/get-pendencias";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(sp: SearchParams, key: string) {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
}

export default async function PendenciasPage({
    searchParams,
}: {
    searchParams?: Promise<SearchParams>;
}) {
    const sp = (await searchParams) ?? {};
    const sev = firstParam(sp, "sev") ?? "all"; // all | high | medium
    const cat = firstParam(sp, "cat") ?? "all"; // all | <categoria>

    const data = await getPendencias();
    if (!data) return <main className="p-6">Vincule-se a uma organização.</main>;

    const grupos = data.grupos
        .filter((g) => cat === "all" || g.categoria === cat)
        .map((g) => ({
            ...g,
            items: sev === "all" ? g.items : g.items.filter((i) => i.severity === sev),
        }))
        .filter((g) => g.items.length > 0);

    const sevQS = sev === "all" ? "" : `&sev=${sev}`;
    const categorias = [
        { key: "all", label: `Todas (${data.total})` },
        ...data.grupos.map((g) => ({ key: g.categoria, label: `${g.label} (${g.items.length})` })),
    ];

    const catQS = cat === "all" ? "" : `&cat=${cat}`;
    const filtros = [
        { key: "all", label: `Todas (${data.total})` },
        { key: "high", label: `Alta (${data.high})` },
        { key: "medium", label: `Média (${data.medium})` },
    ];

    return (
        <div className="h-full overflow-y-auto">
            <main className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar ao painel
                    </Link>
                    <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                        <BellRing className="h-6 w-6 text-emerald-500" />
                        Pendências
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Resolva item por item; cada pendência leva direto ao lugar de resolução.
                    </p>
                </div>

                {/* Subcategorias (tipo de pendência) */}
                <div className="flex flex-wrap gap-2">
                    {categorias.map((c) => (
                        <Link
                            key={c.key}
                            href={`/app/pendencias?cat=${c.key}${sevQS}`}
                            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                cat === c.key
                                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                                    : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {c.label}
                        </Link>
                    ))}
                </div>

                {/* Filtros de severidade */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Severidade:</span>
                    {filtros.map((f) => (
                        <Link
                            key={f.key}
                            href={`/app/pendencias?sev=${f.key}${catQS}`}
                            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                sev === f.key
                                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                                    : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                {grupos.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 p-12 text-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        <div>
                            <p className="font-medium">Tudo em dia</p>
                            <p className="text-sm text-muted-foreground">
                                Nenhuma pendência {sev === "all" ? "" : "desta severidade "}no momento.
                            </p>
                        </div>
                    </div>
                ) : (
                    grupos.map((g) => (
                        <section key={g.categoria} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                        g.severity === "high" ? "bg-rose-500" : "bg-amber-400"
                                    }`}
                                />
                                <h2 className="text-base font-semibold">{g.label}</h2>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                                    {g.items.length}
                                </span>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-white/10">
                                {g.items.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className="flex items-center justify-between gap-4 border-b border-white/5 px-4 py-3 transition-colors last:border-0 hover:bg-white/5"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span
                                                className={`mt-0.5 rounded-lg p-1.5 ${
                                                    item.severity === "high"
                                                        ? "bg-rose-500/10 text-rose-400"
                                                        : "bg-amber-500/10 text-amber-400"
                                                }`}
                                            >
                                                <CircleAlert className="h-4 w-4" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{item.title}</p>
                                                <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>
                                            </div>
                                        </div>
                                        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-300">
                                            {item.acaoLabel}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </main>
        </div>
    );
}
