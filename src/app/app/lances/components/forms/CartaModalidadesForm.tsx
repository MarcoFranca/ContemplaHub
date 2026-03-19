"use client";

import { useMemo, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    cartaModalidadesSchema,
    type CartaModalidadesFormValues,
} from "../schemas/carta-modalidades.schema";
import { updateCartaModalidadesAction } from "../actions/update-carta-modalidades";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Banknote,
    BadgePercent,
    CheckCircle2,
    ShieldCheck,
    WalletCards,
} from "lucide-react";

type Props = {
    cotaId: string;
    initialValues: CartaModalidadesFormValues;
};

function buildDefaultOptions(
    values: CartaModalidadesFormValues["opcoesLanceFixo"]
): CartaModalidadesFormValues["opcoesLanceFixo"] {
    return [1, 2, 3].map((ordem) => {
        const existing = values.find((item) => item.ordem === ordem);

        return (
            existing ?? {
                ordem,
                percentual: null,
                ativo: false,
            }
        );
    });
}

export function CartaModalidadesForm({ cotaId, initialValues }: Props) {
    const [isPending, startTransition] = useTransition();

    const defaultValues = useMemo<CartaModalidadesFormValues>(
        () => ({
            embutidoPermitido: Boolean(initialValues.embutidoPermitido),
            embutidoMaxPercent: initialValues.embutidoMaxPercent ?? null,
            fgtsPermitido: Boolean(initialValues.fgtsPermitido),
            opcoesLanceFixo: buildDefaultOptions(initialValues.opcoesLanceFixo ?? []),
        }),
        [initialValues]
    );

    const form = useForm<CartaModalidadesFormValues>({
        resolver: zodResolver(cartaModalidadesSchema),
        defaultValues,
        mode: "onSubmit",
    });

    const { fields } = useFieldArray<CartaModalidadesFormValues, "opcoesLanceFixo">({
        control: form.control,
        name: "opcoesLanceFixo",
    });

    const embutidoPermitido = form.watch("embutidoPermitido");
    const opcoes = form.watch("opcoesLanceFixo");
    const hasActiveFixed = opcoes?.some((item) => item.ativo);

    function onSubmit(values: CartaModalidadesFormValues) {
        startTransition(async () => {
            const result = await updateCartaModalidadesAction({
                cotaId,
                values,
            });

            if (!result.ok) {
                toast.error(result.message || "Não foi possível salvar modalidades.");
                return;
            }

            toast.success(result.message || "Modalidades atualizadas com sucesso.");
            form.reset(values);
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4">
                    <Card className="border-white/10 bg-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="inline-flex items-center gap-2 text-base">
                                <WalletCards className="h-4 w-4" />
                                Embutido
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="embutidoPermitido"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-4">
                                        <div className="space-y-1">
                                            <FormLabel>Permitir lance embutido</FormLabel>
                                            <FormDescription>
                                                Use somente quando a administradora e a carta admitirem essa modalidade.
                                            </FormDescription>
                                        </div>

                                        <FormControl>
                                            <Switch
                                                checked={Boolean(field.value)}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="embutidoMaxPercent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Percentual máximo do embutido</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                placeholder="Ex.: 30"
                                                disabled={!embutidoPermitido}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === "" ? null : Number(value));
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Percentual máximo da carta que pode ser usado no lance embutido.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {embutidoPermitido ? (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-muted-foreground">
                                    O embutido está habilitado. Revise o percentual máximo para não comprometer a utilidade do crédito.
                                </div>
                            ) : (
                                <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                                    Embutido desabilitado para esta carta.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="inline-flex items-center gap-2 text-base">
                                <ShieldCheck className="h-4 w-4" />
                                FGTS
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <FormField
                                control={form.control}
                                name="fgtsPermitido"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-4">
                                        <div className="space-y-1">
                                            <FormLabel>Permitir uso de FGTS</FormLabel>
                                            <FormDescription>
                                                Habilite apenas quando a operação e a documentação forem compatíveis com as regras aplicáveis.
                                            </FormDescription>
                                        </div>

                                        <FormControl>
                                            <Switch
                                                checked={Boolean(field.value)}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="inline-flex items-center gap-2 text-base">
                                <Banknote className="h-4 w-4" />
                                Opções de lance fixo
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                                Cadastre até 3 opções. Ative apenas as que realmente fazem sentido para a condução da carta.
                            </div>

                            <FormField
                                control={form.control}
                                name="opcoesLanceFixo"
                                render={() => (
                                    <FormItem>
                                        <div className="space-y-3">
                                            {fields.map((fieldItem, index) => {
                                                const ativo = form.watch(`opcoesLanceFixo.${index}.ativo`);

                                                return (
                                                    <div
                                                        key={fieldItem.id}
                                                        className="rounded-xl border border-white/10 bg-black/10 p-4"
                                                    >
                                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline">Opção {index + 1}</Badge>

                                                                    {ativo ? (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="inline-flex items-center gap-1"
                                                                        >
                                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                                            Ativa
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="outline">Inativa</Badge>
                                                                    )}
                                                                </div>

                                                                <p className="text-sm text-muted-foreground">
                                                                    Defina o percentual somente se a opção estiver ativa.
                                                                </p>
                                                            </div>

                                                            <FormField
                                                                control={form.control}
                                                                name={`opcoesLanceFixo.${index}.ativo`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex items-center gap-3">
                                                                        <FormLabel className="m-0">Ativar</FormLabel>
                                                                        <FormControl>
                                                                            <Switch
                                                                                checked={Boolean(field.value)}
                                                                                onCheckedChange={field.onChange}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                            <FormField
                                                                control={form.control}
                                                                name={`opcoesLanceFixo.${index}.ordem`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Ordem</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                min="1"
                                                                                max="3"
                                                                                disabled
                                                                                value={field.value ?? index + 1}
                                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                                            />
                                                                        </FormControl>
                                                                        <FormDescription>
                                                                            Ordem visual e lógica da opção.
                                                                        </FormDescription>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name={`opcoesLanceFixo.${index}.percentual`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="inline-flex items-center gap-2">
                                                                            <BadgePercent className="h-4 w-4" />
                                                                            Percentual
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0"
                                                                                max="100"
                                                                                placeholder="Ex.: 25"
                                                                                disabled={!ativo}
                                                                                value={field.value ?? ""}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    field.onChange(value === "" ? null : Number(value));
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormDescription>
                                                                            Percentual usado na opção fixa.
                                                                        </FormDescription>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {hasActiveFixed ? (
                                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-sm text-muted-foreground">
                                    Há opções fixas ativas. Revise se os percentuais refletem a estratégia real da carta.
                                </div>
                            ) : (
                                <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-muted-foreground">
                                    Nenhuma opção de lance fixo está ativa no momento.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 pt-4 backdrop-blur">
                    <div className="text-xs text-muted-foreground">
                        Salve apenas esta aba para atualizar modalidades e opções fixas.
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => form.reset(defaultValues)}
                            disabled={isPending || !form.formState.isDirty}
                        >
                            Descartar
                        </Button>

                        <Button
                            type="submit"
                            disabled={isPending || !form.formState.isDirty}
                        >
                            {isPending ? "Salvando..." : "Salvar modalidades"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}