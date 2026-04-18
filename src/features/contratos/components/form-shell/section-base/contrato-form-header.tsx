"use client"

export function ContratoFormHeader({ mode }: { mode: string }) {
    return (
        <div className="space-y-1">
            <h2 className="text-xl font-semibold">
                {mode === "registerExisting"
                    ? "Cadastrar carta existente"
                    : "Nova carta de consórcio"}
            </h2>

            <p className="text-sm text-muted-foreground">
                Preencha as informações da carta e do contrato
            </p>
        </div>
    )
}