export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import {
  Handshake,
  Plus,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/server";
import { listParceirosAction, listPartnerUsersAction } from "./actions";
import { ParceirosTable } from "./components/ParceirosTable";
import { ParceiroSheet } from "./components/ParceiroSheet";
import type { ParceiroWithAccess, PartnerUser } from "./types";

export default async function ParceirosPage() {
  const me = await getCurrentProfile();

  if (!me?.orgId) {
    return <main className="p-6">Vincule-se a uma organização.</main>;
  }

  const [parceiros, acessos] = await Promise.all([
    listParceirosAction(),
    listPartnerUsersAction(),
  ]);

  const acessosByParceiroId = new Map<string, PartnerUser>(
      acessos.map((item) => [item.parceiro_id, item])
  );

  const data: ParceiroWithAccess[] = parceiros.map((item) => ({
    ...item,
    partner_user: acessosByParceiroId.get(item.id),
  }));

  const ativos = parceiros.filter((item) => item.ativo).length;
  const acessosAtivos = acessos.filter((item) => item.ativo).length;

  return (
      <div className="h-full overflow-y-auto space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Parceiros</h1>
            <p className="text-sm text-muted-foreground">
              Cadastre parceiros de negócio, controle acessos ao portal e acompanhe
              a operação comercial com mais organização.
            </p>
          </div>

          <ParceiroSheet
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo parceiro
                </Button>
              }
          />
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Card className="border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total de parceiros</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-2xl font-semibold">
              <Users className="h-5 w-5 text-emerald-500" />
              {parceiros.length}
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Parceiros ativos</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-2xl font-semibold">
              <Handshake className="h-5 w-5 text-emerald-500" />
              {ativos}
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Acessos liberados</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-2xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              {acessos.length}
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Acessos ativos</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-2xl font-semibold">
              <UserRoundCheck className="h-5 w-5 text-emerald-500" />
              {acessosAtivos}
            </CardContent>
          </Card>
        </div>

        <ParceirosTable data={data} />
      </div>
  );
}