import { Badge } from "@/components/ui/badge";

export function ParceiroStatusBadge({ ativo }: { ativo: boolean }) {
    if (ativo) {
        return (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
                Ativo
            </Badge>
        );
    }

    return <Badge variant="secondary">Inativo</Badge>;
}