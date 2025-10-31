"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ value, className }: { value: string; className?: string }) {
    const [ok, setOk] = useState(false);
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className={className}
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(value ?? "");
                    setOk(true);
                    setTimeout(() => setOk(false), 1200);
                } catch {}
            }}
            title="Copiar"
        >
            {ok ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
}
