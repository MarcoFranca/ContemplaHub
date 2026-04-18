"use client"

import { Button } from "@/components/ui/button"

export function ContratoFormFooter({
                                       onSubmit,
                                       loading,
                                   }: {
    onSubmit: () => void
    loading?: boolean
}) {
    return (
        <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end">
            <Button onClick={onSubmit} disabled={loading}>
                {loading ? "Salvando..." : "Cadastrar carta"}
            </Button>
        </div>
    )
}