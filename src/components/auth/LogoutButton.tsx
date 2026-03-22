"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

type Props = {
    className?: string;
    variant?: "ghost" | "outline" | "default" | "destructive" | "secondary" | "link";
};

export function LogoutButton({
                                 className,
                                 variant = "ghost",
                             }: Props) {
    const [pending, startTransition] = useTransition();

    return (
        <Button
            type="button"
            variant={variant}
            className={className}
            disabled={pending}
            onClick={() => {
                startTransition(async () => {
                    await signOutAction();
                });
            }}
        >
            <LogOut className="mr-2 h-4 w-4" />
            {pending ? "Saindo..." : "Sair"}
        </Button>
    );
}