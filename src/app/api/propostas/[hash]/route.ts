import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { hash: string } }
) {
    const supabaseUrl = process.env.BACKEND_URL!;
    const res = await fetch(`${supabaseUrl}/lead-propostas/p/${params.hash}`);

    if (!res.ok) {
        return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data);
}
