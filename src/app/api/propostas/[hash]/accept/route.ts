// src/app/api/propostas/[hash]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ hash: string }> }
) {
    const { hash } = await params;

    // captura IP a partir dos headers (padrão atrás de proxy)
    const ipHeader =
        req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
    const ip = ipHeader?.split(",")[0]?.trim() ?? "";

    const userAgent = req.headers.get("user-agent") ?? "";

    const backendRes = await fetch(
        `${BACKEND_URL}/lead-propostas/p/${encodeURIComponent(hash)}/accept`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                source: "public_proposal_page",
                ip,
                user_agent: userAgent,
            }),
        }
    );

    const text = await backendRes.text();

    return new NextResponse(text, {
        status: backendRes.status,
        headers: { "Content-Type": "application/json" },
    });
}
