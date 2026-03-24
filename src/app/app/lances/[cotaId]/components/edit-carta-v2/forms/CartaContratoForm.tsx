"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, CalendarDays, FileSignature, Wallet } from "lucide-react";

import {
    cartaContratoSchema,
    type CartaContratoFormInput,
    type CartaContratoFormValues,
} from "../schemas/carta-contrato.schema";
import { createContratoCartaAction } from "../actions/create-contrato-carta";

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

type AdministradoraOption = {
    id: string;
    nome: string;
};

type Props = {
    leadId: string;
    clienteNome?: string | null;
    administradoras?: AdministradoraOption[];
    initialValues: {
        grupoCodigo: string;
        numeroCota: string;
        produto: "imobiliario" | "auto";
        status: "ativa" | "contemplada" | "cancelada";
        dataAdesao?: string | null;
        prazo: number | null;
        valorCarta: number | null;
        valorParcela: number | null;
    };
    onCreated: (payload: {
        contractId: string;
        cotaId: string;
        values: CartaContratoFormValues;
    }) => void;
};

function onlyDigits(value: string) {
    return value.replace(/\D/g, "");
}

function formatCurrencyBRL(value: string | number | null | undefined) {
    const raw = String(value ?? "");
    const digits = onlyDigits(raw);

    if (!digits) return "";

    const amount = Number(digits) / 100;

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(amount);
}

function defaultValues(
    leadId: string,
    clienteNome: string | null | undefined,
    initialValues: Props["initialValues"]
): CartaContratoFormInput {
    return {
        leadId,
        clienteNome: clienteNome ?? "",
        administradoraId: "",
        grupoCodigo: initialValues.grupoCodigo ?? "",
        numeroCota: initialValues.numeroCota ?? "",
        produto: initialValues.produto ?? "imobiliario",
        status: initialValues.status ?? "ativa",
        dataAdesao: initialValues.dataAdesao ?? "",
        prazo: initialValues.prazo == null ? null : String(initialValues.prazo),
        valorCarta:
            initialValues.valorCarta == null
                ? null
                : formatCurrencyBRL(initialValues.valorCarta),
        valorParcela:
            initialValues.valorParcela == null
                ? null
                : formatCurrencyBRL(initialValues.valorParcela),
        observacoes: "",
    };
}

export function CartaContratoForm({
                                      leadId,
                                      clienteNome,
                                      administradoras,
                                      initialValues,
                                      onCreated,
                                  }: Props) {
    const [isPending, startTransition] = useTransition();
    const administradorasSafe = administradoras ?? [];
    const form = useForm<CartaContratoFormInput, unknown, CartaContratoFormValues>({
        resolver: zodResolver(cartaContratoSchema),
        defaultValues: defaultValues(leadId, clienteNome, initialValues),
    });

    function onSubmit(values: CartaContratoFormValues) {
        startTransition(async () => {
            const result = await createContratoCartaAction({ values });

            if (!result.ok) {
                toast.error(result.message || "Não foi possível criar contrato e carta.");
                return;
            }

            const parsed = cartaContratoSchema.safeParse(values);
            if (!parsed.success) {
                toast.error("Contrato criado, mas houve falha ao normalizar os dados.");
                return;
            }

            if (!result.contractId || !result.cotaId) {
                toast.error("Contrato criado sem retorno completo de contrato/cota.");
                return;
            }

            toast.success(result.message || "Contrato e carta criados com sucesso.");

            onCreated({
                contractId: result.contractId,
                cotaId: result.cotaId,
                values: parsed.data,
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
                                <FileSignature className="h-4 w-4" />
                                Formalização inicial
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="administradoraId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Administradora</FormLabel>

                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a administradora" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                {administradorasSafe.map((adm) => (
                                                    <SelectItem key={adm.id} value={adm.id}>
                                                        {adm.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FormDescription>
                                            Obrigatório para formalização do contrato.
                                        </FormDescription>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="clienteNome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <FormControl>
                                            <Input value={field.value ?? ""} disabled />
                                        </FormControl>
                                        <FormDescription>
                                            Cliente já vinculado ao fluxo.
                                        </FormDescription>
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
                                Identificação da cota
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
                                            <Input
                                                placeholder="Ex.: 123"
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(onlyDigits(e.target.value))
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status inicial</FormLabel>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="inline-flex items-center gap-2 text-base">
                                <Wallet className="h-4 w-4" />
                                Dados financeiros
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="prazo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prazo (meses)</FormLabel>
                                        <FormControl>
                                            <Input
                                                inputMode="numeric"
                                                placeholder="Ex.: 180"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const v = onlyDigits(e.target.value);
                                                    field.onChange(v === "" ? null : v);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="valorCarta"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor da carta</FormLabel>
                                        <FormControl>
                                            <Input
                                                inputMode="numeric"
                                                placeholder="R$ 0,00"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const digits = onlyDigits(e.target.value);
                                                    field.onChange(digits ? formatCurrencyBRL(digits) : null);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="valorParcela"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parcela inicial</FormLabel>
                                        <FormControl>
                                            <Input
                                                inputMode="numeric"
                                                placeholder="R$ 0,00"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const digits = onlyDigits(e.target.value);
                                                    field.onChange(digits ? formatCurrencyBRL(digits) : null);
                                                }}
                                            />
                                        </FormControl>
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
                                Observações
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <FormField
                                control={form.control}
                                name="observacoes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observações</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Observações iniciais da formalização"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Opcional. Use para registrar contexto inicial.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 pt-4 backdrop-blur">
                    <div className="text-xs text-muted-foreground">
                        Primeiro formalize o contrato para criar a cota e liberar as demais abas.
                    </div>

                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Criando..." : "Criar contrato e continuar"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}