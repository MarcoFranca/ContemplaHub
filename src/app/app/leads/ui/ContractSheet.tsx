"use client";

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FilePlus2, Sparkles } from "lucide-react";

import { createContractFromLead } from "@/app/app/leads/actions";
import {
    ContractIdentitySection,
    ContractFinancialSection,
    ContractPermissionsSection,
    ContractLanceFixoSection,
    ContractDatesSection,
} from "@/app/app/leads/ui/contract-sheet/ContractSheetSections";

import type {
    AdminOption,
    LeadProposalListItem,
    LanceFixoOpcaoForm,
    ContractFormState,
} from "@/app/app/leads/ui/contract-sheet/types";
import { EMPTY_CONTRACT_FORM } from "@/app/app/leads/ui/contract-sheet/types";
import {
    makeOpcao,
    buildPrefillFromProposal,
    isApprovedStatus,
    extractMainScenario,
} from "@/app/app/leads/ui/contract-sheet/helpers";

export function ContractSheet({
                                  open,
                                  onOpenChange,
                                  leadId,
                                  leadName,
                                  administradoras,
                                  onSuccess,
                              }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    leadId: string;
    leadName: string;
    administradoras: AdminOption[];
    onSuccess?: () => void;
}) {
    const [loadingPrefill, setLoadingPrefill] = React.useState(false);
    const [form, setForm] = React.useState<ContractFormState>(EMPTY_CONTRACT_FORM);

    const [usaLanceFixo, setUsaLanceFixo] = React.useState(false);
    const [opcoesLanceFixo, setOpcoesLanceFixo] = React.useState<LanceFixoOpcaoForm[]>([]);

    React.useEffect(() => {
        if (!open) {
            setForm(EMPTY_CONTRACT_FORM);
            setUsaLanceFixo(false);
            setOpcoesLanceFixo([]);
            setLoadingPrefill(false);
            return;
        }

        if (!leadId) return;

        let cancelled = false;

        async function loadProposalPrefill() {
            setLoadingPrefill(true);

            try {
                const res = await fetch(`/api/lead-propostas/lead/${leadId}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error("Falha ao carregar propostas do lead.");
                }

                const proposals = (await res.json()) as LeadProposalListItem[];
                const sorted = [...(proposals ?? [])].sort((a, b) => {
                    const da = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const db = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return db - da;
                });

                const approved = sorted.find((item) => isApprovedStatus(item.status));
                const candidate = approved ?? sorted[0];

                let nextState = {
                    form: EMPTY_CONTRACT_FORM,
                    usaLanceFixo: false,
                    opcoesLanceFixo: [] as LanceFixoOpcaoForm[],
                };

                if (candidate?.id) {
                    const detailsRes = await fetch(
                        `/api/propostas-internal/${candidate.id}`,
                        { method: "GET", cache: "no-store" }
                    );

                    if (detailsRes.ok) {
                        const detail = await detailsRes.json();
                        const mainScenario = extractMainScenario(detail);

                        if (mainScenario) {
                            nextState = buildPrefillFromProposal(mainScenario, administradoras);
                        }
                    }
                }

                if (!cancelled) {
                    setForm(nextState.form);
                    setUsaLanceFixo(nextState.usaLanceFixo);
                    setOpcoesLanceFixo(nextState.opcoesLanceFixo);
                }
            } catch (error) {
                console.error("Erro ao pré-preencher contrato:", error);

                if (!cancelled) {
                    setForm(EMPTY_CONTRACT_FORM);
                    setUsaLanceFixo(false);
                    setOpcoesLanceFixo([]);
                }
            } finally {
                if (!cancelled) {
                    setLoadingPrefill(false);
                }
            }
        }

        void loadProposalPrefill();

        return () => {
            cancelled = true;
        };
    }, [open, leadId, administradoras]);

    function setField<K extends keyof ContractFormState>(field: K, value: ContractFormState[K]) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    const opcoesLanceFixoJson = React.useMemo(() => {
        if (!usaLanceFixo) return "[]";

        const normalizadas = opcoesLanceFixo
            .map((op) => ({
                percentual: op.percentual === "" ? null : Number(String(op.percentual).replace(",", ".")),
                ordem: Number(op.ordem),
                ativo: Boolean(op.ativo),
                observacoes: op.observacoes?.trim() || null,
            }))
            .filter((op) => op.percentual !== null);

        return JSON.stringify(normalizadas);
    }, [usaLanceFixo, opcoesLanceFixo]);

    function addOpcaoLanceFixo() {
        setOpcoesLanceFixo((prev) => [...prev, makeOpcao(prev.length + 1)]);
    }

    function removeOpcaoLanceFixo(id: string) {
        setOpcoesLanceFixo((prev) => {
            const next = prev.filter((op) => op.id !== id);
            return next.map((op, idx) => ({
                ...op,
                ordem: idx + 1,
            }));
        });
    }

    function updateOpcaoLanceFixo(
        id: string,
        patch: Partial<LanceFixoOpcaoForm>
    ) {
        setOpcoesLanceFixo((prev) =>
            prev.map((op) => (op.id === id ? { ...op, ...patch } : op))
        );
    }

    function validateLanceFixo() {
        if (!usaLanceFixo) return true;

        if (!opcoesLanceFixo.length) {
            toast.error("Adicione ao menos uma opção de lance fixo.");
            return false;
        }

        const percentuais = new Set<string>();
        const ordens = new Set<number>();

        for (const op of opcoesLanceFixo) {
            const percentual = Number(String(op.percentual).replace(",", "."));
            const ordem = Number(op.ordem);

            if (!op.percentual || Number.isNaN(percentual) || percentual <= 0 || percentual > 100) {
                toast.error("Revise os percentuais do lance fixo. Use valores entre 0 e 100.");
                return false;
            }

            if (Number.isNaN(ordem) || ordem < 1) {
                toast.error("Revise a ordem das opções de lance fixo.");
                return false;
            }

            const percentualKey = percentual.toFixed(4);

            if (percentuais.has(percentualKey)) {
                toast.error("Não repita percentual nas opções de lance fixo.");
                return false;
            }

            if (ordens.has(ordem)) {
                toast.error("Não repita a ordem das opções de lance fixo.");
                return false;
            }

            percentuais.add(percentualKey);
            ordens.add(ordem);
        }

        return true;
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full max-w-md border-l border-slate-800 bg-slate-950/95 backdrop-blur-xl text-slate-50 px-0 py-0 flex flex-col"
            >
                <SheetHeader className="px-5 py-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
                    <SheetTitle className="text-base font-semibold flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/25">
                            <FilePlus2 className="h-4 w-4 text-emerald-300" />
                        </span>
                        Nova carta
                    </SheetTitle>

                    <SheetDescription className="text-[11px] text-slate-400 leading-relaxed">
                        Cadastre uma nova cota e gere o contrato inicial para{" "}
                        <span className="font-medium text-slate-100">{leadName}</span>.
                        {loadingPrefill
                            ? " Buscando dados da proposta..."
                            : " Campos compatíveis serão preenchidos automaticamente quando houver proposta."}
                    </SheetDescription>
                </SheetHeader>

                <form
                    action={async (formData: FormData) => {
                        if (
                            !formData.get("administradoraId") ||
                            !formData.get("numeroCota") ||
                            !formData.get("grupoCodigo") ||
                            !formData.get("valorCarta") ||
                            !formData.get("produto")
                        ) {
                            toast.error("Preencha os campos obrigatórios.");
                            return;
                        }

                        if (!validateLanceFixo()) {
                            return;
                        }

                        try {
                            toast.dismiss();
                            toast.loading("Criando contrato...");

                            await createContractFromLead(formData);

                            toast.dismiss();
                            toast.success("Nova carta / contrato criado com sucesso.");
                            onOpenChange(false);
                            onSuccess?.();
                        } catch (err) {
                            console.error(err);
                            toast.dismiss();
                            toast.error("Erro ao criar contrato.");
                        }
                    }}
                    className="flex-1 flex flex-col min-h-0"
                >
                    <input type="hidden" name="leadId" value={leadId} />
                    <input type="hidden" name="opcoesLanceFixoJson" value={opcoesLanceFixoJson} />

                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                        <ContractIdentitySection
                            form={form}
                            setField={setField}
                            administradoras={administradoras}
                        />

                        <ContractFinancialSection
                            form={form}
                            setField={setField}
                        />

                        <ContractPermissionsSection
                            form={form}
                            setField={setField}
                        />

                        <ContractLanceFixoSection
                            usaLanceFixo={usaLanceFixo}
                            setUsaLanceFixo={setUsaLanceFixo}
                            opcoesLanceFixo={opcoesLanceFixo}
                            setOpcoesLanceFixo={setOpcoesLanceFixo}
                            updateOpcaoLanceFixo={updateOpcaoLanceFixo}
                            addOpcaoLanceFixo={addOpcaoLanceFixo}
                            removeOpcaoLanceFixo={removeOpcaoLanceFixo}
                            makeOpcao={makeOpcao}
                        />

                        <ContractDatesSection
                            form={form}
                            setField={setField}
                        />
                    </div>

                    <SheetFooter className="mt-auto border-t border-white/10 bg-slate-950/80 backdrop-blur-xl px-5 py-4 flex justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            size="sm"
                            className="text-xs bg-emerald-600 hover:bg-emerald-500"
                            disabled={loadingPrefill}
                        >
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            Gerar contrato
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}