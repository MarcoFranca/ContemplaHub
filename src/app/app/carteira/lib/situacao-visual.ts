/**
 * Estilo visual compartilhado por situação da cota.
 * - Cancelada: vermelho (rose)
 * - Contemplada: dourado (amber)
 * Usado na Carteira (lista de cartas), na lista de Clientes e no painel de cotas do cliente
 * para reconhecer o estado da cota de bater o olho.
 */
export function situacaoVisual(situacao?: string | null) {
    const s = (situacao ?? "").toLowerCase();
    const cancelada = s === "cancelada" || s === "cancelado";
    const contemplada = s === "contemplada" || s === "contemplado";
    return {
        cancelada,
        contemplada,
        /** classes para o Badge de status */
        badgeClass: cancelada
            ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
            : contemplada
                ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                : "",
        /** classes de borda/fundo para o card/linha */
        cardClass: cancelada
            ? "border-rose-500/30 bg-rose-500/[0.05]"
            : contemplada
                ? "border-amber-400/25 bg-amber-400/[0.06]"
                : "",
    };
}
