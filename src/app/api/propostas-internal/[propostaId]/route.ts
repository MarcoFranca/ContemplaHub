import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ propostaId: string }> }
) {
    const { propostaId } = await ctx.params;

    const profile = await getCurrentProfile().catch(() => null);
    const orgId = profile?.orgId;

    if (!orgId) {
        return NextResponse.json({ error: "Org inválida" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/lead-propostas/${encodeURIComponent(propostaId)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Org-Id": String(orgId),
        },
        cache: "no-store",
    });

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