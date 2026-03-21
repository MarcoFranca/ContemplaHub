// src/app/api/partner/contracts/[contractId]/document/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { partnerBackendFetch } from "@/lib/backend-partner";

type Params = Promise<{
    contractId: string;
}>;

export async function GET(_: Request, context: { params: Params }) {
    const { contractId } = await context.params;

    const supabase = await supabaseServer();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user || !session?.access_token) {
        return NextResponse.redirect(
            new URL("/login", process.env.NEXT_PUBLIC_SITE_URL)
        );
    }

    try {
        const data = await partnerBackendFetch(
            `/partner/contracts/${contractId}/document/signed-url`,
            {
                method: "POST",
                accessToken: session.access_token,
                body: JSON.stringify({ expires_in: 300 }),
            }
        );

        const signedUrl = data?.signed_url;
        if (!signedUrl) {
            return NextResponse.json(
                { ok: false, message: "Não foi possível gerar o link do documento." },
                { status: 400 }
            );
        }

        return NextResponse.redirect(signedUrl);
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : "Erro ao baixar contrato.";

        return NextResponse.json(
            { ok: false, message },
            { status: 500 }
        );
    }
}