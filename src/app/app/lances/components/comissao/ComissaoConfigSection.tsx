"use client";

import { BadgePercent, Handshake, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  CotaComissaoParceiro,
  CotaComissaoPayload,
  ComissaoEvento,
  ComissaoRegra,
  ParceiroSelectOption,
} from "../../types";
import { ComissaoRegraRow } from "./ComissaoRegraRow";
import { ComissaoParceiroRow } from "./ComissaoParceiroRow";

function totalRegras(regras: ComissaoRegra[]) {
  return regras.reduce((acc, item) => acc + Number(item.percentual_comissao || 0), 0);
}

function totalParceiros(parceiros: CotaComissaoParceiro[]) {
  return parceiros.reduce((acc, item) => acc + Number(item.percentual_parceiro || 0), 0);
}

type Props = {
  value: CotaComissaoPayload;
  onChange: (next: CotaComissaoPayload) => void;
  parceirosDisponiveis: ParceiroSelectOption[];
};

export function ComissaoConfigSection({ value, onChange, parceirosDisponiveis }: Props) {
  const regraTotal = totalRegras(value.regras);
  const parceiroTotal = totalParceiros(value.parceiros);

  const setField = <K extends keyof CotaComissaoPayload>(field: K, fieldValue: CotaComissaoPayload[K]) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const addRegra = () => {
    const next: ComissaoRegra = {
      ordem: value.regras.length + 1,
      tipo_evento: value.modo === "avista" ? "adesao" : "proxima_cobranca",
      offset_meses: 0,
      percentual_comissao: 0,
      descricao: "",
    };
    setField("regras", [...value.regras, next]);
  };

  const addParceiro = () => {
    const next: CotaComissaoParceiro = {
      parceiro_id: "",
      percentual_parceiro: 0,
      imposto_retido_pct: 10,
      ativo: true,
      observacoes: "",
    };
    setField("parceiros", [...value.parceiros, next]);
  };

  return (
    <section className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-medium inline-flex items-center gap-2"><BadgePercent className="h-4 w-4 text-emerald-400" />Comissionamento</h3>
          <p className="text-xs text-muted-foreground">Cadastre a regra da carta, o cronograma das parcelas e a divisão com parceiros.</p>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>Total regras: <strong>{regraTotal.toFixed(4)}%</strong></span>
          <span>Total parceiros: <strong>{parceiroTotal.toFixed(4)}%</strong></span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Comissão total %</label>
          <Input type="number" step="0.0001" min={0} value={value.percentual_total} onChange={(e) => setField("percentual_total", Number(e.target.value || 0))} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Modo</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={value.modo} onChange={(e) => setField("modo", e.target.value as CotaComissaoPayload["modo"])}>
            <option value="avista">À vista</option>
            <option value="parcelado">Parcelado</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Imposto padrão %</label>
          <Input type="number" step="0.01" min={0} value={value.imposto_padrao_pct} onChange={(e) => setField("imposto_padrao_pct", Number(e.target.value || 0))} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Primeira competência</label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={value.primeira_competencia_regra} onChange={(e) => setField("primeira_competencia_regra", e.target.value as CotaComissaoPayload["primeira_competencia_regra"])}>
            <option value="mes_adesao">Mês da adesão</option>
            <option value="primeira_cobranca_valida">Primeira cobrança válida</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Furo meses override</label>
          <Input type="number" min={0} value={value.furo_meses_override ?? ""} onChange={(e) => setField("furo_meses_override", e.target.value === "" ? null : Number(e.target.value || 0))} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Base de cálculo</label>
          <Input value={value.base_calculo} onChange={(e) => setField("base_calculo", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Observações</label>
        <Textarea className="min-h-24" value={value.observacoes ?? ""} onChange={(e) => setField("observacoes", e.target.value)} placeholder="Regras comerciais da operadora, campanha, adiantamento de taxa, contemplação etc." />
      </div>

      <div className="space-y-3 rounded-xl border p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-medium">Regras da comissão</h4>
            <p className="text-xs text-muted-foreground">A soma das regras precisa fechar com a comissão total.</p>
          </div>
          <Button type="button" variant="outline" onClick={addRegra}><Plus className="mr-2 h-4 w-4" />Adicionar regra</Button>
        </div>
        <div className="space-y-3">
          {value.regras.map((regra, index) => (
            <ComissaoRegraRow
              key={`${regra.ordem}-${index}`}
              regra={regra}
              onChange={(patch) => {
                const next = [...value.regras];
                next[index] = { ...next[index], ...patch } as ComissaoRegra;
                setField("regras", next);
              }}
              onRemove={() => {
                const next = value.regras.filter((_, i) => i !== index).map((item, i) => ({ ...item, ordem: i + 1 }));
                setField("regras", next);
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-xl border p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-medium inline-flex items-center gap-2"><Handshake className="h-4 w-4 text-emerald-400" />Parceiros vinculados</h4>
            <p className="text-xs text-muted-foreground">O rateio do parceiro será calculado proporcionalmente ao cronograma da carta.</p>
          </div>
          <Button type="button" variant="outline" onClick={addParceiro}><Plus className="mr-2 h-4 w-4" />Adicionar parceiro</Button>
        </div>
        <div className="space-y-3">
          {value.parceiros.map((item, index) => (
            <ComissaoParceiroRow
              key={`${item.parceiro_id || "novo"}-${index}`}
              item={item}
              parceiros={parceirosDisponiveis}
              onChange={(patch) => {
                const next = [...value.parceiros];
                next[index] = { ...next[index], ...patch } as CotaComissaoParceiro;
                setField("parceiros", next);
              }}
              onRemove={() => setField("parceiros", value.parceiros.filter((_, i) => i !== index))}
            />
          ))}
          {!value.parceiros.length ? <p className="text-sm text-muted-foreground">Nenhum parceiro vinculado a esta carta.</p> : null}
        </div>
      </div>
    </section>
  );
}
