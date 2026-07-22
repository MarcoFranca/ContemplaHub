"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicAzosInterestButton({ publicHash, confirmed }: { publicHash: string; confirmed: boolean }) {
  const [done, setDone] = useState(confirmed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function confirm() {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/seguros/${encodeURIComponent(publicHash)}/interesse`, { method: "POST" });
      if (!response.ok) throw new Error("Não foi possível registrar seu interesse agora.");
      setDone(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível registrar seu interesse agora."); } finally { setLoading(false); }
  }
  if (done) return <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100"><p className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Interesse registrado</p><p className="mt-1 text-emerald-100/75">Um especialista entrará em contato para seguir com a formalização pela Azos.</p></div>;
  return <div className="space-y-3"><Button type="button" className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 sm:w-auto" onClick={confirm} disabled={loading}>{loading && <Loader2 className="animate-spin" />} Quero seguir com o atendimento</Button>{error && <p className="text-sm text-rose-300">{error}</p>}</div>;
}
