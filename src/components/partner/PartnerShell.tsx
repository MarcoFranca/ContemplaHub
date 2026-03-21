// src/components/partner/PartnerShell.tsx
import { ReactNode } from "react";
import { PartnerSidebar } from "@/components/partner/PartnerSidebar";
import { PartnerHeader } from "@/components/partner/PartnerHeader";

type Props = {
    children: ReactNode;
    partnerName?: string | null;
};

export function PartnerShell({ children, partnerName }: Props) {
    return (
        <div className="flex min-h-[100dvh] bg-background text-foreground">
            <PartnerSidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <PartnerHeader partnerName={partnerName} />

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}