import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest, { params }: { params: Promise<{ publicHash: string }> }) {
  const { publicHash } = await params;
  const response = await fetch(`${BACKEND_URL}/seguros/azos/p/${encodeURIComponent(publicHash)}/interesse`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("user-agent") ?? "" },
    body: JSON.stringify({ origem: "pagina_publica_seguro" }),
  });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
}
