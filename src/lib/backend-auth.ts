import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/server";

export async function getBackendAuthContext() {
    const supabase = await supabaseServer();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("Sessão inválida");
    }

    const profile = await getCurrentProfile();

    let orgId = profile?.orgId;

    if (!orgId) {
        const user = session.user;

        orgId =
            (user?.user_metadata as any)?.org_id ||
            (user?.app_metadata as any)?.org_id ||
            null;
    }

    if (!orgId) {
        throw new Error("Org não encontrada no contexto");
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
        throw new Error("NEXT_PUBLIC_BACKEND_URL não definido");
    }

    return {
        token: session.access_token,
        backendUrl,
        orgId,
    };
}