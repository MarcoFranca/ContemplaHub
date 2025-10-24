// src/app/api/cookies-test/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const c = await cookies();
    c.set({ name: "autentika-test", value: "ok", path: "/", httpOnly: true });
    return NextResponse.json({ set: c.get("autentika-test")?.value ?? null });
}
