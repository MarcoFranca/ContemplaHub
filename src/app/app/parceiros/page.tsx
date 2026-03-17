export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Handshake, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/server";
import { listParceirosAction } from "./actions";
import { ParceirosTable } from "./components/ParceirosTable";

export default async function ParceirosPage() {
  const me = await getCurrentProfile();
  if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

  const parceiros = await listParceirosAction();
  const ativos = parceiros.filter((item) => item.ativo).length;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Parceiros</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre corretores parceiros e prepare a base para divisão de comissionamento e controle de repasses.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total de parceiros</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-semibold"><Users className="h-5 w-5 text-emerald-400" />{parceiros.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Ativos</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-semibold"><Handshake className="h-5 w-5 text-emerald-400" />{ativos}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Inativos</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{parceiros.length - ativos}</CardContent>
        </Card>
      </div>

      <ParceirosTable items={parceiros} />
    </div>
  );
}
