import { Badge } from "@/components/ui/badge";

export function ParceiroStatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <Badge variant={ativo ? "default" : "secondary"} className={ativo ? "bg-emerald-600 hover:bg-emerald-600" : ""}>
      {ativo ? "Ativo" : "Inativo"}
    </Badge>
  );
}
