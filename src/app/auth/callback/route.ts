// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.redirect(new URL("/app", process.env.NEXT_PUBLIC_SITE_URL));
}
