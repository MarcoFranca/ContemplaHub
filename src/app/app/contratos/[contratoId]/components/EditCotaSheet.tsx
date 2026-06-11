"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { updateCotaDadosAction, updateContratoDadosAction } from "../actions";

type CotaDados = {
    id: string;
    grupo_codigo: string | null;
    numero_cota: string | null;
    produto: string | null;
    valor_carta: number | string | null;
    valor_parcela: number | string | null;
    prazo: number | null;
    assembleia_dia: number | null;
    data_adesao: string | null;
    fgts_permitido: boolean | null;
    embutido_permitido: boolean | null;
    embutido_max_percent: number | string | null;
    autorizacao_gestao: boolean | null;
    parcela_reduzida: boolean | null;
    percentual_reducao: number | string | null;
    valor_parcela_sem_redutor: number | string | null;
    taxa_admin_percentual: number | string | null;
    taxa_admin_valor_mensal: number | string | null;
    observacoes: string | null;
    fundo_reserva_percentual: number | string | null;
    fundo_reserva_valor_mensal: number | string | null;
    seguro_prestamista_ativo: boolean | null;
    seguro_prestamista_percentual: number | string | null;
    seguro_prestamista_valor_mensal: number | string | null;
    taxa_admin_antecipada_ativo: boolean | null;
    taxa_admin_antecipada_percentual: number | string | null;
    taxa_admin_antecipada_forma_pagamento: string | null;
    taxa_admin_antecipada_parcelas: number | null;
    taxa_admin_antecipada_valor_total: number | string | null;
    taxa_admin_antecipada_valor_parcela: number | string | null;
};

type ContratoDados = {
    id: string;
    numero: string | null;
    data_assinatura: string | null;
};

function toInputValue(value?: number | string | null) {
    if (value === null || value === undefined) return "";
    return String(value);
}

function toDateInputValue(value?: string | null) {
    if (!value) return "";
    return value.slice(0, 10);
}

export function EditCotaSheet({ cota, contrato }: { cota: CotaDados; contrato: ContratoDados }) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [embutidoPermitido, setEmbutidoPermitido] = React.useState(
        Boolean(cota.embutido_permitido)
    );
    const [seguroAtivo, setSeguroAtivo] = React.useState(
        Boolean(cota.seguro_prestamista_ativo)
    );
    const [taxaAntecipadaAtivo, setTaxaAntecipadaAtivo] = React.useState(
        Boolean(cota.taxa_admin_antecipada_ativo)
    );
    const [parcelaReduzida, setParcelaReduzida] = React.useState(
        Boolean(cota.parcela_reduzida)
    );

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar dados da cota
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                size="lg"
                className="border-l border-white/10 bg-slate-950/70 px-0 shadow-2xl backdrop-blur-xl"
            >
                <SheetHeader className="border-b border-white/10 px-6 pb-3 pt-6">
                    <SheetTitle className="flex items-center gap-2 text-base">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
                            <Pencil className="h-3.5 w-3.5 text-emerald-300" />
                        </span>
                        Editar dados da cota
                    </SheetTitle>
                </SheetHeader>

                <form
                    action={async (formData: FormData) => {
                        const toastId = toast.loading("Salvando alterações...");
                        try {
                            await Promise.all([
                                updateCotaDadosAction(formData),
                                updateContratoDadosAction(formData),
                            ]);
                            toast.success("Cota atualizada com sucesso!", { id: toastId });
                            setOpen(false);
                            router.refresh();
                        } catch (err) {
                            toast.error(
                                err instanceof Error ? err.message : "Erro ao atualizar a cota.",
                                { id: toastId }
                            );
                        }
                    }}
                    className="relative flex h-[calc(100dvh-56px)] flex-col overflow-hidden"
                >
                    <input type="hidden" name="cotaId" value={cota.id} />
                    <input type="hidden" name="contratoId" value={contrato.id} />

                    <div className="flex-1 space-y-6 overflow-auto px-6 py-5">
                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Identificação
                            </legend>

                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="grupo_codigo" className="text-xs">
                                        Grupo
                                    </Label>
                                    <Input
                                        id="grupo_codigo"
                                        name="grupo_codigo"
                                        defaultValue={toInputValue(cota.grupo_codigo)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="numero_cota" className="text-xs">
                                        Número da cota
                                    </Label>
                                    <Input
                                        id="numero_cota"
                                        name="numero_cota"
                                        defaultValue={toInputValue(cota.numero_cota)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="produto" className="text-xs">
                                        Produto
                                    </Label>
                                    <select
                                        id="produto"
                                        name="produto"
                                        defaultValue={cota.produto ?? ""}
                                        className="h-9 w-full rounded-md border border-white/10 bg-black/20 px-2.5 text-sm text-foreground outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
                                    >
                                        <option value="">Selecione</option>
                                        <option value="imobiliario">Imobiliário</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Contrato
                            </legend>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="numero" className="text-xs">
                                        Número do contrato
                                    </Label>
                                    <Input
                                        id="numero"
                                        name="numero"
                                        defaultValue={toInputValue(contrato.numero)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="data_assinatura" className="text-xs">
                                        Data de assinatura
                                    </Label>
                                    <Input
                                        id="data_assinatura"
                                        name="data_assinatura"
                                        type="date"
                                        defaultValue={toDateInputValue(contrato.data_assinatura)}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Valores e prazo
                            </legend>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="valor_carta" className="text-xs">
                                        Valor da carta
                                    </Label>
                                    <Input
                                        id="valor_carta"
                                        name="valor_carta"
                                        type="number"
                                        step="0.01"
                                        defaultValue={toInputValue(cota.valor_carta)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="valor_parcela" className="text-xs">
                                        Valor da parcela
                                    </Label>
                                    <Input
                                        id="valor_parcela"
                                        name="valor_parcela"
                                        type="number"
                                        step="0.01"
                                        defaultValue={toInputValue(cota.valor_parcela)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="prazo" className="text-xs">
                                        Prazo (meses)
                                    </Label>
                                    <Input
                                        id="prazo"
                                        name="prazo"
                                        type="number"
                                        min={1}
                                        defaultValue={toInputValue(cota.prazo)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="assembleia_dia" className="text-xs">
                                        Dia da assembleia
                                    </Label>
                                    <Input
                                        id="assembleia_dia"
                                        name="assembleia_dia"
                                        type="number"
                                        min={1}
                                        max={31}
                                        defaultValue={toInputValue(cota.assembleia_dia)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="data_adesao" className="text-xs">
                                        Data de adesão
                                    </Label>
                                    <Input
                                        id="data_adesao"
                                        name="data_adesao"
                                        type="date"
                                        defaultValue={toDateInputValue(cota.data_adesao)}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Taxa administrativa e redutor
                            </legend>

                            <div className="mt-3 space-y-3">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="taxa_admin_percentual" className="text-xs">
                                            Taxa adm. total (%)
                                        </Label>
                                        <Input
                                            id="taxa_admin_percentual"
                                            name="taxa_admin_percentual"
                                            type="number"
                                            step="0.0001"
                                            defaultValue={toInputValue(cota.taxa_admin_percentual)}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="taxa_admin_valor_mensal" className="text-xs">
                                            Distribuição mensal da taxa adm. (R$)
                                        </Label>
                                        <Input
                                            id="taxa_admin_valor_mensal"
                                            name="taxa_admin_valor_mensal"
                                            type="number"
                                            step="0.01"
                                            defaultValue={toInputValue(cota.taxa_admin_valor_mensal)}
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="parcela_reduzida"
                                        checked={parcelaReduzida}
                                        onChange={(e) => setParcelaReduzida(e.target.checked)}
                                        className="h-4 w-4 rounded border-white/20 bg-black/20"
                                    />
                                    Possui parcela com redutor
                                </label>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {parcelaReduzida ? (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="percentual_reducao" className="text-xs">
                                                Percentual do redutor (%)
                                            </Label>
                                            <Input
                                                id="percentual_reducao"
                                                name="percentual_reducao"
                                                type="number"
                                                step="0.0001"
                                                defaultValue={toInputValue(cota.percentual_reducao)}
                                            />
                                        </div>
                                    ) : null}

                                    <div className="space-y-1.5">
                                        <Label htmlFor="valor_parcela_sem_redutor" className="text-xs">
                                            Parcela cheia sem redutor (R$)
                                        </Label>
                                        <Input
                                            id="valor_parcela_sem_redutor"
                                            name="valor_parcela_sem_redutor"
                                            type="number"
                                            step="0.01"
                                            defaultValue={toInputValue(cota.valor_parcela_sem_redutor)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Modalidades
                            </legend>

                            <div className="mt-3 space-y-3">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="autorizacao_gestao"
                                        defaultChecked={Boolean(cota.autorizacao_gestao)}
                                        className="h-4 w-4 rounded border-white/20 bg-black/20"
                                    />
                                    Autorização de gestão da cota
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="fgts_permitido"
                                        defaultChecked={Boolean(cota.fgts_permitido)}
                                        className="h-4 w-4 rounded border-white/20 bg-black/20"
                                    />
                                    Permite uso de FGTS
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="embutido_permitido"
                                        checked={embutidoPermitido}
                                        onChange={(e) => setEmbutidoPermitido(e.target.checked)}
                                        className="h-4 w-4 rounded border-white/20 bg-black/20"
                                    />
                                    Permite lance embutido
                                </label>

                                {embutidoPermitido ? (
                                    <div className="space-y-1.5 md:max-w-xs">
                                        <Label htmlFor="embutido_max_percent" className="text-xs">
                                            Percentual máximo embutido (%)
                                        </Label>
                                        <Input
                                            id="embutido_max_percent"
                                            name="embutido_max_percent"
                                            type="number"
                                            step="0.0001"
                                            defaultValue={toInputValue(cota.embutido_max_percent)}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Fundo de reserva
                            </legend>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="fundo_reserva_percentual" className="text-xs">
                                        Percentual (%)
                                    </Label>
                                    <Input
                                        id="fundo_reserva_percentual"
                                        name="fundo_reserva_percentual"
                                        type="number"
                                        step="0.0001"
                                        defaultValue={toInputValue(cota.fundo_reserva_percentual)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="fundo_reserva_valor_mensal" className="text-xs">
                                        Distribuição mensal (R$)
                                    </Label>
                                    <Input
                                        id="fundo_reserva_valor_mensal"
                                        name="fundo_reserva_valor_mensal"
                                        type="number"
                                        step="0.01"
                                        defaultValue={toInputValue(cota.fundo_reserva_valor_mensal)}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Seguro prestamista
                            </legend>

                            <div className="mt-3 space-y-3">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="seguro_prestamista_ativo"
                                        checked={seguroAtivo}
                                        onChange={(e) => setSeguroAtivo(e.target.checked)}
                                        className="h-4 w-4 rounded border-white/20 bg-black/20"
                                    />
                                    Possui seguro prestamista
                                </label>

                                {seguroAtivo ? (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="seguro_prestamista_percentual" className="text-xs">
                                                Percentual (%)
                                            </Label>
                                            <Input
                                                id="seguro_prestamista_percentual"
                                                name="seguro_prestamista_percentual"
                                                type="number"
                                                step="0.0001"
                                                defaultValue={toInputValue(cota.seguro_prestamista_percentual)}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="seguro_prestamista_valor_mensal" className="text-xs">
                                                Valor mensal (R$)
                                            </Label>
                                            <Input
                                                id="seguro_prestamista_valor_mensal"
                                                name="seguro_prestamista_valor_mensal"
                                                type="number"
                                                step="0.01"
                                                defaultValue={toInputValue(cota.seguro_prestamista_valor_mensal)}
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Taxa adm. antecipada
                            </legend>

                            <div className="mt-3 space-y-3">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="taxa_admin_antecipada_ativo"
                                        checked={taxaAntecipadaAtivo}
                                        onChange={(e) => setTaxaAntecipadaAtivo(e.target.checked)}
                                        className="h-4 w-4 rounded border-white/20 bg-black/20"
                                    />
                                    Possui taxa adm. antecipada
                                </label>

                                {taxaAntecipadaAtivo ? (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="taxa_admin_antecipada_percentual" className="text-xs">
                                                Percentual (%)
                                            </Label>
                                            <Input
                                                id="taxa_admin_antecipada_percentual"
                                                name="taxa_admin_antecipada_percentual"
                                                type="number"
                                                step="0.0001"
                                                defaultValue={toInputValue(cota.taxa_admin_antecipada_percentual)}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="taxa_admin_antecipada_forma_pagamento" className="text-xs">
                                                Forma de pagamento
                                            </Label>
                                            <select
                                                id="taxa_admin_antecipada_forma_pagamento"
                                                name="taxa_admin_antecipada_forma_pagamento"
                                                defaultValue={cota.taxa_admin_antecipada_forma_pagamento ?? ""}
                                                className="h-9 w-full rounded-md border border-white/10 bg-black/20 px-2.5 text-sm text-foreground outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="avista">À vista</option>
                                                <option value="parcelado">Parcelado</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="taxa_admin_antecipada_parcelas" className="text-xs">
                                                Quantidade de parcelas
                                            </Label>
                                            <Input
                                                id="taxa_admin_antecipada_parcelas"
                                                name="taxa_admin_antecipada_parcelas"
                                                type="number"
                                                min={1}
                                                defaultValue={toInputValue(cota.taxa_admin_antecipada_parcelas)}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="taxa_admin_antecipada_valor_total" className="text-xs">
                                                Valor total (R$)
                                            </Label>
                                            <Input
                                                id="taxa_admin_antecipada_valor_total"
                                                name="taxa_admin_antecipada_valor_total"
                                                type="number"
                                                step="0.01"
                                                defaultValue={toInputValue(cota.taxa_admin_antecipada_valor_total)}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="taxa_admin_antecipada_valor_parcela" className="text-xs">
                                                Valor da parcela (R$)
                                            </Label>
                                            <Input
                                                id="taxa_admin_antecipada_valor_parcela"
                                                name="taxa_admin_antecipada_valor_parcela"
                                                type="number"
                                                step="0.01"
                                                defaultValue={toInputValue(cota.taxa_admin_antecipada_valor_parcela)}
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Observações
                            </legend>

                            <div className="mt-3 space-y-1.5">
                                <Label htmlFor="observacoes" className="text-xs">
                                    Observações da cota
                                </Label>
                                <Textarea
                                    id="observacoes"
                                    name="observacoes"
                                    rows={3}
                                    defaultValue={toInputValue(cota.observacoes)}
                                />
                            </div>
                        </fieldset>
                    </div>

                    <SheetFooter className="sticky bottom-0 w-full border-t border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
                        <div className="flex w-full items-center justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
                                Salvar alterações
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
