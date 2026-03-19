"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CalendarDays,
    ClipboardList,
    FileClock,
    History,
} from "lucide-react";
import {updateCartaOperacaoAction} from "@/app/app/lances/components/actions/update-carta-operacao";
import {
    CartaOperacaoFormInput,
    CartaOperacaoFormValues, cartaOperacaoSchema
} from "@/app/app/lances/components/schemas/carta-operacao.schema";

type OperacaoInitialValues = {
    assembleiaDia?: number | null;
    assembleiaDiaOrigem?: string | null;
    statusMes?:
        | "pendente"
        | "planejado"
        | "feito"
        | "sem_lance"
        | "contemplada"
        | "cancelada"
        | null;
    observacoes?: string | null;
    dataUltimoLance?: string | null;
};

type Props = {
    cotaId: string;
    competencia?: string | null;
    initialValues: OperacaoInitialValues;
    onDirtyChange?: (dirty: boolean) => void;
};

function statusMesLabel(value: string) {
    switch (value) {
        case "pendente":
            return "Pendente";
        case "planejado":
            return "Planejado";
        case "feito":
            return "Baixado";
        case "sem_lance":
            return "Sem lance";
        case "contemplada":
            return "Contemplada";
        case "cancelada":
            return "Cancelada";
        default:
            return value;
    }
}

export function CartaOperacaoForm({
                                      cotaId,
                                      competencia,
                                      initialValues,
                                      onDirtyChange,
                                  }: Props) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<CartaOperacaoFormInput, unknown, CartaOperacaoFormValues>({
        resolver: zodResolver(cartaOperacaoSchema),
        defaultValues: {
            assembleiaDia:
                initialValues.assembleiaDia == null
                    ? null
                    : String(initialValues.assembleiaDia),
            assembleiaDiaOrigem: initialValues.assembleiaDiaOrigem ?? "",
            statusMes: initialValues.statusMes ?? "pendente",
            observacoes: initialValues.observacoes ?? "",
            dataUltimoLance: initialValues.dataUltimoLance ?? "",
        },
    });

    useEffect(() => {
        if (!onDirtyChange) return;

        const subscription = form.watch(() => {
            onDirtyChange(form.formState.isDirty);
        });

        return () => subscription.unsubscribe();
    }, [form, onDirtyChange]);

    const statusMes = form.watch("statusMes");

    function onSubmit(values: CartaOperacaoFormValues) {
        startTransition(async () => {
            const result = await updateCartaOperacaoAction({
                cotaId,
                competencia,
                values,
            });

            if (!result.ok) {
                toast.error(result.message || "Não foi possível salvar a operação.");
                return;
            }

            toast.success(result.message || "Operação atualizada com sucesso.");

            form.reset({
                assembleiaDia:
                    values.assembleiaDia == null ? null : String(values.assembleiaDia),
                assembleiaDiaOrigem: values.assembleiaDiaOrigem ?? "",
                statusMes: values.statusMes ?? "pendente",
                observacoes: values.observacoes ?? "",
                dataUltimoLance: values.dataUltimoLance ?? "",
            });

            onDirtyChange?.(false);
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4">
                    <Card className="border-white/10 bg-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="inline-flex items-center gap-2 text-base">
                                <CalendarDays className="h-4 w-4" />
                                Assembleia
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="assembleiaDia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dia base da assembleia</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="31"
                                                placeholder="Ex.: 15"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === "" ? null : value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Dia base usado para orientar a assembleia da carta.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assembleiaDiaOrigem"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Origem da regra</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex.: administradora, importação, ajuste manual"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Registre de onde veio a definição da assembleia.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="inline-flex items-center gap-2 text-base">
                                <FileClock className="h-4 w-4" />
                                Competência atual
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-100">
                                            Competência em edição
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {competencia || "Competência não informada"}
                                        </p>
                                    </div>

                                    {statusMes ? (
                                        <Badge variant="outline">{statusMesLabel(statusMes)}</Badge>
                                    ) : null}
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="statusMes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status do mês</FormLabel>
                                        <Select
                                            value={field.value ?? "pendente"}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status do mês" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="pendente">Pendente</SelectItem>
                                                <SelectItem value="planejado">Planejado</SelectItem>
                                                <SelectItem value="feito">Baixado</SelectItem>
                                                <SelectItem value="sem_lance">Sem lance</SelectItem>
                                                <SelectItem value="contemplada">Contemplada</SelectItem>
                                                <SelectItem value="cancelada">Cancelada</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <FormDescription>
                                            Use este campo para refletir a situação operacional da carta na competência.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="observacoes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observações operacionais</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={6}
                                                placeholder="Registre contexto do mês, travas, decisões, pendências e próximos passos."
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Ideal para deixar o raciocínio visível para vendedor, gestor e operação.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="inline-flex items-center gap-2 text-base">
                                <History className="h-4 w-4" />
                                Data de último lance
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="dataUltimoLance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data do último lance</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Edite somente se esse campo realmente fizer parte do fluxo manual da operação.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-muted-foreground">
                                Evite usar esta seção para reescrever histórico. O ideal é refletir aqui apenas o estado operacional corrente da carta.
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="inline-flex items-center gap-2 text-base">
                                <ClipboardList className="h-4 w-4" />
                                Leitura da operação
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                                Use esta aba para registrar somente o que ajuda a conduzir a carta no mês:
                                assembleia, status operacional e observações relevantes.
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                                Alterações estruturais de direcionamento devem ficar na aba <strong>Estratégia</strong>. Configuração de embutido, FGTS e fixo deve ficar na aba <strong>Modalidades</strong>.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 pt-4 backdrop-blur">
                    <div className="text-xs text-muted-foreground">
                        Salve apenas esta aba para atualizar a operação do mês e a configuração de assembleia.
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => form.reset()}
                            disabled={isPending || !form.formState.isDirty}
                        >
                            Descartar
                        </Button>

                        <Button
                            type="submit"
                            disabled={isPending || !form.formState.isDirty}
                        >
                            {isPending ? "Salvando..." : "Salvar operação"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}