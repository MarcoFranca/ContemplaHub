export function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                {children}
            </div>
        </div>
    );
}