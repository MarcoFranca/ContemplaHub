"use client";

import * as React from "react";
import {
    BadgeCheck,
    Building2,
    CreditCard,
    KeyRound,
    Mail,
    Phone,
    Save,
    Shield,
    UserCog,
    UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    createParceiroAction,
    invitePartnerUserAction,
    updateParceiroAction,
    updatePartnerUserAction,
} from "../actions";
import type { ParceiroWithAccess } from "../types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
    trigger?: React.ReactNode;
    initialData?: ParceiroWithAccess;
};

type FormState = {
    nome: string;
    cpf_cnpj: string;
    telefone: string;
    email: string;
    ativo: boolean;

    criar_acesso: boolean;
    email_acesso: string;
    nome_acesso: string;
    telefone_acesso: string;
    acesso_ativo: boolean;

    can_view_client_data: boolean;
    can_view_contracts: boolean;
    can_view_commissions: boolean;
};

function onlyDigits(value: string) {
    return value.replace(/\D/g, "");
}

function maskPhone(value: string) {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 10) {
        return digits
            .replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, ddd, a, b) => {
                if (!ddd) return "";
                if (!a) return `(${ddd}`;
                if (!b) return `(${ddd}) ${a}`;
                return `(${ddd}) ${a}-${b}`;
            })
            .trim();
    }

    return digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
}

function maskCpfCnpj(value: string) {
    const digits = onlyDigits(value).slice(0, 14);

    if (digits.length <= 11) {
        return digits
            .replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2}).*/, (_, a, b, c, d) => {
                let out = a;
                if (b) out += `.${b}`;
                if (c) out += `.${c}`;
                if (d) out += `-${d}`;
                return out;
            })
            .trim();
    }

    return digits.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/,
        (_, a, b, c, d, e) => {
            let out = `${a}.${b}.${c}/${d}`;
            if (e) out += `-${e}`;
            return out;
        }
    );
}

function toInitialState(data?: ParceiroWithAccess): FormState {
    return {
        nome: data?.nome ?? "",
        cpf_cnpj: data?.cpf_cnpj ? maskCpfCnpj(data.cpf_cnpj) : "",
        telefone: data?.telefone ? maskPhone(data.telefone) : "",
        email: data?.email ?? "",
        ativo: data?.ativo ?? true,

        criar_acesso: Boolean(data?.partner_user),
        email_acesso: data?.partner_user?.email ?? "",
        nome_acesso: data?.partner_user?.nome ?? "",
        telefone_acesso: data?.partner_user?.telefone
            ? maskPhone(data.partner_user.telefone)
            : "",
        acesso_ativo: data?.partner_user?.ativo ?? true,

        can_view_client_data: data?.partner_user?.can_view_client_data ?? false,
        can_view_contracts: data?.partner_user?.can_view_contracts ?? true,
        can_view_commissions: data?.partner_user?.can_view_commissions ?? true,
    };
}

export function ParceiroSheet({ trigger, initialData }: Props) {
    const router = useRouter();
    const isEdit = Boolean(initialData?.id);

    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [form, setForm] = React.useState<FormState>(toInitialState(initialData));

    React.useEffect(() => {
        if (open) {
            setForm(toInitialState(initialData));
            setError(null);
        }
    }, [open, initialData]);

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit() {
        setError(null);

        if (!form.nome.trim()) {
            setError("Informe o nome do parceiro.");
            return;
        }

        if (form.criar_acesso && !form.email_acesso.trim()) {
            setError("Informe o e-mail de acesso do parceiro.");
            return;
        }

        setLoading(true);

        try {
            const parceiroPayload = {
                nome: form.nome.trim(),
                cpf_cnpj: form.cpf_cnpj ? onlyDigits(form.cpf_cnpj) : undefined,
                telefone: form.telefone ? onlyDigits(form.telefone) : undefined,
                email: form.email.trim() || undefined,
                ativo: form.ativo,
            };

            if (isEdit && initialData?.id) {
                await updateParceiroAction(initialData.id, parceiroPayload);

                if (form.criar_acesso) {
                    if (initialData.partner_user?.id) {
                        await updatePartnerUserAction(initialData.partner_user.id, {
                            nome: form.nome_acesso.trim() || form.nome.trim(),
                            telefone: form.telefone_acesso
                                ? onlyDigits(form.telefone_acesso)
                                : onlyDigits(form.telefone),
                            ativo: form.acesso_ativo,
                            can_view_client_data: form.can_view_client_data,
                            can_view_contracts: form.can_view_contracts,
                            can_view_commissions: form.can_view_commissions,
                        });
                    } else {
                        await invitePartnerUserAction({
                            parceiro_id: initialData.id,
                            email: form.email_acesso.trim(),
                            nome: form.nome_acesso.trim() || form.nome.trim(),
                            telefone: form.telefone_acesso
                                ? onlyDigits(form.telefone_acesso)
                                : onlyDigits(form.telefone),
                            ativo: form.acesso_ativo,
                            can_view_client_data: form.can_view_client_data,
                            can_view_contracts: form.can_view_contracts,
                            can_view_commissions: form.can_view_commissions,
                        });
                    }
                }

                toast.success("Parceiro atualizado com sucesso.");
            } else {
                await createParceiroAction({
                    ...parceiroPayload,
                    acesso: form.criar_acesso
                        ? {
                            criar_acesso: true,
                            email_acesso: form.email_acesso.trim(),
                            nome_acesso: form.nome_acesso.trim() || form.nome.trim(),
                            telefone_acesso: form.telefone_acesso
                                ? onlyDigits(form.telefone_acesso)
                                : onlyDigits(form.telefone),
                            ativo: form.acesso_ativo,
                            can_view_client_data: form.can_view_client_data,
                            can_view_contracts: form.can_view_contracts,
                            can_view_commissions: form.can_view_commissions,
                        }
                        : undefined,
                });

                toast.success("Parceiro criado com sucesso.");
            }

            setOpen(false);
            router.refresh();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Erro ao salvar parceiro.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger ?? <Button>{isEdit ? "Editar parceiro" : "Novo parceiro"}</Button>}
            </SheetTrigger>

            <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
                <div className="px-4 py-5 md:px-6">
                    <SheetHeader className="space-y-2 px-1">
                        <SheetTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-emerald-500" />
                            {isEdit ? "Editar parceiro" : "Novo parceiro"}
                        </SheetTitle>
                        <SheetDescription>
                            {isEdit
                                ? "Atualize os dados do parceiro, configure o acesso ao portal e ajuste as permissões de visualização."
                                : "Cadastre um parceiro comercial e, se desejar, libere acesso ao portal para consulta de contratos, clientes vinculados e comissões."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-6 px-1 md:px-2">
                        <Card className="rounded-2xl border-emerald-500/15">
                            <CardContent className="space-y-4 p-5 md:p-6">
                                <div className="flex items-center gap-2">
                                    <UserRound className="h-4 w-4 text-emerald-500" />
                                    <h3 className="font-medium">Dados do parceiro</h3>
                                </div>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome do parceiro</Label>
                                        <div className="relative">
                                            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="nome"
                                                className="pl-9"
                                                placeholder="Ex.: Imobiliária Horizonte"
                                                value={form.nome}
                                                onChange={(e) => update("nome", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                                            <div className="relative">
                                                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="cpf_cnpj"
                                                    className="pl-9"
                                                    placeholder="000.000.000-00 / 00.000.000/0000-00"
                                                    value={form.cpf_cnpj}
                                                    onChange={(e) => update("cpf_cnpj", maskCpfCnpj(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="telefone">Telefone</Label>
                                            <div className="relative">
                                                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="telefone"
                                                    className="pl-9"
                                                    placeholder="(11) 99999-9999"
                                                    value={form.telefone}
                                                    onChange={(e) => update("telefone", maskPhone(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-mail principal</Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                className="pl-9"
                                                placeholder="contato@parceiro.com.br"
                                                value={form.email}
                                                onChange={(e) => update("email", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border p-4">
                                        <div className="space-y-1 pr-4">
                                            <p className="text-sm font-medium">Parceiro ativo</p>
                                            <p className="text-xs text-muted-foreground">
                                                Permite usar esse parceiro nas novas negociações.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={form.ativo}
                                            onCheckedChange={(checked) => update("ativo", checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Separator />

                        <Card className="rounded-2xl border-emerald-500/15">
                            <CardContent className="space-y-4 p-5 md:p-6">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-emerald-500" />
                                    <h3 className="font-medium">Acesso ao portal</h3>
                                </div>

                                <div className="flex items-center justify-between rounded-xl border p-4">
                                    <div className="space-y-1 pr-4">
                                        <p className="text-sm font-medium">
                                            {initialData?.partner_user ? "Manter acesso ao portal" : "Criar acesso agora"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            O parceiro acessa apenas o portal dele, sem entrar na área interna.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={form.criar_acesso}
                                        onCheckedChange={(checked) => update("criar_acesso", checked)}
                                    />
                                </div>

                                {form.criar_acesso && (
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email_acesso">E-mail de acesso</Label>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="email_acesso"
                                                    type="email"
                                                    className="pl-9"
                                                    placeholder="portal@parceiro.com.br"
                                                    value={form.email_acesso}
                                                    onChange={(e) => update("email_acesso", e.target.value)}
                                                    disabled={Boolean(initialData?.partner_user?.id)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="nome_acesso">Nome do acesso</Label>
                                                <div className="relative">
                                                    <UserCog className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="nome_acesso"
                                                        className="pl-9"
                                                        placeholder="Nome do usuário parceiro"
                                                        value={form.nome_acesso}
                                                        onChange={(e) => update("nome_acesso", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="telefone_acesso">Telefone do acesso</Label>
                                                <div className="relative">
                                                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="telefone_acesso"
                                                        className="pl-9"
                                                        placeholder="(11) 99999-9999"
                                                        value={form.telefone_acesso}
                                                        onChange={(e) =>
                                                            update("telefone_acesso", maskPhone(e.target.value))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl border p-4">
                                            <div className="space-y-1 pr-4">
                                                <p className="text-sm font-medium">Acesso ativo</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Você pode deixar cadastrado agora e liberar depois.
                                                </p>
                                            </div>
                                            <Switch
                                                checked={form.acesso_ativo}
                                                onCheckedChange={(checked) => update("acesso_ativo", checked)}
                                            />
                                        </div>

                                        <div className="rounded-2xl border bg-muted/30 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-emerald-500" />
                                                <p className="text-sm font-medium">Permissões do portal</p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-4 rounded-xl border bg-background p-4">
                                                    <div>
                                                        <p className="text-sm font-medium">Ver contratos</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Consulta dos contratos vinculados à parceria.
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={form.can_view_contracts}
                                                        onCheckedChange={(checked) =>
                                                            update("can_view_contracts", checked)
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between gap-4 rounded-xl border bg-background p-4">
                                                    <div>
                                                        <p className="text-sm font-medium">Ver comissões</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Consulta dos repasses e lançamentos vinculados.
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={form.can_view_commissions}
                                                        onCheckedChange={(checked) =>
                                                            update("can_view_commissions", checked)
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between gap-4 rounded-xl border bg-background p-4">
                                                    <div>
                                                        <p className="text-sm font-medium">Ver dados do cliente</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Habilite apenas quando a operação realmente exigir.
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={form.can_view_client_data}
                                                        onCheckedChange={(checked) =>
                                                            update("can_view_client_data", checked)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <div className="flex items-start gap-3">
                                <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Como esse cadastro funciona</p>
                                    <p className="text-xs text-muted-foreground">
                                        O parceiro pertence à sua organização. O acesso ao portal é opcional
                                        e permite apenas a visualização do que estiver vinculado à parceria.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error ? (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        ) : null}
                    </div>

                    <SheetFooter className="mt-6 px-1 md:px-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                            <Save className="h-4 w-4" />
                            {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar parceiro"}
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}