import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

type LegalPageShellProps = {
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPageShell({
  title,
  description,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o site
          </Link>

          <a
            href="mailto:contato@autentikadigital.com"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 transition hover:border-emerald-300/40 hover:bg-emerald-400/15"
          >
            <Mail className="h-4 w-4" />
            contato@autentikadigital.com
          </a>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-slate-950/65 p-7 shadow-[0_24px_80px_-40px_rgba(16,185,129,0.45)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Documento institucional
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                {description}
              </p>
            </div>

            <div className="inline-flex w-fit rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
              <span className="font-medium text-white">Última atualização:</span>
              <span className="ml-2">{lastUpdated}</span>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-7 text-slate-300 sm:text-[15px]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
