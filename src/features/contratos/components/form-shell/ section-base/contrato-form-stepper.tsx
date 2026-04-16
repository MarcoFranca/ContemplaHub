"use client"

export function ContratoFormStepper({
                                        steps,
                                        current,
                                    }: {
    steps: string[]
    current: number
}) {
    return (
        <div className="flex gap-2">
            {steps.map((step, index) => (
                <div
                    key={step}
                    className={`flex-1 h-2 rounded-full ${
                        index <= current
                            ? "bg-primary"
                            : "bg-muted"
                    }`}
                />
            ))}
        </div>
    )
}