"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    cartaGeralSchema,
    type CartaGeralFormInput,
    type CartaGeralFormValues,
} from "../schemas/carta-geral.schema";
import { updateCartaGeralAction } from "../actions/update-carta-geral";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Building2, CalendarDays, CircleDollarSign, FileText } from "lucide-react";

type Props = {
    cotaId: string;
    initialValues: CartaGeralFormValues;
};

export function CartaGeralForm({ cotaId, initialValues }: Props) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<CartaGeralFormInput, unknown, CartaGeralFormValues>({
        resolver: zodResolver(cartaGeralSchema),
        defaultValues: {
            grupoCodigo: initialValues.grupoCodigo ?? "",
            numeroCota: initialValues.numeroCota ?? "",
            produto: initialValues.produto ?? "imobiliario",
            status: initialValues.status ?? "ativa",
            dataAdesao: initialValues.dataAdesao ?? "",
            prazo: initialValues.prazo == null ? null : String(initialValues.prazo),
            valorCarta:
                initialValues.valorCarta == null ? null : String(initialValues.valorCarta),
            valorParcela:
                initialValues.valorParcela == null ? null : String(initialValues.valorParcela),
        },
    });

    function onSubmit(values: CartaGeralFormValues) {
        startTransition(async () => {
            const result = await updateCartaGeralAction({
                cotaId,
                values,
            });

            if (!result.ok) {
                toast.error(result.message || "Não foi possível salvar os dados gerais.");
                return;
            }

            toast.success(result.message || "Dados gerais atualizados com sucesso.");
            form.reset({
                grupoCodigo: values.grupoCodigo,
                numeroCota: values.numeroCota,
                produto: values.produto,
                status: values.status,
                dataAdesao: values.dataAdesao ?? "",
                prazo: values.prazo == null ? null : String(values.prazo),
                valorCarta: values.valorCarta == null ? null : String(values.valorCarta),
                valorParcela:
                    values.valorParcela == null ? null : String(values.valorParcela),
            });
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4">
                    <Card className="border-white/10 bg-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="inline-flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />
                                Identificação da carta
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="grupoCodigo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Grupo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex.: 4021" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Código do grupo da cota.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="numeroCota"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número da cota</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex.: 123" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Número identificador da cota dentro do grupo.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="produto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Produto</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o produto" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="imobiliario">Imobiliário</SelectItem>
                                                <SelectItem value="auto">Auto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Tipo principal do consórcio.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="ativa">Ativa</SelectItem>
                                                <SelectItem value="contemplada">Contemplada</SelectItem>
                                                <SelectItem value="cancelada">Cancelada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Situação contratual atual da carta.
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
                                <CalendarDays className="h-4 w-4" />
                                Datas e prazo
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="dataAdesao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de adesão</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Data de entrada da carta.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="prazo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prazo (meses)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Ex.: 180"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === "" ? null : value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Quantidade total de meses do plano.
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
                                <CircleDollarSign className="h-4 w-4" />
                                Valores principais
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="valorCarta"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor da carta</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Ex.: 250000"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === "" ? null : value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Valor de crédito contratado da carta.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="valorParcela"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor da parcela</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Ex.: 1850"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === "" ? null : value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Parcela atual de referência da carta.
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
                                <Building2 className="h-4 w-4" />
                                Observação de uso
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                                Esta aba deve concentrar os dados-base da carta. Estratégia, modalidades e operação ficam nas respectivas abas para evitar confusão no cadastro.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 pt-4 backdrop-blur">
                    <div className="text-xs text-muted-foreground">
                        Salve apenas esta aba para atualizar identificação, datas e valores da carta.
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
                            {isPending ? "Salvando..." : "Salvar dados gerais"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}