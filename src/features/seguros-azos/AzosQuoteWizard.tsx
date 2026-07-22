"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Copy, Link2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/form/MoneyInput";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { parseMoneyBRCents } from "@/lib/masks";
import { createAzosQuoteAction, listAzosCoveragesAction, listAzosProfessionsAction, publishAzosQuoteAction, type AzosCoverage, type AzosProfession, type AzosPublicProposal, type AzosQuoteResult } from "./actions";
import { azosProfileSchema, azosQuoteSchema, type AzosProfileInput } from "./schema";

type ProfileState = { data_nascimento: string; sexo: "m" | "f" | ""; altura_m: string; peso_kg: string; fumante: boolean; renda_mensal: string; profissao_id: string; consentimento_confirmado: boolean };
type SelectedCoverage = { code: string; capital: string };
const initialProfile: ProfileState = { data_nascimento: "", sexo: "", altura_m: "", peso_kg: "", fumante: false, renda_mensal: "", profissao_id: "", consentimento_confirmado: false };
const brl = (value?: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
const defaultCapital = (coverage: AzosCoverage) => String(Math.floor(Math.min(coverage.capital?.max_covered_capital ?? 1000, 100000) / (coverage.capital?.capital_multiple || 1000)) * (coverage.capital?.capital_multiple || 1000));

export function AzosQuoteWizard({ leadId, leadName, initialData }: { leadId: string; leadName: string; initialData: { data_nascimento: string; renda_mensal: number | null } }) {
  const [profile, setProfile] = useState<ProfileState>(() => ({ ...initialProfile, data_nascimento: initialData.data_nascimento, renda_mensal: initialData.renda_mensal == null ? "" : initialData.renda_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }));
  const [professions, setProfessions] = useState<AzosProfession[]>([]);
  const [coverages, setCoverages] = useState<AzosCoverage[]>([]);
  const [selected, setSelected] = useState<Record<string, SelectedCoverage>>({});
  const [result, setResult] = useState<AzosQuoteResult | null>(null);
  const [publicProposal, setPublicProposal] = useState<AzosPublicProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProfessions, startProfessions] = useTransition();
  const [loadingCoverages, startCoverages] = useTransition();
  const [creatingQuote, startQuote] = useTransition();
  const [publishingQuote, startPublish] = useTransition();

  useEffect(() => { startProfessions(async () => { const response = await listAzosProfessionsAction(); if (response.ok) setProfessions(response.data); else setError(response.error); }); }, []);
  function setField<K extends keyof ProfileState>(key: K, value: ProfileState[K]) { setProfile((current) => ({ ...current, [key]: value })); }
  function validProfile(): AzosProfileInput | null { const parsed = azosProfileSchema.safeParse({ ...profile, renda_mensal: parseMoneyBRCents(profile.renda_mensal) }); if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revise os dados de cotação."); return null; } return parsed.data; }
  function findCoverages() { const parsed = validProfile(); if (!parsed) return; setError(null); setResult(null); startCoverages(async () => { const response = await listAzosCoveragesAction(leadId, parsed); if (!response.ok) return setError(response.error); setCoverages(response.data.filter((coverage) => coverage.available)); setSelected({}); }); }
  function toggleCoverage(coverage: AzosCoverage, checked: boolean) { setSelected((current) => { if (!checked) { const next = { ...current }; delete next[coverage.coverage_code]; return next; } return { ...current, [coverage.coverage_code]: { code: coverage.coverage_code, capital: defaultCapital(coverage) } }; }); }
  function createQuote() { const parsed = validProfile(); if (!parsed) return; const payload = azosQuoteSchema.safeParse({ perfil: parsed, coberturas: Object.values(selected).map((item) => ({ code: item.code, capital: Number(item.capital) })) }); if (!payload.success) return setError(payload.error.issues[0]?.message ?? "Selecione uma cobertura válida."); setError(null); startQuote(async () => { const response = await createAzosQuoteAction(leadId, payload.data); if (response.ok) setResult(response.data); else setError(response.error); }); }

  function publishQuote() { const quoteId = result?.id; if (!quoteId) return setError("Não foi possível identificar esta cotação."); setError(null); startPublish(async () => { const response = await publishAzosQuoteAction(quoteId); if (response.ok) setPublicProposal(response.data); else setError(response.error); }); }
  async function copyText(value: string) { try { await navigator.clipboard.writeText(value); } catch { setError("Não foi possível copiar automaticamente. Selecione o texto para copiar."); } }

  return <div className="h-full overflow-y-auto"><div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-slate-950 p-5 md:flex-row md:justify-between">
      <div className="space-y-2"><Link href={`/app/leads/${leadId}`} className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100"><ArrowLeft className="h-3.5 w-3.5" /> Voltar ao lead</Link><div className="flex items-center gap-2 text-emerald-300"><ShieldCheck className="h-5 w-5" /><span className="text-sm font-medium">Seguro de Vida Azos</span></div><h1 className="text-2xl font-semibold">Cotação para {leadName}</h1><p className="max-w-2xl text-sm text-slate-400">A contratação final continua no canal oficial da Azos.</p></div>
      <div className="h-fit rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-100/80">Dados usados somente para cotação, com ciência do cliente.</div>
    </div>
    {error && <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
    <Card className="border-white/10 bg-slate-950/40"><CardHeader><CardTitle>1. Perfil de cotação</CardTitle><CardDescription>Informe os dados exatamente como confirmados pelo cliente.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Field label="Data de nascimento"><Input type="date" value={profile.data_nascimento} onChange={(e) => setField("data_nascimento", e.target.value)} /></Field>
      <Field label="Sexo"><Select value={profile.sexo} onValueChange={(value: "m" | "f") => setField("sexo", value)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="m">Masculino</SelectItem><SelectItem value="f">Feminino</SelectItem></SelectContent></Select></Field>
      <Field label="Altura (m)"><Input inputMode="decimal" placeholder="1,75" value={profile.altura_m} onChange={(e) => setField("altura_m", e.target.value.replace(",", "."))} /></Field>
      <Field label="Peso (kg)"><Input inputMode="decimal" placeholder="75" value={profile.peso_kg} onChange={(e) => setField("peso_kg", e.target.value.replace(",", "."))} /></Field>
      <Field label="Renda mensal"><MoneyInput placeholder="0,00" value={profile.renda_mensal} onChange={(value) => setField("renda_mensal", value)} /></Field>
      <Field label="Profissão atual"><Select value={profile.profissao_id} onValueChange={(value) => setField("profissao_id", value)} disabled={loadingProfessions}><SelectTrigger><SelectValue placeholder={loadingProfessions ? "Carregando..." : "Selecione"} /></SelectTrigger><SelectContent>{professions.map((profession) => <SelectItem key={profession._id} value={profession._id}>{profession.name}</SelectItem>)}</SelectContent></Select></Field>
      <Field label="Fuma?"><Select value={profile.fumante ? "sim" : "nao"} onValueChange={(value) => setField("fumante", value === "sim")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nao">Não</SelectItem><SelectItem value="sim">Sim</SelectItem></SelectContent></Select></Field>
      <div className="flex items-end"><Button type="button" className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400" onClick={findCoverages} disabled={loadingCoverages || loadingProfessions}>{loadingCoverages ? <Loader2 className="animate-spin" /> : <Sparkles />} Ver coberturas</Button></div>
      <label className="col-span-full flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300"><Checkbox checked={profile.consentimento_confirmado} onCheckedChange={(checked) => setField("consentimento_confirmado", checked === true)} /><span>Confirmo que o cliente está ciente do uso destes dados para a cotação de Seguro de Vida Azos.</span></label>
    </CardContent></Card>
    {coverages.length > 0 && <Card className="border-white/10 bg-slate-950/40"><CardHeader><CardTitle>2. Coberturas elegíveis</CardTitle><CardDescription>Escolha a cobertura e o capital desejado. A Azos valida limites e dependências.</CardDescription></CardHeader><CardContent className="space-y-3">{coverages.map((coverage) => { const chosen = selected[coverage.coverage_code]; return <div key={coverage.coverage_code} className={cn("grid gap-3 rounded-xl border p-4 md:grid-cols-[auto_1fr_180px] md:items-center", chosen ? "border-emerald-500/35 bg-emerald-500/5" : "border-white/10 bg-white/[0.02]")}><Checkbox checked={Boolean(chosen)} onCheckedChange={(checked) => toggleCoverage(coverage, checked === true)} /><div><p className="font-medium">{coverage.commercial_name}</p><p className="mt-1 text-xs text-slate-400">Capital máximo: {brl(coverage.capital?.max_covered_capital)}{coverage.parent?.length ? " · Depende de outra cobertura" : ""}</p></div><Field label="Capital segurado"><MoneyInput disabled={!chosen} value={chosen ? Number(chosen.capital).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""} onChange={(value) => setSelected((current) => ({ ...current, [coverage.coverage_code]: { ...current[coverage.coverage_code], capital: String(parseMoneyBRCents(value) ?? 0) } }))} /></Field></div>})}</CardContent><div className="flex justify-end border-t border-white/10 px-6 py-4"><Button type="button" onClick={createQuote} disabled={creatingQuote || !Object.keys(selected).length}>{creatingQuote ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Gerar cotação</Button></div></Card>}
    {result && <Card className="border-emerald-500/30 bg-emerald-500/5"><CardHeader><CardTitle className="flex items-center gap-2 text-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-400" />Cotação gerada</CardTitle><CardDescription>A contratação não foi concluída. Siga o processo autorizado da Azos para formalização.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="rounded-xl border border-emerald-400/20 bg-slate-950/40 p-4"><p className="text-xs uppercase tracking-wide text-emerald-300">Prêmio mensal estimado</p><p className="mt-1 text-3xl font-semibold">{brl(result.total_premium)}</p></div>{result.coverages?.map((coverage) => <div key={coverage.code} className="flex flex-col justify-between gap-2 rounded-lg border border-white/10 bg-slate-950/30 px-3 py-2 text-sm sm:flex-row sm:items-center"><span>{coverage.title} · capital {brl(coverage.capital)}</span><span className={coverage.error ? "text-rose-300" : "text-emerald-300"}>{coverage.error ?? brl(coverage.premium)}</span></div>)}</CardContent></Card>}
    {result && <Card className="border-sky-400/25 bg-sky-500/5"><CardHeader><CardTitle>Enviar proposta ao cliente</CardTitle><CardDescription>Gere um link público separado do Consórcio. O cliente poderá confirmar o interesse, criando um atendimento pendente para a equipe.</CardDescription></CardHeader><CardContent className="space-y-4">{!publicProposal ? <Button type="button" onClick={publishQuote} disabled={publishingQuote}>{publishingQuote ? <Loader2 className="animate-spin" /> : <Link2 />} Gerar link da proposta</Button> : <><div className="flex gap-2"><Input readOnly value={publicProposal.public_url} /><Button type="button" variant="outline" size="icon" aria-label="Copiar link" onClick={() => copyText(publicProposal.public_url)}><Copy className="h-4 w-4" /></Button></div><div className="space-y-2"><Label>Mensagem sugerida para WhatsApp</Label><div className="flex gap-2"><textarea readOnly className="min-h-24 flex-1 rounded-md border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200" value={publicProposal.whatsapp_message} /><Button type="button" variant="outline" size="icon" aria-label="Copiar mensagem" onClick={() => copyText(publicProposal.whatsapp_message)}><Copy className="h-4 w-4" /></Button></div></div></>}</CardContent></Card>}
  </div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }
