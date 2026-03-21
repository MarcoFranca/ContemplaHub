export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Handshake, ShieldCheck, UserRoundCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/server";
import { listParceirosAction, listPartnerUsersAction } from "./actions";
import { ParceirosTable } from "./components/ParceirosTable";
import type { ParceiroAcessoMap } from "./types";

export default async function ParceirosPage() {
  const me = await getCurrentProfile();
  if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

  const [parceiros, acessos] = await Promise.all([
    listParceirosAction(),
    listPartnerUsersAction(),
  ]);

  const ativos = parceiros.filter((item) => item.ativo).length;
  const acessosAtivos = acessos.filter((item) => item.ativo).length;

  const acessosByParceiroId: ParceiroAcessoMap = Object.fromEntries(
      acessos.map((item) => [item.parceiro_id, item])
  );

  return (
      <div className="h-full overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Parceiros</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre parceiros, organize a operação comercial e libere o acesso ao portal com contratos, comissões e documentos.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total de parceiros</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-2xl font-semibold">
              <Users className="h-5 w-5 text-emerald-400" />
              {parceiros.length}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Parceiros ativos</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-2xl font-semibold">
              <Handshake className="h-5 w-5 text-emerald-400" />
              {ativos}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Acessos liberados</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-2xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              {acessos.length}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Acessos ativos</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-2xl font-semibold">
              <UserRoundCheck className="h-5 w-5 text-emerald-400" />
              {acessosAtivos}
            </CardContent>
          </Card>
        </div>

        <ParceirosTable items={parceiros} acessosByParceiroId={acessosByParceiroId} />
      </div>
  );
}