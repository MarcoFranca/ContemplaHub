import { getCurrentProfile } from "@/lib/auth/server";
import { AzosPortfolioView } from "@/features/seguros-azos/AzosPortfolio";
import { getAzosPortfolioAction } from "@/features/seguros-azos/portfolio-actions";

export const dynamic = "force-dynamic";

export default async function SegurosAzosPage() {
  const profile = await getCurrentProfile();
  if (!profile?.orgId) return <main className="p-6">Vincule-se a uma organização.</main>;
  const portfolio = await getAzosPortfolioAction();
  return <AzosPortfolioView portfolio={portfolio} />;
}
