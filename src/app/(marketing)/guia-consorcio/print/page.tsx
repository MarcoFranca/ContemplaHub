// app/(marketing)/guia-consorcio/print/page.tsx
import { cn } from "@/lib/utils";

export const dynamic = "force-static"; // opcional: pode ser estático

export default function GuiaPrintPage({
                                          searchParams,
                                      }: {
    searchParams: { lp?: string };
}) {
    const lp = searchParams.lp ?? "autentika"; // só para preview

    return (
        <html lang="pt-BR">
        <head>
            <style>{`
          @page { size: A4; margin: 14mm 14mm; }
          html, body { background: white !important; }
          .page-break { break-before: page; page-break-before: always; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        `}</style>
        </head>
        <body className={cn("text-slate-900")}>
        {/* CAPA */}
        <section className="avoid-break">
            <div className="mb-8">
                <div className="text-xs uppercase tracking-widest text-slate-500">
                    Guia gratuito • Planeje hoje, conquiste sempre
                </div>
                <h1 className="mt-3 text-4xl font-semibold">
                    Guia Estratégico do Consórcio
                </h1>
                <p className="mt-3 text-lg text-slate-600">
                    Como usar consórcio como estratégia de alavancagem patrimonial previsível, segura e sem juros.
                </p>

                <div className="mt-8 rounded-xl border p-4">
                    <div className="text-sm font-medium">Importante</div>
                    <p className="mt-1 text-sm text-slate-600">
                        Material educativo. Não contém promessas de contemplação. Resultados dependem de perfil, regras da administradora e estratégia.
                    </p>
                </div>
            </div>
        </section>

        {/* SUMÁRIO */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">Sumário</h2>
            <ol className="mt-4 list-decimal pl-5 text-slate-700">
                <li>Consórcio x Financiamento</li>
                <li>Como funciona a contemplação (sorteio e lance)</li>
                <li>Estratégias de lance por perfil</li>
                <li>Simulações e cenários práticos</li>
                <li>Checklist LGPD e compliance</li>
            </ol>
        </section>

        {/* CONTEÚDO (exemplo) */}
        <section className="page-break">
            <h2 className="text-2xl font-semibold">1) Consórcio x Financiamento</h2>
            <p className="mt-3 text-slate-700">
                Aqui entra o conteúdo estruturado, com tabelas, exemplos e boxes.
            </p>

            <div className="avoid-break mt-6 rounded-xl border p-4">
                <div className="text-sm font-semibold">Resumo executivo</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                    <li>Consórcio: sem juros, com taxa de administração e regras de assembleia.</li>
                    <li>Financiamento: juros + CET; maior previsibilidade de aquisição imediata.</li>
                </ul>
            </div>
        </section>
        </body>
        </html>
    );
}
