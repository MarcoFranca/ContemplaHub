// src/app/api/lead-propostas/lead/[leadId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server"; // se estiver usando
const BACKEND_URL =
    process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export async function POST(
    req: NextRequest,
    ctx: { params: Promise<{ leadId: string }> }
) {
    // 👇 DESENPACOTA o params (Next 15)
    const { leadId } = await ctx.params;

    const body = await req.json();

    // se quiser repassar org/user para o backend:
    const profile = await getCurrentProfile().catch(() => null);
    const orgId = profile?.orgId;
    const userId = profile?.userId;

    const backendRes = await fetch(
        `${BACKEND_URL}/lead-propostas/lead/${encodeURIComponent(leadId)}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(orgId ? { "X-Org-Id": String(orgId) } : {}),
                ...(userId ? { "X-User-Id": String(userId) } : {}),
            },
            body: JSON.stringify(body),
        }
    );

    let data: unknown = null;
    try {
        data = await backendRes.json();
    } catch {
        // se o backend devolver vazio, evita estourar aqui
        data = null;
    }

    return new NextResponse(JSON.stringify(data), {
        status: backendRes.status,
        headers: { "Content-Type": "application/json" },
    });
}
