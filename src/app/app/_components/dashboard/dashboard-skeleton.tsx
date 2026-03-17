export function DashboardSkeleton({ title }: { title: string }) {
    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-64 animate-pulse rounded bg-muted" />
            </div>

            <div className="grid gap-3">
                <div className="h-16 animate-pulse rounded-xl bg-muted" />
                <div className="h-16 animate-pulse rounded-xl bg-muted" />
                <div className="h-16 animate-pulse rounded-xl bg-muted" />
            </div>

            <span className="sr-only">Carregando {title}</span>
        </div>
    );
}
