"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CircleDollarSign,
    FileSpreadsheet,
    ShieldAlert,
    Users2,
} from "lucide-react";

import type {
    CotaComissaoPayload,
    ParceiroSelectOption,
} from "@/app/app/lances/types";

import { ComissaoConfigSection } from "@/app/app/lances/components/comissao/ComissaoConfigSection";
import { SensitiveActionsSection } from "@/app/app/lances/components/comissao/SensitiveActionsSection";

import {
    cancelarComissaoCotaAction,
    deleteComissaoCotaAction,
    getComissaoCotaAction,
    getDeleteComissaoCheckAction,
    listParceirosForSelectAction,
    saveComissaoCotaAction,
} from "@/app/app/lances/actions/comissao-actions";

import {
    getContratoByCotaAction,
    deleteCartaAction,
} from "@/app/app/lances/actions/carta-actions";

import { gerarLancamentosContratoAction } from "@/app/app/comissoes/actions";
import { updateCartaDataAdesaoAction } from "../actions/update-carta-data-adesao";
import { MissingAdesaoDialog } from "../components/MissingAdesaoDialog";

type Props = {
    cotaId: string;
    dataAdesao?: string | null;
    grupoCodigo: string;
    numeroCota: string;
    produto: "imobiliario" | "auto";
    valorCarta?: number | null;
    onDirtyChange?: (dirty: boolean) => void;
    onSuccess?: () => void;
};

function getDefaultComissaoPayload(): CotaComissaoPayload {
    return {
        percentual_total: 0,
        base_calculo: "valor_carta",
        modo: "avista",
        imposto_padrao_pct: 10,
        primeira_competencia_regra: "mes_adesao",
        furo_meses_override: null,
        ativo: true,
        observacoes: "",
        regras: [
            {
                ordem: 1,
                tipo_evento: "adesao",
                offset_meses: 0,
                percentual_comissao: 0,
                descricao: "",
            },
        ],
        parceiros: [],
    };
}

function normalizeComissaoPayload(
    payload?: Partial<CotaComissaoPayload> | null
): CotaComissaoPayload {
    const base = getDefaultComissaoPayload();

    return {
        ...base,
        ...payload,
        regras: payload?.regras?.length ? payload.regras : base.regras,
        parceiros: payload?.parceiros ?? [],
    };
}

function isPayloadEqual(a: CotaComissaoPayload, b: CotaComissaoPayload) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return "Erro inesperado.";
}

export function CartaComissoesForm({
                                       cotaId,
                                       dataAdesao,
                                       grupoCodigo,
                                       numeroCota,
                                       produto,
                                       valorCarta,
                                       onDirtyChange,
                                       onSuccess,
                                   }: Props) {
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [deletingComissao, setDeletingComissao] = React.useState(false);
    const [cancelingComissao, setCancelingComissao] = React.useState(false);
    const [deletingCarta, setDeletingCarta] = React.useState(false);
    const [missingAdesaoOpen, setMissingAdesaoOpen] = React.useState(false);

    const [parceirosDisponiveis, setParceirosDisponiveis] = React.useState<
        ParceiroSelectOption[]
    >([]);
    const [payload, setPayload] = React.useState<CotaComissaoPayload>(
        getDefaultComissaoPayload()
    );
    const [initialPayload, setInitialPayload] = React.useState<CotaComissaoPayload>(
        getDefaultComissaoPayload()
    );

    const [currentDataAdesao, setCurrentDataAdesao] = React.useState<string | null>(
        dataAdesao ?? null
    );

    React.useEffect(() => {
        setCurrentDataAdesao(dataAdesao ?? null);
    }, [dataAdesao]);

    const dirty = !isPayloadEqual(payload, initialPayload);

    React.useEffect(() => {
        onDirtyChange?.(dirty);
    }, [dirty, onDirtyChange]);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);

                const [configResponse, parceiros] = await Promise.all([
                    getComissaoCotaAction(cotaId),
                    listParceirosForSelectAction(),
                ]);

                if (cancelled) return;

                const normalized = normalizeComissaoPayload({
                    ...configResponse.config,
                    regras: configResponse.regras,
                    parceiros: configResponse.parceiros,
                });

                setParceirosDisponiveis(parceiros);
                setPayload(normalized);
                setInitialPayload(normalized);
            } catch (error) {
                console.error(error);

                if (cancelled) return;

                const fallback = getDefaultComissaoPayload();
                setParceirosDisponiveis([]);
                setPayload(fallback);
                setInitialPayload(fallback);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [cotaId]);

    async function saveComissaoOnly() {
        await saveComissaoCotaAction(cotaId, payload);

        const normalized = normalizeComissaoPayload(payload);
        setPayload(normalized);
        setInitialPayload(normalized);

        onDirtyChange?.(false);
        onSuccess?.();
    }

    async function saveComissaoAndTryGenerate(nextDataAdesao?: string | null) {
        await saveComissaoCotaAction(cotaId, payload);

        const { contrato_id } = await getContratoByCotaAction(cotaId);

        if (contrato_id && nextDataAdesao) {
            await gerarLancamentosContratoAction(contrato_id);
            return { gerouLancamentos: true, temContrato: true };
        }

        return { gerouLancamentos: false, temContrato: !!contrato_id };
    }


    async function handleSave() {
        function totalRegras(payload: CotaComissaoPayload) {
            return payload.regras.reduce(
                (acc, item) => acc + Number(item.percentual_comissao || 0),
                0
            );
        }

        if (!currentDataAdesao) {
            setMissingAdesaoOpen(true);
            return;
        }

        try {
            setSaving(true);
            toast.dismiss();
            toast.loading("Salvando comissão...");

            const result = await saveComissaoAndTryGenerate(currentDataAdesao);

            const normalized = normalizeComissaoPayload(payload);
            setPayload(normalized);
            setInitialPayload(normalized);
            const total = totalRegras(payload);
            const saldo = Number((Number(payload.percentual_total || 0) - total).toFixed(4));

            toast.dismiss();


            if (Math.abs(saldo) >= 0.0001) {
                toast.dismiss();
                toast.error("A distribuição da comissão não fecha com o percentual total.");
                return;
            }

            if (result.gerouLancamentos) {
                toast.success("Comissão salva e lançamentos atualizados com sucesso.");
            } else if (result.temContrato) {
                toast.success(
                    "Comissão salva com sucesso, mas os lançamentos não foram projetados."
                );
            } else {
                toast.success(
                    "Comissão salva com sucesso. Ainda não existe contrato para gerar lançamentos."
                );
            }

            onDirtyChange?.(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.dismiss();

            const message = getErrorMessage(error);

            if (message.includes("valor_carta da cota precisa ser maior que zero")) {
                toast.error(
                    "A comissão foi salva, mas os lançamentos não puderam ser gerados porque a carta está sem valor da carta válido na aba Geral."
                );
                return;
            }

            if (message.includes("data_adesao")) {
                toast.error(
                    "A comissão foi salva, mas os lançamentos não puderam ser gerados porque a carta ainda não possui data de adesão."
                );
                return;
            }

            toast.error("Erro ao salvar comissão.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveWithoutProjection() {
        try {
            setSaving(true);
            toast.dismiss();
            toast.loading("Salvando comissão...");

            await saveComissaoOnly();

            toast.dismiss();
            toast.success(
                "Comissão salva com sucesso. Os lançamentos não foram gerados porque a carta ainda não possui data de adesão."
            );

            setMissingAdesaoOpen(false);
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Erro ao salvar comissão.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveWithAdesao(nextDataAdesao: string) {
        try {
            setSaving(true);
            toast.dismiss();
            toast.loading("Salvando data de adesão e comissão...");

            const adesaoResult = await updateCartaDataAdesaoAction({
                cotaId,
                dataAdesao: nextDataAdesao,
                grupoCodigo,
                numeroCota,
                produto,
            });

            if (!adesaoResult.ok) {
                toast.dismiss();
                toast.error(
                    adesaoResult.message || "Não foi possível salvar a data de adesão."
                );
                return;
            }

            setCurrentDataAdesao(nextDataAdesao);

            const result = await saveComissaoAndTryGenerate(nextDataAdesao);

            const normalized = normalizeComissaoPayload(payload);
            setPayload(normalized);
            setInitialPayload(normalized);

            toast.dismiss();

            if (result.gerouLancamentos) {
                toast.success("Data de adesão, comissão e lançamentos salvos com sucesso.");
            } else if (result.temContrato) {
                toast.success(
                    "A data de adesão e a comissão foram salvas, mas os lançamentos não puderam ser projetados."
                );
            } else {
                toast.success("Data de adesão e comissão salvas com sucesso.");
            }

            onDirtyChange?.(false);
            onSuccess?.();
            setMissingAdesaoOpen(false);
        } catch (error) {
            console.error(error);
            toast.dismiss();

            const message = getErrorMessage(error);

            if (message.includes("valor_carta da cota precisa ser maior que zero")) {
                toast.error(
                    "A data de adesão e a comissão foram salvas, mas os lançamentos não puderam ser gerados porque a carta está sem valor da carta válido na aba Geral."
                );
                return;
            }

            toast.error("Erro ao concluir salvamento.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteComissao() {
        try {
            setDeletingComissao(true);
            toast.dismiss();
            toast.loading("Validando exclusão da comissão...");

            const check = await getDeleteComissaoCheckAction(cotaId);

            toast.dismiss();

            if (!check.config_exists) {
                toast.info("Esta carta não possui comissão configurada.");
                return;
            }

            if (!check.pode_excluir) {
                toast.error(
                    check.motivo_bloqueio ||
                    "Não é possível excluir a comissão porque há lançamentos pagos ou repasses pagos."
                );
                return;
            }

            const confirmed = window.confirm(
                "Tem certeza que deseja excluir a comissão desta carta? Isso removerá configuração, parceiros e lançamentos ainda não protegidos por pagamento."
            );

            if (!confirmed) return;

            toast.loading("Excluindo comissão...");
            await deleteComissaoCotaAction(cotaId);

            const fallback = getDefaultComissaoPayload();
            setPayload(fallback);
            setInitialPayload(fallback);

            toast.dismiss();
            toast.success("Comissão excluída com sucesso.");

            onDirtyChange?.(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Erro ao excluir comissão.");
        } finally {
            setDeletingComissao(false);
        }
    }

    async function handleCancelComissao() {
        try {
            const confirmed = window.confirm(
                "Deseja cancelar a comissão desta carta? Os lançamentos não pagos serão marcados como cancelados."
            );

            if (!confirmed) return;

            setCancelingComissao(true);
            toast.dismiss();
            toast.loading("Cancelando comissão...");

            await cancelarComissaoCotaAction(cotaId);

            toast.dismiss();
            toast.success("Comissão cancelada com sucesso.");
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Erro ao cancelar comissão.");
        } finally {
            setCancelingComissao(false);
        }
    }

    async function handleDeleteCarta() {
        try {
            const confirmed = window.confirm(
                "Tem certeza que deseja excluir esta carta? Se houver comissão lançada, a exclusão poderá ser bloqueada."
            );

            if (!confirmed) return;

            setDeletingCarta(true);
            toast.dismiss();
            toast.loading("Excluindo carta...");

            await deleteCartaAction(cotaId);

            toast.dismiss();
            toast.success("Carta excluída com sucesso.");
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.dismiss();

            const message =
                error instanceof Error ? error.message : "Erro ao excluir carta.";

            if (message.includes("comissões lançadas")) {
                toast.error(
                    "Esta carta possui comissão lançada. Exclua ou cancele a comissão antes de excluir a carta."
                );
                return;
            }

            toast.error("Erro ao excluir carta.");
        } finally {
            setDeletingCarta(false);
        }
    }

    function handleReset() {
        setPayload(initialPayload);
        onDirtyChange?.(false);
    }

    const totalParceiros = payload.parceiros?.length ?? 0;
    const totalRegras = payload.regras?.length ?? 0;

    return (
        <>
            <div className="space-y-6">
                <Card className="border-white/10 bg-white/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="inline-flex items-center gap-2 text-base">
                            <CircleDollarSign className="h-4 w-4" />
                            Resumo da comissão
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={payload.ativo ? "default" : "outline"}>
                                {payload.ativo ? "Ativa" : "Inativa"}
                            </Badge>

                            <Badge variant="outline">
                                Total: {Number(payload.percentual_total || 0).toFixed(2)}%
                            </Badge>

                            <Badge variant="outline">
                                Base: {payload.base_calculo || "—"}
                            </Badge>

                            <Badge variant="outline">
                                Modo: {payload.modo || "—"}
                            </Badge>

                            <Badge variant="outline">
                                <Users2 className="mr-1 h-3.5 w-3.5" />
                                Parceiros: {totalParceiros}
                            </Badge>

                            <Badge variant="outline">
                                <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                                Regras: {totalRegras}
                            </Badge>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                            Esta aba concentra a configuração comercial e financeira da comissão da carta, separada da estratégia e da operação mensal.
                        </div>

                        {!currentDataAdesao && (
                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-muted-foreground">
                                Esta carta ainda não possui <strong>data de adesão</strong>. A comissão pode ser salva normalmente, mas a projeção de lançamentos só poderá ser gerada depois que a data de adesão for preenchida na aba <strong>Geral</strong>.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {loading ? (
                    <Card className="border-white/10 bg-white/5">
                        <CardContent className="p-6 text-sm text-muted-foreground">
                            Carregando configuração de comissão...
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <ComissaoConfigSection
                            value={payload}
                            onChange={setPayload}
                            parceirosDisponiveis={parceirosDisponiveis}
                            valorBase={valorCarta ?? 0}
                        />

                        <Card className="border-white/10 bg-white/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="inline-flex items-center gap-2 text-base">
                                    <ShieldAlert className="h-4 w-4" />
                                    Ações sensíveis
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <SensitiveActionsSection
                                    onCancelComissao={handleCancelComissao}
                                    onDeleteComissao={handleDeleteComissao}
                                    onDeleteCarta={handleDeleteCarta}
                                    cancelingComissao={cancelingComissao}
                                    deletingComissao={deletingComissao}
                                    deletingCarta={deletingCarta}
                                />
                            </CardContent>
                        </Card>
                    </>
                )}

                <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 pt-4 backdrop-blur">
                    <div className="text-xs text-muted-foreground">
                        Salve esta aba para atualizar comissão, parceiros, regras e lançamentos relacionados.
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleReset}
                            disabled={saving || !dirty}
                        >
                            Descartar
                        </Button>

                        <Button
                            type="button"
                            onClick={() => void handleSave()}
                            disabled={saving || loading || !dirty}
                        >
                            {saving ? "Salvando..." : "Salvar comissão"}
                        </Button>
                    </div>
                </div>
            </div>

            <MissingAdesaoDialog
                open={missingAdesaoOpen}
                onOpenChange={setMissingAdesaoOpen}
                loading={saving}
                onSaveWithoutProjection={handleSaveWithoutProjection}
                onSaveWithAdesao={handleSaveWithAdesao}
            />
        </>
    );
}