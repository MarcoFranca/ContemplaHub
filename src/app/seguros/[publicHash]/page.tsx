import { notFound } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicAzosInterestButton } from "./PublicAzosInterestButton";

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
export const dynamic = "force-dynamic";
type Coverage = { title?: string; code?: string; capital?: number; premium?: number; error?: string | null };
type PublicQuote = { cliente_primeiro_nome: string; status: string; total_premium?: number; coverages: Coverage[]; expires_at?: string };
const brl = (value?: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

async function loadQuote(hash: string): Promise<PublicQuote | null> {
  const response = await fetch(`${BACKEND_URL}/seguros/azos/p/${encodeURIComponent(hash)}`, { cache: "no-store" });
  return response.ok ? response.json() as Promise<PublicQuote> : null;
}

export default async function PublicAzosProposalPage({ params }: { params: Promise<{ publicHash: string }> }) {
  const { publicHash } = await params;
  const quote = await loadQuote(publicHash);
  if (!quote) notFound();
  return <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50"><div className="mx-auto max-w-2xl space-y-6"><header className="space-y-3"><div className="flex items-center gap-2 text-emerald-300"><ShieldCheck className="h-5 w-5" /><span className="text-sm font-medium">Seguro de Vida Azos</span></div><h1 className="text-3xl font-semibold">Olá, {quote.cliente_primeiro_nome}</h1><p className="text-slate-400">Confira sua cotação personalizada. Esta página não conclui a contratação.</p></header><Card className="border-emerald-500/30 bg-emerald-500/5"><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Seu prêmio mensal estimado</CardTitle><CardDescription>Valor calculado pela Azos para as coberturas selecionadas.</CardDescription></CardHeader><CardContent><p className="text-4xl font-semibold text-emerald-100">{brl(quote.total_premium)}</p></CardContent></Card><Card className="border-white/10 bg-slate-900/60"><CardHeader><CardTitle>Coberturas selecionadas</CardTitle></CardHeader><CardContent className="space-y-3">{quote.coverages.map((coverage, index) => <div key={`${coverage.code ?? "coverage"}-${index}`} className="flex flex-col justify-between gap-1 rounded-lg border border-white/10 p-3 text-sm sm:flex-row"><span>{coverage.title ?? coverage.code} · capital {brl(coverage.capital)}</span><span className={coverage.error ? "text-rose-300" : "text-emerald-300"}>{coverage.error ?? brl(coverage.premium)}</span></div>)}</CardContent></Card><section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"><h2 className="text-lg font-semibold">Quer dar seguimento?</h2><p className="mt-2 text-sm text-slate-400">Ao confirmar, avisaremos um atendente para entrar em contato e conduzir a formalização no processo autorizado da Azos.</p><div className="mt-4"><PublicAzosInterestButton publicHash={publicHash} confirmed={quote.status === "interesse_confirmado"} /></div></section><p className="text-center text-xs text-slate-500">Cotação sujeita à análise e às condições vigentes da Azos.</p></div></main>;
}
