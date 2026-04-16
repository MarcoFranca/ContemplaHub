"use client";

import Link from "next/link";
import {
    Eye,
    FilePlus2,
    MoreHorizontal,
    RefreshCcw,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { DeleteLeadButton } from "@/app/app/leads/ui/DeleteLeadButton";
import { CreateCarteiraCartaSheet } from "@/app/app/carteira/ui/CreateCarteiraCartaSheet";
import { startClientNegotiationAction } from "../actions";

type Option = {
    id: string;
    nome: string;
};

type ClienteRowActionsProps = {
    clienteId: string;
    clienteNome: string;
    clienteTelefone?: string;
    clienteEmail?: string;
    compact?: boolean;
    administradoras: Option[];
    parceiros?: Option[];
};

function IconAction({
                        label,
                        children,
                    }: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

export function ClienteRowActions({
                                      clienteId,
                                      clienteNome,
                                      clienteTelefone,
                                      clienteEmail,
                                      compact = false,
                                      administradoras,
                                      parceiros = [],
                                  }: ClienteRowActionsProps) {
    const iconClass = compact ? "h-8 w-8" : "h-9 w-9";

    return (
        <div className="flex items-center justify-end gap-1.5">
            <IconAction label="Ver cliente">
                <Link href={`/app/leads/${clienteId}`}>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className={`${iconClass} rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]`}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
            </IconAction>

            <IconAction label="Cadastrar carta">
                <div>
                    <CreateCarteiraCartaSheet
                        clientes={[
                            {
                                id: clienteId,
                                nome: clienteNome,
                                telefone: clienteTelefone,
                                email: clienteEmail,
                            },
                        ]}
                        administradoras={administradoras}
                        parceiros={parceiros}
                        clienteId={clienteId}
                        triggerLabel=""
                        triggerVariant="ghost"
                        triggerClassName={`${iconClass} rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-200`}
                        triggerIcon={<FilePlus2 className="h-4 w-4" />}
                    />
                </div>
            </IconAction>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className={`${iconClass} rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]`}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-56 border-white/10 bg-slate-950/95 backdrop-blur-xl"
                >
                    <DropdownMenuItem asChild>
                        <Link href={`/app/leads/${clienteId}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Abrir cliente
                        </Link>
                    </DropdownMenuItem>

                    <div className="px-2 py-1">
                        <CreateCarteiraCartaSheet
                            clientes={[
                                {
                                    id: clienteId,
                                    nome: clienteNome,
                                    telefone: clienteTelefone,
                                    email: clienteEmail,
                                },
                            ]}
                            administradoras={administradoras}
                            parceiros={parceiros}
                            clienteId={clienteId}
                            triggerLabel="Cadastrar nova carta"
                            triggerVariant="ghost"
                            triggerClassName="h-9 w-full justify-start rounded-md px-2 text-sm hover:bg-accent hover:text-accent-foreground"
                            triggerIcon={<FilePlus2 className="mr-2 h-4 w-4" />}
                        />
                    </div>

                    <DropdownMenuSeparator />

                    <form action={startClientNegotiationAction}>
                        <input type="hidden" name="leadId" value={clienteId} />
                        <button
                            type="submit"
                            className="flex w-full items-center px-2 py-2 text-sm hover:bg-accent"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Nova negociação
                        </button>
                    </form>

                    <DropdownMenuSeparator />

                    <div className="px-2 py-1">
                        <DeleteLeadButton leadId={clienteId} leadName={clienteNome} />
                    </div>

                    <div className="px-3 pb-2 pt-1 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            A exclusão remove o lead e vínculos relacionados.
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}