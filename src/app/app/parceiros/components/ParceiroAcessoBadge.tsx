import { Badge } from "@/components/ui/badge";
import type { PartnerUser } from "../types";

export function ParceiroAcessoBadge({
                                        acesso,
                                    }: {
    acesso?: PartnerUser | null;
}) {
    if (!acesso) {
        return <Badge variant="outline">Sem acesso</Badge>;
    }

    if (acesso.ativo) {
        return <Badge variant="default">Acesso ativo</Badge>;
    }

    if (acesso.disabled_at) {
        return <Badge variant="secondary">Acesso desativado</Badge>;
    }

    return <Badge variant="outline">Acesso pendente</Badge>;
}