// src/components/SignOutButton.tsx
"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
    const router = useRouter();

    async function handleLogout() {
        const supabase = supabaseBrowser();

        await supabase.auth.signOut();

        router.replace("/login");
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
        >
            <LogOut className="h-4 w-4" />
            Sair
        </Button>
    );
}