import type { ContratoBaseFormValues } from "../schemas/contrato-base.schema";

export type ContratoFormMode = "fromLead" | "registerExisting";

export type ContratoStatus =
    | "pendente_assinatura"
    | "pendente_pagamento"
    | "alocado"
    | "contemplado"
    | "cancelado";

export type CotaSituacao = "ativa" | "contemplada" | "cancelada";

export type Produto = "imovel" | "auto" | "servico";

export interface AdministradoraOption {
    id: string;
    nome: string;
}

export interface ParceiroOption {
    id: string;
    nome: string;
}

export type ContratoFormValues = ContratoBaseFormValues;

export interface ContratoFormShellV2Props {
    mode: ContratoFormMode;
    leadId: string;
    dealId?: string | null;
    administradoras: AdministradoraOption[];
    parceiros?: ParceiroOption[];
    existingContractId?: string | null;
}