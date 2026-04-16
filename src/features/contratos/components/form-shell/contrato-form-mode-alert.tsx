import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ContratoFormModeAlert({
  mode,
}: {
  mode: "fromLead" | "registerExisting";
}) {
  if (mode === "fromLead") {
    return (
      <Alert className="border-blue-400/20 bg-blue-500/10 text-slate-100">
        <AlertTitle className="text-white">Modo venda nova</AlertTitle>
        <AlertDescription className="text-slate-300">
          Este fluxo nasceu para formalização comercial. A carta entra como nova venda e os estados avançados ficam para a evolução posterior.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-400/20 bg-amber-500/10 text-slate-100">
      <AlertTitle className="text-white">Modo carteira / contrato já existente</AlertTitle>
      <AlertDescription className="text-slate-300">
        Use quando o cliente já estiver ativo e a carta já fizer parte do operacional. Aqui você pode definir parceiro, situação inicial e documento.
      </AlertDescription>
    </Alert>
  );
}
