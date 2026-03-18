import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando carteira...
            </div>
        </div>
    );
}