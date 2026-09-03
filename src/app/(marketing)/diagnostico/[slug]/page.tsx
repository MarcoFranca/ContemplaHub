export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { DiagnosticoFunnel } from "./DiagnosticoFunnel";

function srv() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
    });
}

async function resolveLanding(key: string) {
    const s = srv();
    let { data: lp } = await s
        .from("landing_pages")
        .select("id, slug, public_hash, active, org_id")
        .eq("slug", key)
        .maybeSingle();
    if (!lp) {
        const r2 = await s
            .from("landing_pages")
            .select("id, slug, public_hash, active, org_id")
            .eq("public_hash", key)
            .maybeSingle();
        lp = r2.data;
    }
    if (!lp) return null;
    const { data: org } = await s
        .from("orgs")
        .select("nome, whatsapp_phone, brand")
        .eq("id", lp.org_id)
        .maybeSingle();
    return { lp, org };
}

function AvisoIndisponivel({ titulo, texto }: { titulo: string; texto: string }) {
    return (
        <main
            className="flex min-h-screen items-center justify-center px-6"
            style={{ background: "#f4f5f7", color: "#0f172a" }}
        >
            <div className="max-w-md text-center">
                <h1 className="text-2xl font-bold">{titulo}</h1>
                <p className="mt-2 text-neutral-500">{texto}</p>
            </div>
        </main>
    );
}

export default async function DiagnosticoPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const key = (slug ?? "").trim();
    const found = await resolveLanding(key);

    if (!found) {
        return (
            <AvisoIndisponivel
                titulo="Diagnóstico não encontrado"
                texto="Confira o link com quem te enviou este formulário."
            />
        );
    }
    if (!found.lp.active) {
        return (
            <AvisoIndisponivel
                titulo="Diagnóstico indisponível"
                texto="Este formulário está temporariamente desativado."
            />
        );
    }

    const brand = (found.org?.brand ?? {}) as { accent?: string; logo_url?: string };

    return (
        <DiagnosticoFunnel
            slug={key}
            orgNome={found.org?.nome ?? "nossa equipe"}
            orgWhatsapp={found.org?.whatsapp_phone ?? null}
            accent={typeof brand.accent === "string" ? brand.accent : null}
        />
    );
}
