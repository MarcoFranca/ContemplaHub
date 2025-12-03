// src/app/api/cadastro/[token]/pf/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
) {
    const { token } = await params;

    const body = await req.json();

    const res = await fetch(
        `${BACKEND_URL}/lead-cadastros/p/${encodeURIComponent(token)}/pf`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        },
    );

    const text = await res.text();

    return new NextResponse(text, {
        status: res.status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
