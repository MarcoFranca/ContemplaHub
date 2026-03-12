"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    cancelarCotaAction,
    contemplarCotaAction,
    reativarCotaAction,
    registrarLanceAction,
    salvarControleMensalAction,
} from "../actions";
import type { LanceCartaListItem } from "../types";

type Props = {
    item: LanceCartaListItem;
    competencia: string;
};

function formatBrl(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0) + "%";
}

function parseBrlCurrency(value: string) {
    if (!value) return 0;

    const digits = value.replace(/\D/g, "");
    if (!digits) return 0;

    return Number(digits) / 100;
}

function CurrencyInput({
                           value,
                           onValueChange,
                           placeholder,
                           disabled,
                           name,
                       }: {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    name?: string;
}) {
    return (
        <Input
            name={name}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            inputMode="numeric"
            onChange={(e) => {
                const numeric = parseBrlCurrency(e.target.value);
                onValueChange(numeric === 0 ? "R$ 0,00" : formatBrl(numeric));
            }}
        />
    );
}

export function LanceActions({ item, competencia }: Props) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function runAction(action: (formData: FormData) => Promise<void>, formData: FormData) {
        setError(null);
        startTransition(async () => {
            try {
                await action(formData);
                router.refresh();
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Erro ao executar ação.");
            }
        });
    }

    return (
        <div className="flex flex-wrap gap-2">
            {error && <Badge variant="destructive">{error}</Badge>}

            {item.status === "ativa" && (
                <>
                    <QuickControleButton
                        label="Planejar"
                        cotaId={item.cota_id}
                        competencia={competencia}
                        statusMes="planejado"
                        onSubmit={runAction}
                    />

                    <QuickControleButton
                        label="Sem lance"
                        cotaId={item.cota_id}
                        competencia={competencia}
                        statusMes="sem_lance"
                        onSubmit={runAction}
                    />

                    <RegistrarLanceDialog
                        item={item}
                        competencia={competencia}
                        onSubmit={runAction}
                        pending={pending}
                    />

                    <ContemplarDialog
                        cotaId={item.cota_id}
                        competencia={competencia}
                        onSubmit={runAction}
                        pending={pending}
                    />

                    <CancelarDialog
                        cotaId={item.cota_id}
                        competencia={competencia}
                        onSubmit={runAction}
                        pending={pending}
                    />
                </>
            )}

            {item.status === "cancelada" && (
                <form
                    action={(formData) => runAction(reativarCotaAction, formData)}
                    className="inline-flex"
                >
                    <input type="hidden" name="cota_id" value={item.cota_id} />
                    <Button type="submit" variant="outline" size="sm" disabled={pending}>
                        Reativar
                    </Button>
                </form>
            )}
        </div>
    );
}

function QuickControleButton({
                                 label,
                                 cotaId,
                                 competencia,
                                 statusMes,
                                 onSubmit,
                             }: {
    label: string;
    cotaId: string;
    competencia: string;
    statusMes: "planejado" | "sem_lance";
    onSubmit: (action: (formData: FormData) => Promise<void>, formData: FormData) => void;
}) {
    return (
        <form
            action={(formData) => onSubmit(salvarControleMensalAction, formData)}
            className="inline-flex"
        >
            <input type="hidden" name="cota_id" value={cotaId} />
            <input type="hidden" name="competencia" value={competencia} />
            <input type="hidden" name="status_mes" value={statusMes} />
            <input type="hidden" name="observacoes" value="" />
            <Button type="submit" variant="outline" size="sm">
                {label}
            </Button>
        </form>
    );
}

function RegistrarLanceDialog({
                                  item,
                                  competencia,
                                  onSubmit,
                                  pending,
                              }: {
    item: LanceCartaListItem;
    competencia: string;
    onSubmit: (action: (formData: FormData) => Promise<void>, formData: FormData) => void;
    pending: boolean;
}) {
    const assembleiaDefault = item.assembleia_prevista ?? competencia;

    const [tipoLance, setTipoLance] = useState<"livre" | "fixo">("livre");
    const [fixoOpcaoId, setFixoOpcaoId] = useState("");

    const [valor, setValor] = useState("R$ 0,00");
    const [embutido, setEmbutido] = useState("R$ 0,00");
    const [fgts, setFgts] = useState("R$ 0,00");
    const [outro, setOutro] = useState("R$ 0,00");

    const valorNumber = parseBrlCurrency(valor);
    const embutidoNumber = item.embutido_permitido ? parseBrlCurrency(embutido) : 0;
    const fgtsNumber = item.fgts_permitido ? parseBrlCurrency(fgts) : 0;
    const outroNumber = parseBrlCurrency(outro);

    const opcoesFixo = item.opcoes_lance_fixo ?? [];
    const opcaoFixoSelecionada =
        opcoesFixo.find((op) => op.id === fixoOpcaoId) ?? null;

    const valorCarta = Number(item.valor_carta ?? 0);
    const percentualFixo = opcaoFixoSelecionada
        ? Number(opcaoFixoSelecionada.percentual)
        : 0;

    const baseInformada = embutidoNumber + fgtsNumber + outroNumber;
    const proprioNumber = Math.max(valorNumber - baseInformada, 0);


    const embutidoMaxPercent = Number(item.embutido_max_percent ?? 0);
    const limiteEmbutido =
        item.embutido_permitido && valorCarta > 0 && embutidoMaxPercent > 0
            ? valorCarta * (embutidoMaxPercent / 100)
            : null;

    const excedeuEmbutido =
        limiteEmbutido != null && embutidoNumber > limiteEmbutido;

    const excedeuTotal = baseInformada > valorNumber;

    const creditoLiquido = Math.max(valorCarta - embutidoNumber, 0);
    const valorBolso = creditoLiquido - proprioNumber;

    const podeSalvar =
        valorNumber > 0 &&
        !excedeuTotal &&
        !excedeuEmbutido &&
        (tipoLance === "livre" || Boolean(fixoOpcaoId));
    console.log("opcoesFixo", opcoesFixo);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="sm">Registrar lance</Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Registrar lance</SheetTitle>
                </SheetHeader>

                <form
                    action={(formData) => {
                        if (!podeSalvar) return;

                        const total = valorNumber;
                        const embutidoVal = embutidoNumber;
                        const fgtsVal = fgtsNumber;
                        const outroVal = outroNumber;
                        const proprioVal = Math.max(total - embutidoVal - fgtsVal - outroVal, 0);

                        formData.set("valor", total.toFixed(2));
                        formData.set("pagamento_embutido", embutidoVal.toFixed(2));
                        formData.set("pagamento_fgts", fgtsVal.toFixed(2));
                        formData.set("pagamento_outro", outroVal.toFixed(2));
                        formData.set("pagamento_proprio", proprioVal.toFixed(2));

                        if (tipoLance === "fixo") {
                            if (!fixoOpcaoId) return;
                            formData.set("percentual", String(percentualFixo));
                            formData.set("cota_lance_fixo_opcao_id", fixoOpcaoId);
                        } else {
                            formData.delete("cota_lance_fixo_opcao_id");
                        }

                        onSubmit(registrarLanceAction, formData);
                    }}
                    className="mt-6 space-y-6"
                >
                    <input type="hidden" name="cota_id" value={item.cota_id}/>
                    <input type="hidden" name="competencia" value={competencia}/>
                    <input type="hidden" name="valor" value={valorNumber ? valorNumber.toFixed(2) : ""}/>
                    <input type="hidden" name="pagamento_embutido" value={embutidoNumber.toFixed(2)}/>
                    <input type="hidden" name="pagamento_fgts" value={fgtsNumber.toFixed(2)}/>
                    <input type="hidden" name="pagamento_outro" value={outroNumber.toFixed(2)}/>
                    <input type="hidden" name="pagamento_proprio" value={proprioNumber.toFixed(2)}/>
                    <input
                        type="hidden"
                        name="cota_lance_fixo_opcao_id"
                        value={tipoLance === "fixo" ? fixoOpcaoId : ""}
                    />

                    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-6">
                            <div className="rounded-xl border p-4 space-y-4">
                                <div>
                                    <h3 className="font-medium">Dados do lance</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Preencha o lance ofertado para a competência selecionada.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label className="text-sm">Data da assembleia</label>
                                        <Input
                                            name="assembleia_data"
                                            type="date"
                                            defaultValue={assembleiaDefault}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm">Tipo de lance</label>
                                        <select
                                            name="tipo"
                                            className="h-10 rounded-md border bg-background px-3 text-sm"
                                            value={tipoLance}
                                            onChange={(e) => {
                                                const next = e.target.value as "livre" | "fixo";
                                                setTipoLance(next);
                                                if (next !== "fixo") setFixoOpcaoId("");
                                            }}
                                        >
                                            <option value="livre">Livre</option>
                                            <option value="fixo" disabled={!opcoesFixo.length}>
                                                Fixo
                                            </option>
                                        </select>
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm">Valor total do lance</label>
                                        <CurrencyInput
                                            name="valor_mask"
                                            value={valor}
                                            onValueChange={setValor}
                                            placeholder="R$ 0,00"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm">Percentual do lance</label>

                                        {tipoLance === "livre" ? (
                                            <>
                                                <Input
                                                    name="percentual"
                                                    placeholder="Ex.: 32,50"
                                                    defaultValue=""
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Informe manualmente conforme a base de cálculo usada pela operadora.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <select
                                                    name="cota_lance_fixo_opcao_id"
                                                    className="h-10 rounded-md border bg-background px-3 text-sm"
                                                    value={fixoOpcaoId}
                                                    onChange={(e) => setFixoOpcaoId(e.target.value)}
                                                >
                                                    <option value="">Selecione a opção de fixo</option>
                                                    {opcoesFixo.map((op) => (
                                                        <option key={op.id} value={op.id}>
                                                            Fixo {Number(op.percentual).toLocaleString("pt-BR")}%
                                                        </option>
                                                    ))}
                                                </select>

                                                <Input
                                                    value={opcaoFixoSelecionada ? `${Number(opcaoFixoSelecionada.percentual).toLocaleString("pt-BR")}%` : ""}
                                                    readOnly
                                                    disabled
                                                />

                                                <p className="text-xs text-muted-foreground">
                                                    O percentual do lance fixo é definido pela opção selecionada da
                                                    carta.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm">Base de cálculo</label>
                                    <select
                                        name="base_calculo"
                                        className="h-10 rounded-md border bg-background px-3 text-sm"
                                        defaultValue="valor_carta"
                                    >
                                        <option value="saldo_devedor">Saldo devedor</option>
                                        <option value="valor_carta">Valor da carta</option>
                                    </select>
                                </div>
                            </div>

                            <div className="rounded-xl border p-4 space-y-4">
                                <div>
                                    <h3 className="font-medium">Composição do pagamento</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Informe embutido, FGTS e outros recursos. O recurso próprio é calculado
                                        automaticamente.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label className="text-sm">Embutido</label>
                                        <CurrencyInput
                                            name="pagamento_embutido_mask"
                                            value={embutido}
                                            onValueChange={setEmbutido}
                                            placeholder="R$ 0,00"
                                            disabled={!item.embutido_permitido}
                                        />
                                        {!item.embutido_permitido && (
                                            <p className="text-xs text-muted-foreground">
                                                Esta cota não permite embutido.
                                            </p>
                                        )}
                                        {limiteEmbutido != null && (
                                            <p className="text-xs text-muted-foreground">
                                                Máximo permitido: {formatBrl(limiteEmbutido)}
                                            </p>
                                        )}
                                        {excedeuEmbutido && (
                                            <p className="text-xs text-red-500">
                                                O embutido informado excede o limite permitido.
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm">FGTS</label>
                                        <CurrencyInput
                                            name="pagamento_fgts_mask"
                                            value={fgts}
                                            onValueChange={setFgts}
                                            placeholder="R$ 0,00"
                                            disabled={!item.fgts_permitido}
                                        />
                                        {!item.fgts_permitido && (
                                            <p className="text-xs text-muted-foreground">
                                                Esta cota não permite FGTS.
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm">Outro recurso</label>
                                        <CurrencyInput
                                            name="pagamento_outro_mask"
                                            value={outro}
                                            onValueChange={setOutro}
                                            placeholder="R$ 0,00"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm">Recurso próprio</label>
                                        <Input
                                            value={formatBrl(proprioNumber)}
                                            readOnly
                                            disabled
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Calculado automaticamente para fechar o total do lance.
                                        </p>
                                    </div>
                                </div>

                                {excedeuTotal && (
                                    <p className="text-xs text-red-500">
                                        Embutido + FGTS + outro não podem ultrapassar o valor total do lance.
                                    </p>
                                )}
                            </div>

                            <div className="rounded-xl border p-4 space-y-4">
                                <div>
                                    <h3 className="font-medium">Observações</h3>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm">Observações da competência</label>
                                    <Textarea
                                        name="observacoes_competencia"
                                        placeholder="Ex.: lance registrado no portal da operadora"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-xl border p-4 space-y-3">
                                <div>
                                    <h3 className="font-medium">Resumo estratégico</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Visão rápida do impacto financeiro do lance.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span>Valor da carta</span>
                                    <strong>{formatBrl(valorCarta)}</strong>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span>Embutido usado</span>
                                    <strong>{formatBrl(embutidoNumber)}</strong>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span>Crédito líquido</span>
                                    <strong>{formatBrl(creditoLiquido)}</strong>
                                </div>

                                <div className="border-t pt-3"/>

                                <div className="flex items-center justify-between text-sm">
                                    <span>FGTS</span>
                                    <strong>{formatBrl(fgtsNumber)}</strong>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span>Recurso próprio</span>
                                    <strong>{formatBrl(proprioNumber)}</strong>
                                </div>

                                <div className="border-t pt-3"/>

                                <div className="flex items-center justify-between text-sm">
                                    <span>Valor líquido no bolso</span>
                                    <strong className={valorBolso < 0 ? "text-red-500" : "text-emerald-500"}>
                                        {formatBrl(valorBolso)}
                                    </strong>
                                </div>

                                {valorBolso < 0 && (
                                    <p className="text-xs text-red-500">
                                        O recurso próprio está maior que o crédito líquido disponível.
                                    </p>
                                )}
                            </div>

                            <div className="rounded-xl border p-4 space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>Operadora</span>
                                    <strong>{item.administradora_nome || "—"}</strong>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Grupo</span>
                                    <strong>{item.grupo_codigo}</strong>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Cota</span>
                                    <strong>{item.numero_cota}</strong>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Produto</span>
                                    <strong className="capitalize">{item.produto}</strong>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={pending || !podeSalvar} className="w-full">
                                    Salvar lance
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}

function ContemplarDialog({
                              cotaId,
                              competencia,
                              onSubmit,
                              pending,
                          }: {
    cotaId: string;
    competencia: string;
    onSubmit: (action: (formData: FormData) => Promise<void>, formData: FormData) => void;
    pending: boolean;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                    Contemplar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Marcar como contemplada</DialogTitle>
                </DialogHeader>

                <form action={(formData) => onSubmit(contemplarCotaAction, formData)} className="space-y-4">
                    <input type="hidden" name="cota_id" value={cotaId}/>
                    <input type="hidden" name="competencia" value={competencia}/>

                    <div className="grid gap-2">
                        <label className="text-sm">Data da contemplação</label>
                        <Input name="data" type="date" required />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm">Motivo</label>
                        <select
                            name="motivo"
                            className="h-10 rounded-md border bg-background px-3 text-sm"
                            defaultValue="lance"
                        >
                            <option value="lance">Lance</option>
                            <option value="sorteio">Sorteio</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm">Percentual do lance</label>
                        <Input name="lance_percentual" placeholder="Opcional" />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={pending}>
                            Confirmar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CancelarDialog({
                            cotaId,
                            competencia,
                            onSubmit,
                            pending,
                        }: {
    cotaId: string;
    competencia: string;
    onSubmit: (action: (formData: FormData) => Promise<void>, formData: FormData) => void;
    pending: boolean;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    Cancelar cota
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancelar cota</DialogTitle>
                </DialogHeader>

                <form action={(formData) => onSubmit(cancelarCotaAction, formData)} className="space-y-4">
                    <input type="hidden" name="cota_id" value={cotaId} />
                    <input type="hidden" name="competencia" value={competencia} />

                    <div className="grid gap-2">
                        <label className="text-sm">Observações</label>
                        <Textarea
                            name="observacoes"
                            placeholder="Ex.: cliente decidiu cancelar a gestão desta carta"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" variant="destructive" disabled={pending}>
                            Confirmar cancelamento
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}