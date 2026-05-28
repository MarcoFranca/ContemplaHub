import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend";
import { getBackendAuthContext } from "@/app/app/lances/actions/backend";

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
    const auth = await getBackendAuthContext().catch(() => null);

    if (!auth?.orgId || !auth.accessToken) {
        return NextResponse.json({ error: "Sessao invalida." }, { status: 401 });
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
                "X-Org-Id": auth.orgId,
                Authorization: `Bearer ${auth.accessToken}`,
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
