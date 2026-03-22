"use client";

import {
    Building2,
    Mail,
    PenSquare,
    Phone,
    RefreshCcw,
    ShieldCheck,
    ShieldOff,
    UserRound,
} from "lucide-react";
import { resendInviteAction, toggleParceiroAction } from "../actions";
import type { ParceiroWithAccess } from "../types";
import { ParceiroSheet } from "./ParceiroSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DeleteParceiroDialog } from "./DeleteParceiroDialog";

type Props = {
    data: ParceiroWithAccess[];
};

function formatPhone(value?: string | null) {
    if (!value) return "Não informado";
    const digits = value.replace(/\D/g, "");

    if (digits.length === 11) {
        return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    if (digits.length === 10) {
        return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return value;
}

export function ParceirosTable({ data }: Props) {
    if (!data.length) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Nenhum parceiro cadastrado</p>
                        <p className="text-sm text-muted-foreground">
                            Cadastre o primeiro parceiro para começar a controlar acessos,
                            contratos e comissões vinculadas.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {data.map((p) => (
                <Card key={p.id} className="border-emerald-500/10 transition-shadow hover:shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-semibold">{p.nome}</h3>

                                <Badge variant={p.ativo ? "default" : "secondary"}>
                                    {p.ativo ? "Parceiro ativo" : "Parceiro inativo"}
                                </Badge>

                                {p.partner_user ? (
                                    <Badge variant={p.partner_user.ativo ? "default" : "outline"}>
                                        {p.partner_user.ativo ? "Acesso ativo" : "Acesso inativo"}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Sem acesso</Badge>
                                )}
                            </div>

                            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4"/>
                                    <span>{p.email || "Sem e-mail principal"}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4"/>
                                    <span>{formatPhone(p.telefone)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <UserRound className="h-4 w-4"/>
                                    <span>{p.partner_user?.email || "Acesso ao portal não criado"}</span>
                                </div>
                            </div>

                            {p.partner_user ? (
                                <div className="flex flex-wrap gap-2">
                                    {p.partner_user.can_view_contracts ? (
                                        <Badge variant="secondary">Ver contratos</Badge>
                                    ) : null}
                                    {p.partner_user.can_view_commissions ? (
                                        <Badge variant="secondary">Ver comissões</Badge>
                                    ) : null}
                                    {p.partner_user.can_view_client_data ? (
                                        <Badge variant="secondary">Ver dados do cliente</Badge>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <ParceiroSheet
                                initialData={p}
                                trigger={
                                    <Button variant="outline" className="gap-2">
                                        <PenSquare className="h-4 w-4"/>
                                        Editar
                                    </Button>
                                }
                            />

                            <Button
                                variant={p.ativo ? "outline" : "default"}
                                className="gap-2"
                                onClick={async () => {
                                    try {
                                        await toggleParceiroAction(p.id, !p.ativo);
                                        toast.success(
                                            p.ativo
                                                ? "Parceiro desativado com sucesso."
                                                : "Parceiro ativado com sucesso."
                                        );
                                    } catch (err) {
                                        toast.error(
                                            err instanceof Error
                                                ? err.message
                                                : "Erro ao alterar status do parceiro."
                                        );
                                    }
                                }}
                            >
                                {p.ativo ? (
                                    <>
                                        <ShieldOff className="h-4 w-4"/>
                                        Desativar parceiro
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-4 w-4"/>
                                        Ativar parceiro
                                    </>
                                )}
                            </Button>

                            {p.partner_user ? (
                                <Button
                                    variant="ghost"
                                    className="gap-2"
                                    onClick={async () => {
                                        try {
                                            await resendInviteAction(p.partner_user!.id);
                                            toast.success("Convite reenviado com sucesso.");
                                        } catch (err) {
                                            toast.error(
                                                err instanceof Error
                                                    ? err.message
                                                    : "Erro ao reenviar convite."
                                            );
                                        }
                                    }}
                                >
                                    <RefreshCcw className="h-4 w-4"/>
                                    Reenviar convite
                                </Button>
                            ) : null}

                            <DeleteParceiroDialog parceiro={p}/>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}