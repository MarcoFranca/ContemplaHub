import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ hash: string }> }  // 👈 note o Promise aqui
) {
    const { hash } = await params; // 👈 desestrutura depois de resolver o Promise

    const res = await fetch(`${BACKEND_URL}/lead-propostas/p/${encodeURIComponent(hash)}`, {
        // como é API route, sempre bom evitar cache
        cache: "no-store",
    });

    if (!res.ok) {
        return NextResponse.json(
            { error: "Proposta não encontrada" },
            { status: 404 }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
}
