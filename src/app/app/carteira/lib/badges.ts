export function contratoBadgeVariant(status?: string | null) {
    switch (status) {
        case "alocado":
            return "default";
        case "pendente_pagamento":
            return "secondary";
        case "pendente_assinatura":
            return "outline";
        case "contemplado":
            return "default";
        case "cancelado":
            return "destructive";
        default:
            return "outline";
    }
}