import { FolderOpenDot } from "lucide-react";

type EmptyStateProps = {
    title?: string;
    message: string;
};

export function EmptyState({
                               title = "Nada por aqui ainda",
                               message,
                           }: EmptyStateProps) {
    return (
        <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <FolderOpenDot className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                {message}
            </p>
        </div>
    );
}