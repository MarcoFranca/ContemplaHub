import { redirect } from "next/navigation";

/**
 * /app/financeiro → redireciona para o hub de comissões.
 * O panorama financeiro vive agora em /app/comissoes (Dashboard tab).
 */
export default function FinanceiroRootPage() {
    redirect("/app/comissoes");
}
