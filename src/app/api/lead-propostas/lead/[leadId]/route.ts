// src/app/api/lead-propostas/lead/[leadId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

export async function GET(
    req: NextRequest,
    ctx: { params: Promise<{ leadId: string }> }
) {
    const { leadId } = await ctx.params;

    const profile = await getCurrentProfile().catch(() => null);
    const orgId = profile?.orgId;

    const res = await fetch(`${BACKEND_URL}/lead-propostas/lead/${leadId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(orgId ? { "X-Org-Id": String(orgId) } : {}),
        },
    });

    const data = await res.json();
    return new NextResponse(JSON.stringify(data), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}

export async function POST(
    req: NextRequest,
    ctx: { params: Promise<{ leadId: string }> }
) {
    const { leadId } = await ctx.params;
    const body = await req.json();

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
        data = null;
    }

    return new NextResponse(JSON.stringify(data), {
        status: backendRes.status,
        headers: { "Content-Type": "application/json" },
    });
}
