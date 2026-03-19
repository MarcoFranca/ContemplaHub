"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    cartaEstrategiaSchema,
    type CartaEstrategiaFormInput,
    type CartaEstrategiaFormValues,
} from "../schemas/carta-estrategia.schema";
import { updateCartaEstrategiaAction } from "../actions/update-carta-estrategia";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { BadgePercent, Goal, ShieldCheck, Sparkles } from "lucide-react";

type Props = {
    cotaId: string;
    initialValues: CartaEstrategiaFormValues;
};

function tipoLabel(value: string) {
    switch (value) {
        case "livre":
            return "Lance livre";
        case "fixo":
            return "Lance fixo";
        case "embutido":
            return "Lance embutido";
        case "sorteio":
            return "Sorteio";
        default:
            return "Sem preferência";
    }
}

export function CartaEstrategiaForm({ cotaId, initialValues }: Props) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<CartaEstrategiaFormInput, unknown, CartaEstrategiaFormValues>({
        resolver: zodResolver(cartaEstrategiaSchema),
        defaultValues: {
            objetivo: initialValues.objetivo ?? "",
            estrategia: initialValues.estrategia ?? "",
            tipoLancePreferencial: initialValues.tipoLancePreferencial ?? "",
            autorizacaoGestao: !!initialValues.autorizacaoGestao,
        },
    });

    const tipo = form.watch("tipoLancePreferencial");
    const autorizacao = form.watch("autorizacaoGestao");

    function onSubmit(values: CartaEstrategiaFormValues) {
        startTransition(async () => {
            const result = await updateCartaEstrategiaAction({
                cotaId,
                values,
            });

            if (!result.ok) {
                toast.error(result.message || "Não foi possível salvar a estratégia.");
                return;
            }

            toast.success(result.message || "Estratégia atualizada com sucesso.");

            form.reset({
                objetivo: values.objetivo ?? "",
                estrategia: values.estrategia ?? "",
                tipoLancePreferencial: values.tipoLancePreferencial ?? "",
                autorizacaoGestao: !!values.autorizacaoGestao,
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
                                <Goal className="h-4 w-4" />
                                Objetivo da carta
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <FormField
                                control={form.control}
                                name="objetivo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Objetivo</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Ex.: contemplação por lance fixo em curto prazo"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Descreva o que a carta precisa atingir no contexto do cliente.
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
                                <Sparkles className="h-4 w-4" />
                                Direcionamento estratégico
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="tipoLancePreferencial"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de lance preferencial</FormLabel>
                                        <Select
                                            value={field.value ?? "__none__"}
                                            onValueChange={(value) =>
                                                field.onChange(value === "__none__" ? null : value)
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma preferência" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="__none__">Sem preferência</SelectItem>
                                                <SelectItem value="livre">Lance livre</SelectItem>
                                                <SelectItem value="fixo">Lance fixo</SelectItem>
                                                <SelectItem value="embutido">Lance embutido</SelectItem>
                                                <SelectItem value="sorteio">Sorteio</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Use quando houver uma modalidade prioritária para a condução da carta.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                                Preferência atual: <strong>{tipoLabel(tipo ?? "")}</strong>
                            </div>

                            <FormField
                                control={form.control}
                                name="estrategia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estratégia</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={8}
                                                placeholder="Descreva como a carta deve ser conduzida, quais travas existem e qual linha de operação faz mais sentido."
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Registre um texto útil para vendedor, gestor e operação entenderem a linha de ação da carta.
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
                                <ShieldCheck className="h-4 w-4" />
                                Governança da operação
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="autorizacaoGestao"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-4">
                                        <div className="space-y-1">
                                            <FormLabel>Gestão autorizada</FormLabel>
                                            <FormDescription>
                                                Indica se a carta está autorizada para condução operacional.
                                            </FormDescription>
                                        </div>

                                        <FormControl>
                                            <Switch
                                                checked={!!field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                                {autorizacao
                                    ? "A gestão está autorizada, o que reduz atrito operacional para conduzir a carta."
                                    : "Sem autorização de gestão, a estratégia pode existir, mas a execução precisa de validação antes de avançar."}
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                                Estratégia define <strong>direção</strong>. Configuração de embutido, FGTS e fixo fica na aba <strong>Modalidades</strong>. Assembleias, status do mês e observações correntes ficam na aba <strong>Operação</strong>.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 pt-4 backdrop-blur">
                    <div className="text-xs text-muted-foreground">
                        Salve apenas esta aba para atualizar objetivo, estratégia, preferência e autorização de gestão.
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
                            {isPending ? "Salvando..." : "Salvar estratégia"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}