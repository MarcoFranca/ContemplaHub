"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

import {
    createContractFromLead,
    type CreateContractFromLeadResult,
} from "@/app/app/leads/actions";

import {
    ContractIdentitySection,
    ContractFinancialSection,
    ContractPermissionsSection,
    ContractLanceFixoSection,
    ContractDatesSection,
} from "@/app/app/leads/ui/contract-sheet/ContractSheetSections";

import type {
    AdminOption,
    LanceFixoOpcaoForm,
    ContractFormState,
} from "@/app/app/leads/ui/contract-sheet/types";

import { EMPTY_CONTRACT_FORM } from "@/app/app/leads/ui/contract-sheet/types";
import { makeOpcao } from "@/app/app/leads/ui/contract-sheet/helpers";

type Props = {
    leadId: string;
    leadName: string;
    administradoras?: AdminOption[];
    onCreated: (payload: {
        contractId: string;
        cotaId: string;
    }) => void;
};

export function CartaContratoTab({
                                     leadId,
                                     leadName,
                                     administradoras,
                                     onCreated,
                                 }: Props) {
    const administradorasSafe = administradoras ?? [];

    const [form, setForm] = React.useState<ContractFormState>(EMPTY_CONTRACT_FORM);
    const [usaLanceFixo, setUsaLanceFixo] = React.useState(false);
    const [opcoesLanceFixo, setOpcoesLanceFixo] = React.useState<LanceFixoOpcaoForm[]>([]);

    function setField<K extends keyof ContractFormState>(
        field: K,
        value: ContractFormState[K]
    ) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    const opcoesLanceFixoJson = React.useMemo(() => {
        if (!usaLanceFixo) return "[]";

        const normalizadas = opcoesLanceFixo
            .map((op) => ({
                percentual:
                    op.percentual === ""
                        ? null
                        : Number(String(op.percentual).replace(",", ".")),
                ordem: Number(op.ordem),
                ativo: Boolean(op.ativo),
                observacoes: op.observacoes?.trim() || null,
            }))
            .filter((op) => op.percentual !== null);

        return JSON.stringify(normalizadas);
    }, [usaLanceFixo, opcoesLanceFixo]);

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

    function validateBase() {
        if (!administradorasSafe.length) {
            toast.error("Nenhuma administradora disponível para este fluxo.");
            return false;
        }

        if (!form.administradoraId) {
            toast.error("Selecione a administradora.");
            return false;
        }

        if (!form.numeroCota || !form.grupoCodigo || !form.valorCarta || !form.produto) {
            toast.error("Preencha os campos obrigatórios.");
            return false;
        }

        return true;
    }

    async function handleSubmit() {
        if (!validateBase()) return;
        if (!validateLanceFixo()) return;

        try {
            toast.dismiss();
            toast.loading("Criando contrato...");

            const formData = new FormData();

            formData.set("leadId", leadId);
            formData.set("administradoraId", form.administradoraId || "");
            formData.set("numeroCota", form.numeroCota || "");
            formData.set("grupoCodigo", form.grupoCodigo || "");
            formData.set("produto", form.produto || "imobiliario");
            formData.set("valorCarta", form.valorCarta || "");
            formData.set("valorParcela", form.valorParcela || "");
            formData.set("prazo", String(form.prazo ?? ""));
            formData.set("dataAdesao", form.dataAdesao || "");
            formData.set("dataAssinatura", form.dataAssinatura || "");
            formData.set("numero", form.numero || "");
            formData.set("formaPagamento", form.formaPagamento || "");
            formData.set("indiceCorrecao", form.indiceCorrecao || "");

            if (form.parcelaReduzida) formData.set("parcelaReduzida", "on");
            if (form.fgtsPermitido) formData.set("fgtsPermitido", "on");
            if (form.embutidoPermitido) formData.set("embutidoPermitido", "on");
            if (form.autorizacaoGestao) formData.set("autorizacaoGestao", "on");

            formData.set("opcoesLanceFixoJson", opcoesLanceFixoJson);

            const result: CreateContractFromLeadResult =
                await createContractFromLead(formData);

            if (!result.contrato_id || !result.cota_id) {
                throw new Error("Contrato criado sem IDs válidos.");
            }

            toast.dismiss();
            toast.success("Contrato criado com sucesso.");

            onCreated({
                contractId: result.contrato_id,
                cotaId: result.cota_id,
            });
        } catch (err) {
            console.error(err);
            toast.dismiss();
            toast.error(
                err instanceof Error ? err.message : "Erro ao criar contrato."
            );
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                Formalize a nova carta para <span className="font-medium text-foreground">{leadName}</span>.
                Após a criação do contrato, as demais abas da carta serão liberadas.
            </div>

            <ContractIdentitySection
                form={form}
                setField={setField}
                administradoras={administradorasSafe}
            />

            <ContractFinancialSection form={form} setField={setField} />

            <ContractPermissionsSection form={form} setField={setField} />

            <ContractLanceFixoSection
                usaLanceFixo={usaLanceFixo}
                setUsaLanceFixo={setUsaLanceFixo}
                opcoesLanceFixo={opcoesLanceFixo}
                setOpcoesLanceFixo={setOpcoesLanceFixo}
                updateOpcaoLanceFixo={(id, patch) =>
                    setOpcoesLanceFixo((prev) =>
                        prev.map((op) => (op.id === id ? { ...op, ...patch } : op))
                    )
                }
                addOpcaoLanceFixo={() =>
                    setOpcoesLanceFixo((prev) => [...prev, makeOpcao(prev.length + 1)])
                }
                removeOpcaoLanceFixo={(id) =>
                    setOpcoesLanceFixo((prev) =>
                        prev
                            .filter((op) => op.id !== id)
                            .map((op, idx) => ({ ...op, ordem: idx + 1 }))
                    )
                }
                makeOpcao={makeOpcao}
            />

            <ContractDatesSection form={form} setField={setField} />

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="text-xs text-muted-foreground">
                    Cliente: {leadName}
                </div>

                <Button onClick={handleSubmit}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Criar contrato e continuar
                </Button>
            </div>
        </div>
    );
}