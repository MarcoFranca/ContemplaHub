export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getCurrentProfile } from "@/lib/auth/server";
import { getParceirosRankingAction } from "../actions";
import { ParceirosRankingView } from "../components/ParceirosRankingView";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Converte um intervalo de meses (YYYY-MM) em datas (primeiro/último dia). */
function periodRange(deMes: string, ateMes: string) {
  // garante de <= ate
  const [deM, ateM] = deMes <= ateMes ? [deMes, ateMes] : [ateMes, deMes];
  const [y, m] = ateM.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return { de: `${deM}-01`, ate: `${ateM}-${String(last).padStart(2, "0")}` };
}

export default async function ParceirosGerencialPage({ searchParams }: PageProps) {
  const me = await getCurrentProfile();
  if (!me?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;

  const sp = searchParams ? await searchParams : {};
  const legacyMes = getParam(sp.mes); // compatibilidade com links antigos
  const deMes = getParam(sp.de) || legacyMes || currentMonth();
  const ateMes = getParam(sp.ate) || legacyMes || deMes;
  const { de, ate } = periodRange(deMes, ateMes);

  const ranking = await getParceirosRankingAction(de, ate).catch(() => null);

  return (
    <div className="h-full overflow-y-auto">
      <main className="space-y-6 p-6">
        <ParceirosRankingView
          de={deMes <= ateMes ? deMes : ateMes}
          ate={deMes <= ateMes ? ateMes : deMes}
          items={ranking?.items ?? []}
        />
      </main>
    </div>
  );
}
