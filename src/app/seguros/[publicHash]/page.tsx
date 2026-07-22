import { notFound } from "next/navigation";
import { CheckCircle2, Info, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicAzosInterestButton } from "./PublicAzosInterestButton";

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
export const dynamic = "force-dynamic";

type Coverage = { title?: string; code?: string; capital?: number; premium?: number; error?: string | null };
type RecommendationItem = { code: string; nome?: string; capital?: number; motivo?: string; prioridade?: string };
type Recommendation = { resumo?: string; ajuste?: string; coberturas?: RecommendationItem[] };
type PublicQuote = {
  cliente_primeiro_nome: string;
  status: string;
  total_premium?: number;
  coverages: Coverage[];
  recommendation?: Recommendation;
  expires_at?: string;
};

const brl = (value?: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

async function loadQuote(hash: string): Promise<PublicQuote | null> {
  const response = await fetch(`${BACKEND_URL}/seguros/azos/p/${encodeURIComponent(hash)}`, { cache: "no-store" });
  return response.ok ? response.json() as Promise<PublicQuote> : null;
}

export default async function PublicAzosProposalPage({ params }: { params: Promise<{ publicHash: string }> }) {
  const { publicHash } = await params;
  const quote = await loadQuote(publicHash);
  if (!quote) notFound();
  const recommendation = quote.recommendation ?? {};
  const rationaleByCode = new Map((recommendation.coberturas ?? []).map((item) => [item.code, item]));

  return <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50"><div className="mx-auto max-w-3xl space-y-6">
    <header className="space-y-3"><div className="flex items-center gap-2 text-emerald-300"><ShieldCheck className="h-5 w-5" /><span className="text-sm font-medium">Seguro de Vida Azos</span></div><h1 className="text-3xl font-semibold">Olá, {quote.cliente_primeiro_nome}</h1><p className="max-w-2xl text-slate-400">Esta sugestão foi estruturada a partir das necessidades informadas. Ela é uma cotação e não conclui a contratação.</p></header>

    {recommendation.resumo && <Card className="border-violet-400/25 bg-violet-500/5"><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-300" /> Como pensamos sua proteção</CardTitle></CardHeader><CardContent><p className="leading-relaxed text-slate-300">{recommendation.resumo}</p></CardContent></Card>}

    <Card className="border-emerald-500/30 bg-emerald-500/5"><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Prêmio mensal estimado</CardTitle><CardDescription>Valor calculado pela Azos para este conjunto de coberturas e capitais.</CardDescription></CardHeader><CardContent><p className="text-4xl font-semibold text-emerald-100">{brl(quote.total_premium)}</p></CardContent></Card>

    <Card className="border-white/10 bg-slate-900/60"><CardHeader><CardTitle>Coberturas e motivos</CardTitle><CardDescription>Veja o papel de cada proteção dentro da sugestão.</CardDescription></CardHeader><CardContent className="space-y-3">{quote.coverages.map((coverage, index) => { const rationale = rationaleByCode.get(coverage.code ?? ""); return <div key={`${coverage.code ?? "coverage"}-${index}`} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{coverage.title ?? rationale?.nome ?? coverage.code}</p>{rationale?.prioridade && <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-emerald-200">{rationale.prioridade}</span>}</div><p className="mt-1 text-sm text-slate-400">Capital sugerido: {brl(coverage.capital ?? rationale?.capital)}</p></div><span className={coverage.error ? "text-rose-300" : "text-emerald-300"}>{coverage.error ?? `${brl(coverage.premium)}/mês`}</span></div>{rationale?.motivo && <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-slate-300">{rationale.motivo}</p>}</div>; })}</CardContent></Card>

    <section className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-5"><div className="flex gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" /><div><h2 className="font-semibold">A proteção pode ser ajustada</h2><p className="mt-2 text-sm leading-relaxed text-slate-300">{recommendation.ajuste ?? "Os capitais e coberturas podem subir ou descer conforme sua preferência, orçamento e o teto efetivamente liberado pela Azos."}</p><p className="mt-2 text-xs text-slate-500">A aceitação, os limites finais, carências, franquias e condições dependem da análise e das regras vigentes da seguradora.</p></div></div></section>

    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><h2 className="text-lg font-semibold">Quer revisar ou dar seguimento?</h2><p className="mt-2 text-sm text-slate-400">Ao confirmar, um corretor poderá ajustar os valores com você e conduzir a formalização no processo autorizado da Azos.</p><div className="mt-4"><PublicAzosInterestButton publicHash={publicHash} confirmed={quote.status === "interesse_confirmado"} /></div></section>
    <p className="text-center text-xs text-slate-500">Cotação sujeita à análise de risco e às condições contratuais vigentes da Azos.</p>
  </div></main>;
}
