"use client";

import * as React from "react";
import { Controller, type Control, useWatch } from "react-hook-form";
import {
  BadgePercent,
  CheckCircle2,
  HandCoins,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  WalletCards,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MoneyField } from "../../fields/money-field";
import type {
  ContratoFormValues,
  LanceFixoOptionFormValue,
} from "../../types/contrato-form.types";
import { PremiumFormSection } from "../section-base/premium-form-section";

interface Props {
  control: Control<ContratoFormValues>;
}

function parseNumberInput(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${String(value).replace(".", ",")}%`;
}

function formatMoney(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function ToggleCard({
  checked,
  onCheckedChange,
  title,
  description,
  icon,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <label
      className={[
        "group flex cursor-pointer items-start gap-3 rounded-[22px] border px-4 py-3.5 transition-all",
        checked
          ? "border-emerald-400/28 bg-emerald-500/[0.08] shadow-[0_0_0_1px_rgba(16,185,129,0.1)]"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
      ].join(" ")}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(Boolean(v))}
        className="mt-1 border-emerald-400/35 data-[state=checked]:border-emerald-400 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-slate-950"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span
            className={[
              "inline-flex h-8 w-8 items-center justify-center rounded-2xl border transition-colors",
              checked
                ? "border-emerald-400/20 bg-emerald-400/15 text-emerald-100"
                : "border-white/10 bg-white/[0.04] text-slate-200 group-hover:text-white",
            ].join(" ")}
          >
            {icon}
          </span>
          {title}
        </div>
        <p className="mt-1.5 text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </label>
  );
}

function CapabilityCard({
  title,
  value,
  helper,
  tone = "default",
}: {
  title: string;
  value: string;
  helper: string;
  tone?: "default" | "success";
}) {
  return (
    <div
      className={[
        "rounded-[20px] border px-4 py-3.5",
        tone === "success"
          ? "border-emerald-400/22 bg-emerald-500/[0.07]"
          : "border-white/10 bg-white/[0.03]",
      ].join(" ")}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs leading-5 text-slate-400">{helper}</div>
    </div>
  );
}

function LanceFixoCard({
  item,
  index,
  onUpdate,
  onRemove,
}: {
  item: LanceFixoOptionFormValue;
  index: number;
  onUpdate: (patch: Partial<LanceFixoOptionFormValue>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={[
        "rounded-[22px] border p-4 transition-all",
        item.ativo
          ? "border-emerald-400/18 bg-emerald-500/[0.05]"
          : "border-white/10 bg-slate-950/35",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-2xl border border-emerald-400/18 bg-emerald-400/12 px-2 text-xs font-semibold text-emerald-50">
              {item.ordem}ª
            </span>
            <div>
              <div className="text-sm font-semibold text-white">Modalidade de lance fixo</div>
              <div className="text-xs text-slate-400">
                Configure ordem comercial, percentual e status da opção.
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[110px_minmax(0,1fr)]">
            <div className="space-y-2">
              <Label className="text-slate-300">Ordem</Label>
              <Input
                type="number"
                min={1}
                value={item.ordem}
                onChange={(e) => onUpdate({ ordem: Number(e.target.value || index + 1) })}
                className="h-10 rounded-2xl border-white/10 bg-white/[0.04] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Percentual (%)</Label>
              <Input
                value={item.percentual == null ? "" : String(item.percentual).replace(".", ",")}
                onChange={(e) => onUpdate({ percentual: parseNumberInput(e.target.value) })}
                inputMode="decimal"
                placeholder="Ex.: 25,00"
                className="h-10 rounded-2xl border-white/10 bg-white/[0.04] text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 lg:w-[190px] lg:items-end">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-slate-200">
            <Checkbox
              checked={item.ativo}
              onCheckedChange={(v) => onUpdate({ ativo: Boolean(v) })}
              className="border-emerald-400/35 data-[state=checked]:border-emerald-400 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-slate-950"
            />
            Modalidade ativa
          </label>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left lg:text-right">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Leitura rápida</div>
            <div className="mt-1 text-sm font-medium text-white">
              {item.ativo ? formatPercent(item.percentual) : "Inativa"}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onRemove}
            className="justify-center text-slate-300 hover:bg-white/5 hover:text-white lg:justify-end"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CondicoesOperacionaisSection({ control }: Props) {
  const opcoes = React.useMemo<LanceFixoOptionFormValue[]>(() => [], []);
  const parcelaReduzida = useWatch({ control, name: "parcelaReduzida" });
  const percentualReducao = useWatch({ control, name: "percentualReducao" });
  const valorParcelaSemRedutor = useWatch({ control, name: "valorParcelaSemRedutor" });
  const embutidoPermitido = useWatch({ control, name: "embutidoPermitido" });
  const embutidoMaxPercent = useWatch({ control, name: "embutidoMaxPercent" });
  const fgtsPermitido = useWatch({ control, name: "fgtsPermitido" });
  const autorizacaoGestao = useWatch({ control, name: "autorizacaoGestao" });
  const opcoesLanceFixo = useWatch({ control, name: "opcoesLanceFixo" }) ?? [];

  const modalidadesAtivas = opcoesLanceFixo.filter((item) => item.ativo);

  return (
    <PremiumFormSection
      title="Modalidades, redutor e permissões"
      description="Organize as condições operacionais da carta de um jeito que fique fácil de entender agora e fácil de operar depois na esteira comercial."
      eyebrow="Condições avançadas"
      icon={<Sparkles className="h-3.5 w-3.5" />}
      contentClassName="space-y-5"
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Leitura executiva da carta</div>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Antes de preencher tudo, confira o pacote operacional que está sendo montado.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
              visão rápida
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <CapabilityCard
              title="Redutor"
              value={parcelaReduzida ? formatPercent(percentualReducao) : "Sem redutor"}
              helper={parcelaReduzida ? `Parcela sem redutor: ${formatMoney(valorParcelaSemRedutor)}` : "Sem regra temporária de redução até contemplar."}
              tone={parcelaReduzida ? "success" : "default"}
            />
            <CapabilityCard
              title="Embutido"
              value={embutidoPermitido ? formatPercent(embutidoMaxPercent) : "Não permitido"}
              helper={embutidoPermitido ? "A carta aceita composição com parte do próprio crédito." : "A oferta precisa ser coberta sem uso da própria carta."}
              tone={embutidoPermitido ? "success" : "default"}
            />
            <CapabilityCard
              title="FGTS"
              value={fgtsPermitido ? "Permitido" : "Não utiliza"}
              helper={fgtsPermitido ? "FGTS disponível como apoio operacional da estratégia." : "Estratégia sem apoio de FGTS nesta carta."}
              tone={fgtsPermitido ? "success" : "default"}
            />
            <CapabilityCard
              title="Lance fixo"
              value={modalidadesAtivas.length ? `${modalidadesAtivas.length} ativa(s)` : "Sem modalidades"}
              helper={modalidadesAtivas.length ? "As modalidades abaixo já ficam prontas para leitura comercial." : "Cadastre quando a administradora trabalhar com opções fixas."}
              tone={modalidadesAtivas.length ? "success" : "default"}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-emerald-400/14 bg-emerald-500/[0.05] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-50">
            <CheckCircle2 className="h-4 w-4" />
            O que não pode faltar aqui
          </div>
          <div className="mt-3 space-y-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2.5">
              Se houver redutor, registre o percentual e o valor sem redutor para evitar dúvidas no pós-venda.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2.5">
              Embutido e FGTS mudam a estratégia de lance, então precisam aparecer de forma explícita.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2.5">
              Lance fixo deve entrar separado por modalidade para dar previsibilidade na operação.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2.5">
              {autorizacaoGestao
                ? "Gestão autorizada já marcada para acompanhamento operacional da carta."
                : "Marque gestão autorizada quando a operação incluir acompanhamento ativo da equipe."}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Controller
          name="parcelaReduzida"
          control={control}
          render={({ field }) => (
            <ToggleCard
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              title="Possui redutor"
              description="Use quando a parcela é reduzida até a contemplação da carta."
              icon={<BadgePercent className="h-3.5 w-3.5" />}
            />
          )}
        />

        <Controller
          name="embutidoPermitido"
          control={control}
          render={({ field }) => (
            <ToggleCard
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              title="Permite embutido"
              description="Habilita lance com uso de parte do próprio crédito da carta."
              icon={<WalletCards className="h-3.5 w-3.5" />}
            />
          )}
        />

        <Controller
          name="fgtsPermitido"
          control={control}
          render={({ field }) => (
            <ToggleCard
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              title="Aceita FGTS"
              description="Indique quando a estratégia pode considerar FGTS na operação."
              icon={<HandCoins className="h-3.5 w-3.5" />}
            />
          )}
        />

        <Controller
          name="autorizacaoGestao"
          control={control}
          render={({ field }) => (
            <ToggleCard
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              title="Gestão autorizada"
              description="Sinaliza que a equipe pode acompanhar a carta de forma operacional."
              icon={<Shield className="h-3.5 w-3.5" />}
            />
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Controller
          name="percentualReducao"
          control={control}
          render={({ field, fieldState }) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <Label className="text-slate-200">Percentual do redutor (%)</Label>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Qual redução a carta aplica até contemplar.
              </p>
              <Input
                value={field.value == null ? "" : String(field.value).replace(".", ",")}
                onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                inputMode="decimal"
                placeholder="Ex.: 40,00"
                disabled={!parcelaReduzida}
                className="mt-3 h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 disabled:opacity-50"
              />
              {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
            </div>
          )}
        />

        <Controller
          name="valorParcelaSemRedutor"
          control={control}
          render={({ field, fieldState }) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <Label className="text-slate-200">Valor da parcela sem redutor</Label>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Mostra o valor cheio da parcela após o período reduzido.
              </p>
              <div className={["mt-3", !parcelaReduzida ? "pointer-events-none opacity-50" : ""].join(" ")}>
                <MoneyField value={field.value} onChange={field.onChange} />
              </div>
              {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
            </div>
          )}
        />

        <Controller
          name="embutidoMaxPercent"
          control={control}
          render={({ field, fieldState }) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <Label className="text-slate-200">Máximo de embutido (%)</Label>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Defina o teto operacional permitido para uso do embutido.
              </p>
              <Input
                value={field.value == null ? "" : String(field.value).replace(".", ",")}
                onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                inputMode="decimal"
                placeholder="Ex.: 30,00"
                disabled={!embutidoPermitido}
                className="mt-3 h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 disabled:opacity-50"
              />
              {fieldState.error ? <p className="mt-2 text-sm text-red-400">{fieldState.error.message}</p> : null}
            </div>
          )}
        />
      </div>

      <Controller
        name="opcoesLanceFixo"
        control={control}
        render={({ field, fieldState }) => {
          const value = field.value?.length ? field.value : opcoes;

          function setItems(next: LanceFixoOptionFormValue[]) {
            field.onChange(next);
          }

          function addItem() {
            const nextOrder = (value[value.length - 1]?.ordem ?? 0) + 1;
            setItems([
              ...value,
              {
                id: crypto.randomUUID(),
                ordem: nextOrder,
                percentual: null,
                ativo: true,
                observacoes: null,
              },
            ]);
          }

          function updateItem(index: number, patch: Partial<LanceFixoOptionFormValue>) {
            const next = [...value];
            next[index] = { ...next[index], ...patch };
            setItems(next);
          }

          function removeItem(index: number) {
            const next = value
              .filter((_, idx) => idx !== index)
              .map((item, idx) => ({ ...item, ordem: idx + 1 }));
            setItems(next);
          }

          return (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Modalidades de lance fixo</div>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
                    Cadastre cada opção como um item separado. Isso melhora a leitura do cadastro e deixa a carta pronta para uso comercial sem ajustes posteriores.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="border-emerald-400/20 text-emerald-100 hover:bg-emerald-400/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar modalidade
                </Button>
              </div>

              {!value.length ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-white/10 bg-slate-950/30 px-4 py-8 text-center">
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/18 bg-emerald-400/10 text-emerald-100">
                    <WalletCards className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-sm font-medium text-white">Nenhuma modalidade cadastrada</div>
                  <div className="mt-1 text-sm leading-6 text-slate-400">
                    Adicione as opções quando a carta trabalhar com lance fixo para deixar a operação mais previsível.
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {value.map((item, index) => (
                    <LanceFixoCard
                      key={item.id ?? `${item.ordem}-${index}`}
                      item={item}
                      index={index}
                      onUpdate={(patch) => updateItem(index, patch)}
                      onRemove={() => removeItem(index)}
                    />
                  ))}
                </div>
              )}

              {fieldState.error ? <p className="mt-3 text-sm text-red-400">{fieldState.error.message}</p> : null}

              <div className="mt-4 rounded-[22px] border border-emerald-400/12 bg-emerald-400/[0.05] px-4 py-3 text-xs leading-5 text-slate-300">
                <div className="flex items-center gap-2 font-medium text-emerald-100">
                  <CheckCircle2 className="h-4 w-4" />
                  Organização do cadastro
                </div>
                <p className="mt-1">
                  Com esses campos, o corretor termina o cadastro com a carta pronta para comissão, lances e acompanhamento operacional, sem depender de acertos espalhados depois.
                </p>
              </div>
            </div>
          );
        }}
      />
    </PremiumFormSection>
  );
}
