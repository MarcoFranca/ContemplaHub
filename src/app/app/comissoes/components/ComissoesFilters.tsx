"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ParceiroOption } from "../types";

type Props = {
  parceiros: ParceiroOption[];
};

export function ComissoesFilters({ parceiros }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [form, setForm] = React.useState({
    parceiro_id: params.get("parceiro_id") ?? "",
    status: params.get("status") ?? "",
    repasse_status: params.get("repasse_status") ?? "",
    competencia_de: params.get("competencia_de") ?? "",
    competencia_ate: params.get("competencia_ate") ?? "",
  });

  function apply() {
    const next = new URLSearchParams(params.toString());
    Object.entries(form).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.push(`${pathname}?${next.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="pt-6 grid gap-3 md:grid-cols-5">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Parceiro</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.parceiro_id} onChange={(e) => setForm((p) => ({ ...p, parceiro_id: e.target.value }))}>
            <option value="">Todos</option>
            {parceiros.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Status do lançamento</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="">Todos</option>
            <option value="previsto">Previsto</option>
            <option value="disponivel">Disponível</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Repasse</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.repasse_status} onChange={(e) => setForm((p) => ({ ...p, repasse_status: e.target.value }))}>
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Competência de</label>
          <Input type="date" value={form.competencia_de} onChange={(e) => setForm((p) => ({ ...p, competencia_de: e.target.value }))} />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Competência até</label>
          <Input type="date" value={form.competencia_ate} onChange={(e) => setForm((p) => ({ ...p, competencia_ate: e.target.value }))} />
        </div>

        <div className="md:col-span-5 flex justify-end gap-2">
          <Button variant="outline" onClick={clearAll}><SearchX className="mr-2 h-4 w-4" />Limpar</Button>
          <Button onClick={apply}><Filter className="mr-2 h-4 w-4" />Aplicar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}
