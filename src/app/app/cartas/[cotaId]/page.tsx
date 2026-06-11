import { notFound, redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getContratoFormOptions } from "@/features/contratos/server/get-form-options";
import { CompletarCadastroCarta } from "./components/completar-cadastro-carta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadCota(cotaId: string, orgId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("cotas")
        .select("*")
        .eq("org_id", orgId)
        .eq("id", cotaId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function findContratoIdByCota(cotaId: string, orgId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("contratos")
        .select("id")
        .eq("org_id", orgId)
        .eq("cota_id", cotaId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
}

async function loadLead(leadId: string, orgId: string) {
    const supabase = await supabaseServer();

    const { data } = await supabase
        .from("leads")
        .select("id, nome, telefone, email")
        .eq("org_id", orgId)
        .eq("id", leadId)
        .maybeSingle();

    return data;
}

export default async function CartaPage({
    params,
}: {
    params: Promise<{ cotaId: string }>;
}) {
    const { cotaId } = await params;

    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error("Org inválida");

    const cota = await loadCota(cotaId, profile.orgId);
    if (!cota) notFound();

    const existingContratoId = await findContratoIdByCota(cotaId, profile.orgId);
    if (existingContratoId) {
        redirect(`/app/contratos/${existingContratoId}`);
    }

    const [lead, formOptions] = await Promise.all([
        cota.lead_id ? loadLead(cota.lead_id, profile.orgId) : Promise.resolve(null),
        getContratoFormOptions(),
    ]);

    return (
        <CompletarCadastroCarta
            cota={cota}
            lead={lead}
            administradoras={formOptions.administradoras}
            parceiros={formOptions.parceiros}
        />
    );
}
