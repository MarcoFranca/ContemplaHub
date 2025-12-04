// src/app/api/cadastro/[token]/pf/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://contemplahubback-production.up.railway.app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    // /api/cadastro/gxMEHo2s4g/pf -> ["", "api", "cadastro", "gxMEHo2s4g", "pf"]
    const segments = pathname.split("/");
    const token = segments[3];

    console.log("[API cadastro PF] pathname:", pathname);
    console.log("[API cadastro PF] token resolvido:", token);

    if (!token) {
        console.error(
            "[API cadastro PF] token NÃO encontrado na URL"
        );
        return NextResponse.json(
            { detail: "Token ausente na rota API (pf-handler)." },
            { status: 400 }
        );
    }

    const body = await req.json();
    console.log("[API cadastro PF] body recebido:", body);

    const url = `${BACKEND_URL}/lead-cadastros/p/${encodeURIComponent(
        token
    )}/pf`;
    console.log("[API cadastro PF] chamando backend URL:", url);

    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log(
        "[API cadastro PF] resposta backend status:",
        res.status,
        "body:",
        text
    );

    return new NextResponse(text, {
        status: res.status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
