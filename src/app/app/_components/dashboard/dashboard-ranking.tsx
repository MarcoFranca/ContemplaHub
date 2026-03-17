type SellerRankingItem = {
    user_id: string;
    nome: string;
    total_leads: number;
    total_contratos: number;
};

export function DashboardRanking({ items }: { items: SellerRankingItem[] }) {
    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-5">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Ranking comercial</h2>
                <p className="text-sm text-muted-foreground">
                    Performance por vendedor na organização.
                </p>
            </div>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                        Sem dados suficientes para ranking.
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={item.user_id} className="flex items-center justify-between rounded-xl border p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-medium">{item.nome}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.total_leads} leads • {item.total_contratos} contratos
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}