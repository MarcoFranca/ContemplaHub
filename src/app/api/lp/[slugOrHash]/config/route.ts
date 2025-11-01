import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const srv = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );

export async function GET(_: Request, ctx: { params: { slugOrHash: string } }) {
    try {
        const key = ctx.params.slugOrHash;
        if (!key) return NextResponse.json({ error: "Parâmetro ausente" }, { status: 400 });

        const s = srv();
        // tenta por slug
        let { data, error } = await s
            .from("landing_pages")
            .select("id, slug, public_hash, active, utm_defaults, org_id")
            .eq("slug", key)
            .limit(1);

        if (error) throw error;
        if (!data?.length) {
            // tenta por hash
            const r2 = await s
                .from("landing_pages")
                .select("id, slug, public_hash, active, utm_defaults, org_id")
                .eq("public_hash", key)
                .limit(1);
            if (r2.error) throw r2.error;
            data = r2.data;
        }

        const lp = data?.[0];
        if (!lp || !lp.active) {
            return NextResponse.json({ error: "LP não encontrada/ativa" }, { status: 404 });
        }

        const org = await s.from("orgs").select("id, nome, slug").eq("id", lp.org_id).single();
        if (org.error) throw org.error;

        return NextResponse.json({
            landing: {
                id: lp.id,
                slug: lp.slug,
                public_hash: lp.public_hash,
                active: lp.active,
                utm_defaults: lp.utm_defaults ?? {},
            },
            org: org.data,
            leads_endpoint: `${process.env.NEXT_PUBLIC_SITE_URL}/api/leads`,
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro inesperado";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
