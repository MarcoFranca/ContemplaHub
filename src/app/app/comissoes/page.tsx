export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getCurrentProfile } from "@/lib/auth/server";
import { listComissaoLancamentosAction, listParceirosOptionsAction } from "./actions";
import { ComissoesShell } from "./components/ComissoesShell";

export default async function ComissoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const me = await getCurrentProfile();
  if (!me?.orgId) {
    return (
      <main className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">Vincule-se a uma organização para acessar comissões.</p>
      </main>
    );
  }

  const params = await searchParams;
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const [parceiros, data] = await Promise.all([
    listParceirosOptionsAction(),
    listComissaoLancamentosAction({
      parceiro_id: get("parceiro_id"),
      status: (get("status") as never) || "",
      repasse_status: (get("repasse_status") as never) || "",
      competencia_de: get("competencia_de"),
      competencia_ate: get("competencia_ate"),
    }),
  ]);

  return (
    <ComissoesShell
      items={data.items}
      resumo={data.resumo}
      parceiros={parceiros}
      activeTab={get("tab") ?? "operacao"}
      refreshPath="/app/comissoes"
    />
  );
}
