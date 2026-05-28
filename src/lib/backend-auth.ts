import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/server";

type SupabaseUserMetadata = {
    org_id?: string;
};

export async function getBackendAuthContext() {
    const supabase = await supabaseServer();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (userError || !user || !session?.access_token) {
        throw new Error("Sessao invalida");
    }

    const profile = await getCurrentProfile();
    let orgId = profile?.orgId;

    if (!orgId) {
        const userMetadata = user.user_metadata as SupabaseUserMetadata | undefined;
        const appMetadata = user.app_metadata as SupabaseUserMetadata | undefined;

        orgId =
            userMetadata?.org_id ||
            appMetadata?.org_id ||
            null;
    }

    if (!orgId) {
        throw new Error("Org nao encontrada no contexto");
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
        throw new Error("NEXT_PUBLIC_BACKEND_URL nao definido");
    }

    return {
        token: session.access_token,
        backendUrl,
        orgId,
    };
}
