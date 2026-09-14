export type ContratoComCota = {
    id: string;
    cota_id: string | null;
};

export type LancamentoComissaoVinculo = {
    contrato_id: string | null;
    cota_id: string | null;
    beneficiario_tipo: string | null;
};

type SupabasePage<T> = {
    data: T[] | null;
    error: { message: string } | null;
};

const SUPABASE_PAGE_SIZE = 1000;

export async function collectSupabasePages<T>(
    fetchPage: (from: number, to: number) => PromiseLike<SupabasePage<T>>
): Promise<T[]> {
    const rows: T[] = [];

    for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
        const result = await fetchPage(from, from + SUPABASE_PAGE_SIZE - 1);
        if (result.error) throw new Error(result.error.message);

        const page = result.data ?? [];
        rows.push(...page);
        if (page.length < SUPABASE_PAGE_SIZE) break;
    }

    return rows;
}

export function getContratosSemLancamentoEmpresa<T extends ContratoComCota>(
    contratos: readonly T[],
    lancamentos: readonly LancamentoComissaoVinculo[]
): T[] {
    const contratoIds = new Set<string>();
    const cotaIdsDeLancamentosSemContrato = new Set<string>();

    for (const lancamento of lancamentos) {
        if (lancamento.beneficiario_tipo !== "empresa") continue;
        if (lancamento.contrato_id) {
            contratoIds.add(lancamento.contrato_id);
        } else if (lancamento.cota_id) {
            cotaIdsDeLancamentosSemContrato.add(lancamento.cota_id);
        }
    }

    return contratos.filter(
        (contrato) =>
            !contratoIds.has(contrato.id) &&
            (!contrato.cota_id || !cotaIdsDeLancamentosSemContrato.has(contrato.cota_id))
    );
}
