"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { CircleAlert, CircleCheckBig, FileText, Landmark, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { createPagamentoAction, updatePagamentoAction } from "../actions";
import type { FinanceiroContratoOption, PagamentoActionState, PagamentoItem } from "../types";
import { PagamentosTable } from "./PagamentosTable";

type PagamentoFormProps = {
    contratos: FinanceiroContratoOption[];
    selectedContratoId: string;
    pagamento?: PagamentoItem | null;
    action: "create" | "edit";
    contratoSelecionado?: FinanceiroContratoOption | null;
    pagamentosIniciais: PagamentoItem[];
};

const initialState: PagamentoActionState = { ok: false };

function toDateInput(value?: string | null) {
    if (!value) return "";
    return value.slice(0, 10);
}

function toDateTimeLocal(value?: string | null) {
    if (!value) return "";
    return value.slice(0, 16);
}

function formatMoney(value?: string | number | null) {
    if (value == null || value === "") return "-";
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number(value));
}

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
        >
            {label}
        </button>
    );
}

function ProcessingFeedbackCard({
    state,
}: {
    state: PagamentoActionState;
}) {
    if (!state.ok || !state.processing) return null;

    const processing = state.processing;
    const variant = processing.comissaoCancelada
        ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
        : processing.comissaoBloqueada
          ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";

    const heading = processing.comissaoCancelada
        ? "Comissao cancelada"
        : processing.comissaoBloqueada
          ? "Comissao bloqueada"
          : processing.comissaoGerada
            ? "Comissao gerada"
            : "Competencia processada";

    return (
        <div className={`grid gap-3 rounded-2xl border p-4 ${variant}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="grid gap-1">
                    <p className="text-sm font-semibold">{heading}</p>
                    <p className="text-sm/6 text-current/80">{state.message}</p>
                </div>
                <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0" />
            </div>

            <div className="grid gap-2 text-xs uppercase tracking-[0.18em] text-current/70 md:grid-cols-4">
                <div className="rounded-xl border border-current/15 bg-black/10 px-3 py-2">
                    <span className="block text-[10px]">Pagamento</span>
                    <strong className="text-sm normal-case tracking-normal text-current">
                        {processing.pagamentoId?.slice(0, 8) || "-"}
                    </strong>
                </div>
                <div className="rounded-xl border border-current/15 bg-black/10 px-3 py-2">
                    <span className="block text-[10px]">Competencia</span>
                    <strong className="text-sm normal-case tracking-normal text-current">
                        {processing.competenciaStatus || "-"}
                    </strong>
                </div>
                <div className="rounded-xl border border-current/15 bg-black/10 px-3 py-2">
                    <span className="block text-[10px]">Lancamento</span>
                    <strong className="text-sm normal-case tracking-normal text-current">
                        {processing.lancamentoStatus || "sem lancamento"}
                    </strong>
                </div>
                <div className="rounded-xl border border-current/15 bg-black/10 px-3 py-2">
                    <span className="block text-[10px]">Comissao</span>
                    <strong className="text-sm normal-case tracking-normal text-current">
                        {processing.comissaoGerada ? "processada" : "nao gerada"}
                    </strong>
                </div>
            </div>

            {processing.contratoId ? (
                <div>
                    <Link
                        href={`/app/contratos/${processing.contratoId}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-current underline-offset-4 hover:underline"
                    >
                        Ver comissao gerada
                    </Link>
                </div>
            ) : null}
        </div>
    );
}

function ContractContextCard({ contrato }: { contrato?: FinanceiroContratoOption | null }) {
    if (!contrato) return null;

    return (
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="grid gap-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <Wallet className="h-3.5 w-3.5" />
                    Cliente e cota
                </div>
                <p className="text-sm font-medium text-white">{contrato.cliente_nome || "Cliente sem nome"}</p>
                <p className="text-sm text-slate-400">
                    Contrato {contrato.contrato_numero || "-"} • Cota {contrato.numero_cota || "-"} • Grupo {contrato.grupo_codigo || "-"}
                </p>
            </div>

            <div className="grid gap-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <Landmark className="h-3.5 w-3.5" />
                    Carta
                </div>
                <p className="text-sm font-medium text-white">{formatMoney(contrato.valor_carta)}</p>
                <p className="text-sm text-slate-400">{contrato.administradora_nome || "Administradora nao informada"}</p>
            </div>

            <div className="grid gap-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <CircleCheckBig className="h-3.5 w-3.5" />
                    Comissao
                </div>
                <p className="text-sm font-medium text-white">
                    {contrato.possui_comissao_ativa ? "Ativa" : "Sem comissao ativa"}
                </p>
                <p className="text-sm text-slate-400">
                    {contrato.possui_comissao_ativa
                        ? `${contrato.percentual_comissao || "-"}% • ${contrato.modo_comissao || "modo nao informado"}`
                        : "Ajuste a configuracao comercial antes do registro financeiro."}
                </p>
            </div>

            <div className="grid gap-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <FileText className="h-3.5 w-3.5" />
                    Parceiro
                </div>
                <p className="text-sm font-medium text-white">
                    {contrato.parceiro_vinculado ? contrato.parceiro_nome || "Parceiro vinculado" : "Sem parceiro vinculado"}
                </p>
                <p className="text-sm text-slate-400">
                    {contrato.parceiro_vinculado
                        ? `Repasse configurado em ${contrato.parceiro_percentual || "-"}%`
                        : "Venda direta para a organizacao."}
                </p>
            </div>
        </div>
    );
}

export function PagamentoForm({
    contratos,
    selectedContratoId,
    pagamento,
    action,
    contratoSelecionado,
    pagamentosIniciais,
}: PagamentoFormProps) {
    const formAction = action === "edit" ? updatePagamentoAction : createPagamentoAction;
    const [state, dispatch, isPending] = useActionState(formAction, initialState);

    const pagamentos =
        state.ok && state.item
            ? [
                  state.item,
                  ...pagamentosIniciais.filter((row) => row.id !== state.item?.id),
              ]
            : pagamentosIniciais;

    useEffect(() => {
        if (state.error) {
            toast.error(state.error);
            return;
        }
        if (!state.ok) return;

        toast.success(state.message || "Pagamento salvo com sucesso.");
    }, [state]);

    return (
        <div className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.45)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Pagamento operacional</p>
                    <h2 className="text-lg font-semibold text-white">
                        {action === "edit" ? "Editar pagamento do contrato" : "Registrar novo pagamento"}
                    </h2>
                    <p className="max-w-3xl text-sm text-slate-400">
                        Registre a parcela, gere a competencia e acompanhe o efeito no motor de comissao sem sair da
                        rotina operacional.
                    </p>
                </div>
                {pagamento ? (
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                        Editando pagamento {pagamento.id.slice(0, 8)}
                    </div>
                ) : null}
            </div>

            <ContractContextCard contrato={contratoSelecionado} />

            <form action={dispatch} className="grid gap-5">
                {action === "edit" && pagamento ? (
                    <input type="hidden" name="pagamento_id" defaultValue={pagamento.id} />
                ) : null}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <label className="grid gap-2 text-sm text-slate-200 xl:col-span-2">
                        <span>Contrato</span>
                        <select
                            name="contrato_id"
                            defaultValue={pagamento?.contrato_id ?? selectedContratoId}
                            className="h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
                            required
                        >
                            {contratos.map((contrato) => (
                                <option key={contrato.contrato_id} value={contrato.contrato_id}>
                                    {(contrato.contrato_numero || "Sem numero") +
                                        " - " +
                                        (contrato.cliente_nome || "Cliente sem nome") +
                                        " - Cota " +
                                        (contrato.numero_cota || "-")}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="grid gap-2 text-sm text-slate-200">
                        <span>Competencia</span>
                        <input
                            type="date"
                            name="competencia"
                            defaultValue={toDateInput(pagamento?.competencia)}
                            className="h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
                            required
                        />
                    </label>

                    <label className="grid gap-2 text-sm text-slate-200">
                        <span>Vencimento</span>
                        <input
                            type="date"
                            name="vencimento"
                            defaultValue={toDateInput(pagamento?.vencimento)}
                            className="h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
                            required
                        />
                    </label>

                    <label className="grid gap-2 text-sm text-slate-200">
                        <span>Valor</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            name="valor"
                            defaultValue={pagamento?.valor ?? ""}
                            className="h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
                            required
                        />
                    </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <label className="grid gap-2 text-sm text-slate-200">
                        <span>Status</span>
                        <select
                            name="status"
                            defaultValue={pagamento?.status ?? "previsto"}
                            className="h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
                            required
                        >
                            <option value="previsto">Previsto</option>
                            <option value="emitido">Emitido</option>
                            <option value="pago">Pago</option>
                            <option value="atrasado">Atrasado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </label>

                    <label className="grid gap-2 text-sm text-slate-200">
                        <span>Pago em</span>
                        <input
                            type="datetime-local"
                            name="pago_em"
                            defaultValue={toDateTimeLocal(pagamento?.pago_em)}
                            className="h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
                        />
                    </label>

                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                        <div className="flex items-start gap-3">
                            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                            <p>
                                Contrato, competencia, valor e vencimento sao obrigatorios. Pagamento manual com status
                                <strong className="text-slate-200"> pago</strong> alimenta a competencia e a comissao.
                            </p>
                        </div>
                    </div>
                </div>

                <label className="grid gap-2 text-sm text-slate-200">
                    <span>Observacoes</span>
                    <textarea
                        name="observacoes"
                        defaultValue={pagamento?.observacoes ?? ""}
                        rows={3}
                        className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                        placeholder="Ex.: parcela recebida manualmente pela equipe financeira"
                    />
                </label>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    {isPending ? (
                        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processando pagamento, competencia e comissao...
                        </div>
                    ) : null}
                    <SubmitButton
                        disabled={isPending}
                        label={action === "edit" ? "Salvar pagamento" : "Criar pagamento"}
                    />
                </div>
            </form>

            <ProcessingFeedbackCard state={state} />

            <PagamentosTable pagamentos={pagamentos} selectedContratoId={selectedContratoId} />
        </div>
    );
}
