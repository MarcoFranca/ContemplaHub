import { Suspense } from "react";
import { AuthCallbackClient } from "./AuthCallbackClient";

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center p-6">
                    <div className="w-full max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
                        <h1 className="text-lg font-semibold">Concluindo acesso</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Validando acesso...
                        </p>
                    </div>
                </main>
            }
        >
            <AuthCallbackClient />
        </Suspense>
    );
}