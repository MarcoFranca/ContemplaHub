import { NextResponse } from "next/server";
import { resolveUserDestination } from "@/lib/auth/resolve-user-destination";

export async function GET() {
    const destination = await resolveUserDestination();
    return NextResponse.json({ destination });
}