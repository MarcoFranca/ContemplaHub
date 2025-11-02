"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export function SearchUsers({ initialValue = "" }: { initialValue?: string }) {
    const [q, setQ] = useState(initialValue);
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => { setQ(initialValue); }, [initialValue]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const sp = new URLSearchParams(params.toString());
                q ? sp.set("q", q) : sp.delete("q");
                sp.delete("page");
                router.push(`/app/usuarios?${sp.toString()}`);
            }}
            className="hidden md:block"
        >
            <Input
                placeholder="Buscar por nome/e-mail"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-[260px]"
            />
        </form>
    );
}
