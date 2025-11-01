"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type Map = Record<string, string>;

const labels: Map = {
    created: "Landing Page criada com sucesso!",
    toggled_on: "Landing Page ativada.",
    toggled_off: "Landing Page desativada.",
    hash: "Novo hash público gerado.",
    deleted: "Landing Page excluída.",
    saved_domains: "Domínios permitidos atualizados.",
    rotated_secret: "Webhook secret rotacionado.",
};

export function ToastAnnouncer() {
    const sp = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const key = sp.get("toast");
        if (!key) return;
        const msg = labels[key] ?? key;
        toast.success(msg);
        // limpa o query param sem recarregar
        const url = new URL(window.location.href);
        url.searchParams.delete("toast");
        router.replace(url.pathname + (url.search ? url.search : "") + url.hash);
    }, [sp, router]);

    return null;
}
