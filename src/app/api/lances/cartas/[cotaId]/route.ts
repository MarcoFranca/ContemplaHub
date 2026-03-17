import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { getBackendUrl } from "@/lib/backend";
import { supabaseServer } from "@/lib/supabase/server";

function getCompetenciaDefault() {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    return `${ano}-${mes}-01`;
}

export async function GET(
    req: NextRequest,
    ctx: { params: Promise<{ cotaId: string }> }
) {
    const { cotaId } = await ctx.params;

    const profile = await getCurrentProfile().catch(() => null);
    if (!profile?.orgId) {
        return NextResponse.json({ error: "Organização inválida." }, { status: 401 });
    }

    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    if (!accessToken) {
        return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    const competencia =
        req.nextUrl.searchParams.get("competencia") || getCompetenciaDefault();

    const baseUrl = getBackendUrl();
    const res = await fetch(
        `${baseUrl}/lances/cartas/${cotaId}?competencia=${encodeURIComponent(competencia)}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Org-Id": profile.orgId,
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        }
    );

    let data: unknown = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }

    return new NextResponse(JSON.stringify(data), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}