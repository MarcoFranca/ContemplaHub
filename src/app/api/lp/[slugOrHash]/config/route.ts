// src/app/api/lp/[slugOrHash]/config/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function srv() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ slugOrHash: string }> }
) {
    try {
        const { slugOrHash } = await context.params;
        const key = (slugOrHash ?? "").trim();

        if (!key) {
            return NextResponse.json({ error: "Parâmetro ausente" }, { status: 400 });
        }

        const s = srv();

        // 1) Tenta por slug
        let { data: lp, error: err } = await s
            .from("landing_pages")
            .select("id, slug, public_hash, active, utm_defaults, org_id")
            .eq("slug", key)
            .maybeSingle();

        // 2) Se não achou, tenta por public_hash
        if (!lp && !err) {
            const r2 = await s
                .from("landing_pages")
                .select("id, slug, public_hash, active, utm_defaults, org_id")
                .eq("public_hash", key)
                .maybeSingle();
            lp = r2.data;
            err = r2.error;
        }

        if (err) throw err;
        if (!lp || !lp.active) {
            return NextResponse.json({ error: "LP não encontrada/ativa" }, { status: 404 });
        }

        // 3) Busca org
        const { data: org, error: oErr } = await s
            .from("orgs")
            .select("id, nome, slug")
            .eq("id", lp.org_id)
            .single();

        if (oErr) throw oErr;

        return NextResponse.json({
            landing: {
                id: lp.id,
                slug: lp.slug,
                public_hash: lp.public_hash,
                active: lp.active,
                utm_defaults: lp.utm_defaults ?? {},
            },
            org,
            leads_endpoint: `${process.env.NEXT_PUBLIC_SITE_URL}/api/leads`,
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro inesperado";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
