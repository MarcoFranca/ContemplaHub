import {LogoutButton} from "@/components/auth/LogoutButton";

type Props = {
    partnerName?: string | null;
};

export function PartnerHeader({ partnerName }: Props) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Portal do parceiro
                </div>
                <div className="truncate text-sm font-medium">
                    {partnerName ? `Olá, ${partnerName}` : "Bem-vindo"}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <LogoutButton className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition"/>
            </div>
        </header>
    );
}