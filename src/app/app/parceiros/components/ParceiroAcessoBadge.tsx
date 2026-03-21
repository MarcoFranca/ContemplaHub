import { Badge } from "@/components/ui/badge";
import type { ParceiroAcesso } from "../types";

export function ParceiroAcessoBadge({
                                        acesso,
                                    }: {
    acesso?: ParceiroAcesso;
}) {
    if (!acesso) {
        return <Badge variant="outline">Sem acesso</Badge>;
    }

    if (!acesso.ativo) {
        return <Badge variant="secondary">Acesso inativo</Badge>;
    }

    if (acesso.auth_user_id) {
        return (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
                Acesso ativo
            </Badge>
        );
    }

    return <Badge variant="outline">Convite enviado</Badge>;
}