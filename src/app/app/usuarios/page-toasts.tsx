"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function PageToasts({ ok, err }: { ok?: string; err?: string }) {
    useEffect(() => {
        if (ok) {
            const msg =
                ok === "created" ? "Usuário criado."
                    : ok === "role-updated" ? "Função atualizada."
                        : ok === "invited" ? "Convite reenviado."
                            : ok === "removed" ? "Usuário removido."
                                : "Ação concluída.";
            toast.success(msg);
        }
        if (err) {
            toast.error(decodeURIComponent(err));
        }
    }, [ok, err]);

    return null;
}
