"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    const next = new URLSearchParams();
    const tab = params.get("tab");
    if (tab) next.set("tab", tab);
    setForm({ parceiro_id: "", status: "", repasse_status: "", competencia_de: "", competencia_ate: "" });
    router.push(`${pathname}?${next.toString()}`);
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Parceiro
          </Label>
          <select
            value={form.parceiro_id}
            onChange={set("parceiro_id")}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none transition focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
          >
            <option value="">Todos</option>
            {parceiros.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </Label>
          <select
            value={form.status}
            onChange={set("status")}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none transition focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
          >
            <option value="">Todos</option>
            <option value="previsto">Previsto</option>
            <option value="disponivel">Disponível</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Repasse
          </Label>
          <select
            value={form.repasse_status}
            onChange={set("repasse_status")}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none transition focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Competência de
          </Label>
          <Input
            type="date"
            value={form.competencia_de}
            onChange={set("competencia_de")}
            className="h-9 rounded-lg text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Competência até
          </Label>
          <Input
            type="date"
            value={form.competencia_ate}
            onChange={set("competencia_ate")}
            className="h-9 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-xs">
          <SearchX className="h-3.5 w-3.5" />
          Limpar
        </Button>
        <Button size="sm" onClick={apply} className="gap-1.5 text-xs">
          <Filter className="h-3.5 w-3.5" />
          Aplicar
        </Button>
      </div>
    </div>
  );
}
